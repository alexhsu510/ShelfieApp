import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export type GroceryItem = {
  id: number
  name: string
  barcode: string | null
  imageUrl: string | null
  listType: 'pantry' | 'shopping'
  quantity: number
  minimumQuantity: number
  unit: string
  expirationDate: string | null
  checked: boolean
  source: string
}

export type Product = {
  barcode: string
  name: string
  brand: string
  imageUrl: string
  packageSize: string
}

export type SuggestedItem = {
  key: string
  name: string
  reason: string
  pantryId: number
  checked: boolean
  suggested: true
}

const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })

export function expirationState(date: string | null) {
  if (!date) return { label: 'No date', tone: 'neutral', days: Number.POSITIVE_INFINITY }
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiration = new Date(`${date}T00:00:00`)
  const days = Math.round((expiration.getTime() - today.getTime()) / 86_400_000)
  if (days < 0) return { label: 'Expired', tone: 'danger', days }
  if (days === 0) return { label: 'Expires today', tone: 'danger', days }
  if (days <= 3) return { label: `${days} day${days === 1 ? '' : 's'} left`, tone: 'warning', days }
  return { label: dateFormatter.format(expiration), tone: 'fresh', days }
}

type GroceryContextValue = {
  items: GroceryItem[]
  loading: boolean
  error: string
  setError: (error: string) => void
  pantry: GroceryItem[]
  manualShopping: GroceryItem[]
  /** Lowercased names already on the shopping list, for de-duplicating additions. */
  shoppingNames: Set<string>
  suggestions: SuggestedItem[]
  expiring: GroceryItem[]
  shoppingCount: number
  completedSuggestions: Set<string>
  toggleSuggestion: (key: string) => void
  updateItem: (id: number, changes: Partial<GroceryItem>) => Promise<void>
  deleteItem: (id: number) => Promise<void>
  addItem: (values: Record<string, unknown>) => Promise<void>
  addToShoppingList: (item: GroceryItem) => Promise<void>
  addOpen: boolean
  addDestination: 'pantry' | 'shopping'
  addMode: AddMode
  openAdd: (destination: 'pantry' | 'shopping', mode?: AddMode) => void
  closeAdd: () => void
}

export type AddMode = 'search' | 'scan'

const GroceryContext = createContext<GroceryContextValue | null>(null)

export function GroceryProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<GroceryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [addDestination, setAddDestination] = useState<'pantry' | 'shopping'>('pantry')
  const [addMode, setAddMode] = useState<AddMode>('search')
  const [completedSuggestions, setCompletedSuggestions] = useState<Set<string>>(new Set())

  const loadItems = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/items')
      const data = (await response.json()) as { items?: GroceryItem[]; error?: string }
      if (!response.ok) throw new Error(data.error || 'Could not load your groceries.')
      setItems(data.items ?? [])
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load your groceries.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadItems()
  }, [loadItems])

  const pantry = useMemo(() => items.filter((item) => item.listType === 'pantry'), [items])
  const manualShopping = useMemo(
    () => items.filter((item) => item.listType === 'shopping'),
    [items],
  )
  const shoppingNames = useMemo(() => new Set(manualShopping.map((item) => item.name.toLowerCase())), [manualShopping])
  const suggestions = useMemo<SuggestedItem[]>(() => {
    return pantry
      .filter((item) => {
        const expiry = expirationState(item.expirationDate)
        return (item.quantity <= item.minimumQuantity || expiry.days < 0) && !shoppingNames.has(item.name.toLowerCase())
      })
      .map((item) => {
        const expiry = expirationState(item.expirationDate)
        return {
          key: `suggested-${item.id}`,
          name: item.name,
          reason: expiry.days < 0 ? 'Expired in pantry' : item.quantity === 0 ? 'Out of stock' : 'Running low',
          pantryId: item.id,
          checked: completedSuggestions.has(`suggested-${item.id}`),
          suggested: true,
        }
      })
  }, [completedSuggestions, shoppingNames, pantry])

  const expiring = useMemo(
    () => pantry.filter((item) => expirationState(item.expirationDate).days <= 3).sort((a, b) => expirationState(a.expirationDate).days - expirationState(b.expirationDate).days),
    [pantry],
  )
  const shoppingCount = manualShopping.filter((item) => !item.checked).length + suggestions.filter((item) => !item.checked).length

  const updateItem = useCallback(async (id: number, changes: Partial<GroceryItem>) => {
    setItems((current) => {
      const previous = current
      const next = current.map((item) => (item.id === id ? { ...item, ...changes } : item))
      void (async () => {
        try {
          const response = await fetch(`/api/items/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(changes),
          })
          if (!response.ok) throw new Error('Update failed.')
        } catch {
          setItems(previous)
          setError('That change did not save. Please try again.')
        }
      })()
      return next
    })
  }, [])

  const deleteItem = useCallback(async (id: number) => {
    const previous = items
    setItems((current) => current.filter((item) => item.id !== id))
    try {
      const response = await fetch(`/api/items/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Delete failed.')
    } catch {
      setItems(previous)
      setError('That item could not be removed.')
    }
  }, [items])

  const addItem = useCallback(async (values: Record<string, unknown>) => {
    const response = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
    const data = (await response.json()) as { item?: GroceryItem; error?: string }
    if (!response.ok || !data.item) throw new Error(data.error || 'Could not add that item.')
    setItems((current) => [...current, data.item as GroceryItem])
  }, [])

  /**
   * Copies a pantry record onto the shopping list. The quantity is the gap back
   * to the restock point, so a pantry item that is two short is bought two at a
   * time rather than one.
   */
  const addToShoppingList = useCallback(async (item: GroceryItem) => {
    try {
      await addItem({
        name: item.name,
        listType: 'shopping',
        quantity: Math.max(1, item.minimumQuantity - item.quantity),
        unit: item.unit,
        barcode: item.barcode ?? undefined,
        imageUrl: item.imageUrl ?? undefined,
        source: 'pantry',
      })
    } catch (addError) {
      setError(addError instanceof Error ? addError.message : 'Could not add that item to your list.')
    }
  }, [addItem])

  const toggleSuggestion = useCallback((key: string) => {
    setCompletedSuggestions((current) => {
      const next = new Set(current)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }, [])

  const openAdd = useCallback((destination: 'pantry' | 'shopping', mode: AddMode = 'search') => {
    setAddDestination(destination)
    setAddMode(mode)
    setAddOpen(true)
  }, [])

  const closeAdd = useCallback(() => setAddOpen(false), [])

  const value: GroceryContextValue = {
    items,
    loading,
    error,
    setError,
    pantry,
    manualShopping,
    shoppingNames,
    suggestions,
    expiring,
    shoppingCount,
    completedSuggestions,
    toggleSuggestion,
    updateItem,
    deleteItem,
    addItem,
    addToShoppingList,
    addOpen,
    addDestination,
    addMode,
    openAdd,
    closeAdd,
  }

  return <GroceryContext.Provider value={value}>{children}</GroceryContext.Provider>
}

export function useGrocery() {
  const context = useContext(GroceryContext)
  if (!context) throw new Error('useGrocery must be used within a GroceryProvider')
  return context
}
