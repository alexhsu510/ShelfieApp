import { createFileRoute } from '@tanstack/react-router'
import {
  AlertTriangle,
  ArrowLeft,
  Barcode,
  CalendarClock,
  Camera,
  Check,
  ChevronRight,
  CircleCheck,
  Clock3,
  Leaf,
  ListChecks,
  LoaderCircle,
  Minus,
  PackageOpen,
  Plus,
  Refrigerator,
  RotateCcw,
  ScanLine,
  Search,
  ShoppingBasket,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export const Route = createFileRoute('/')({ component: GroceryApp })

type View = 'home' | 'pantry' | 'list' | 'shop'

type GroceryItem = {
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

type Product = {
  barcode: string
  name: string
  brand: string
  imageUrl: string
  packageSize: string
}

type SuggestedItem = {
  key: string
  name: string
  reason: string
  pantryId: number
  checked: boolean
  suggested: true
}

const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })

function expirationState(date: string | null) {
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

function GroceryApp() {
  const [view, setView] = useState<View>('home')
  const [items, setItems] = useState<GroceryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [addDestination, setAddDestination] = useState<'pantry' | 'shopping'>('pantry')
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
  const suggestions = useMemo<SuggestedItem[]>(() => {
    const existingNames = new Set(manualShopping.map((item) => item.name.toLowerCase()))
    return pantry
      .filter((item) => {
        const expiry = expirationState(item.expirationDate)
        return (item.quantity <= item.minimumQuantity || expiry.days < 0) && !existingNames.has(item.name.toLowerCase())
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
  }, [completedSuggestions, manualShopping, pantry])

  const expiring = useMemo(
    () => pantry.filter((item) => expirationState(item.expirationDate).days <= 3).sort((a, b) => expirationState(a.expirationDate).days - expirationState(b.expirationDate).days),
    [pantry],
  )
  const shoppingCount = manualShopping.filter((item) => !item.checked).length + suggestions.filter((item) => !item.checked).length

  async function updateItem(id: number, changes: Partial<GroceryItem>) {
    const previous = items
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...changes } : item)))
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
  }

  async function deleteItem(id: number) {
    const previous = items
    setItems((current) => current.filter((item) => item.id !== id))
    try {
      const response = await fetch(`/api/items/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Delete failed.')
    } catch {
      setItems(previous)
      setError('That item could not be removed.')
    }
  }

  function openAdd(destination: 'pantry' | 'shopping') {
    setAddDestination(destination)
    setAddOpen(true)
  }

  async function addItem(values: Record<string, unknown>) {
    const response = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
    const data = (await response.json()) as { item?: GroceryItem; error?: string }
    if (!response.ok || !data.item) throw new Error(data.error || 'Could not add that item.')
    setItems((current) => [...current, data.item as GroceryItem])
  }

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <Header view={view} setView={setView} shoppingCount={shoppingCount} onAdd={() => openAdd('pantry')} />

      <main className="page-wrap">
        {error && (
          <div className="error-banner" role="alert">
            <AlertTriangle size={18} />
            <span>{error}</span>
            <button type="button" onClick={() => setError('')} aria-label="Dismiss error"><X size={16} /></button>
          </div>
        )}

        {loading ? (
          <LoadingState />
        ) : view === 'shop' ? (
          <ShoppingMode
            items={manualShopping}
            suggestions={suggestions}
            onBack={() => setView('list')}
            onToggle={(item) => void updateItem(item.id, { checked: !item.checked })}
            onToggleSuggestion={(key) => setCompletedSuggestions((current) => {
              const next = new Set(current)
              next.has(key) ? next.delete(key) : next.add(key)
              return next
            })}
          />
        ) : (
          <>
            <WelcomeStrip pantryCount={pantry.length} expiringCount={expiring.length} shoppingCount={shoppingCount} onScan={() => openAdd('pantry')} />
            {view === 'home' && (
              <Dashboard
                pantry={pantry}
                shopping={manualShopping}
                suggestions={suggestions}
                expiring={expiring}
                onView={setView}
                onAdd={openAdd}
                onQuantity={(item, delta) => void updateItem(item.id, { quantity: Math.max(0, item.quantity + delta) })}
                onDelete={(id) => void deleteItem(id)}
              />
            )}
            {view === 'pantry' && (
              <PantryView
                items={pantry}
                onAdd={() => openAdd('pantry')}
                onQuantity={(item, delta) => void updateItem(item.id, { quantity: Math.max(0, item.quantity + delta) })}
                onDelete={(id) => void deleteItem(id)}
              />
            )}
            {view === 'list' && (
              <ShoppingListView
                items={manualShopping}
                suggestions={suggestions}
                onAdd={() => openAdd('shopping')}
                onShop={() => setView('shop')}
                onToggle={(item) => void updateItem(item.id, { checked: !item.checked })}
                onDelete={(id) => void deleteItem(id)}
              />
            )}
          </>
        )}
      </main>

      {view !== 'shop' && (
        <button className="scan-fab" type="button" onClick={() => openAdd(view === 'list' ? 'shopping' : 'pantry')}>
          <ScanLine size={21} />
          <span>Scan item</span>
        </button>
      )}

      {addOpen && (
        <AddItemModal
          destination={addDestination}
          onClose={() => setAddOpen(false)}
          onAdded={async (values) => {
            await addItem(values)
            setAddOpen(false)
          }}
        />
      )}
    </div>
  )
}

function Header({ view, setView, shoppingCount, onAdd }: { view: View; setView: (view: View) => void; shoppingCount: number; onAdd: () => void }) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <button className="brand" type="button" onClick={() => setView('home')}>
          <span className="brand-mark"><Leaf size={23} strokeWidth={2.4} /></span>
          <span>Shelfie</span>
        </button>
        <nav className="desktop-nav" aria-label="Main navigation">
          {([
            ['home', 'Overview'],
            ['pantry', 'My pantry'],
            ['list', 'Shopping list'],
          ] as const).map(([key, label]) => (
            <button key={key} className={view === key ? 'active' : ''} type="button" onClick={() => setView(key)}>
              {label}
              {key === 'list' && shoppingCount > 0 && <span className="nav-count">{shoppingCount}</span>}
            </button>
          ))}
        </nav>
        <button className="primary-button compact" type="button" onClick={onAdd}><Plus size={17} /> Add item</button>
      </div>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        <button className={view === 'home' ? 'active' : ''} type="button" onClick={() => setView('home')}><Leaf size={18} />Home</button>
        <button className={view === 'pantry' ? 'active' : ''} type="button" onClick={() => setView('pantry')}><Refrigerator size={18} />Pantry</button>
        <button className={view === 'list' ? 'active' : ''} type="button" onClick={() => setView('list')}><ListChecks size={18} />List</button>
      </nav>
    </header>
  )
}

function WelcomeStrip({ pantryCount, expiringCount, shoppingCount, onScan }: { pantryCount: number; expiringCount: number; shoppingCount: number; onScan: () => void }) {
  return (
    <section className="welcome-strip">
      <div>
        <span className="eyebrow"><Sparkles size={14} /> Your kitchen, in sync</span>
        <h1>Good food starts<br />with a <em>clear shelf.</em></h1>
        <p>Track what you have, rescue what’s expiring, and shop without the guesswork.</p>
        <button className="primary-button hero-button" type="button" onClick={onScan}><ScanLine size={19} /> Scan a grocery</button>
      </div>
      <div className="hero-stats" aria-label="Grocery summary">
        <div><strong>{pantryCount}</strong><span>items stocked</span></div>
        <div><strong>{expiringCount}</strong><span>need attention</span></div>
        <div><strong>{shoppingCount}</strong><span>on your list</span></div>
      </div>
    </section>
  )
}

function Dashboard({ pantry, shopping, suggestions, expiring, onView, onAdd, onQuantity, onDelete }: {
  pantry: GroceryItem[]
  shopping: GroceryItem[]
  suggestions: SuggestedItem[]
  expiring: GroceryItem[]
  onView: (view: View) => void
  onAdd: (destination: 'pantry' | 'shopping') => void
  onQuantity: (item: GroceryItem, delta: number) => void
  onDelete: (id: number) => void
}) {
  return (
    <div className="dashboard-grid">
      <section className="panel pantry-panel">
        <SectionHeading icon={<Refrigerator size={18} />} title="In your pantry" caption={`${pantry.length} items`} action="See everything" onAction={() => onView('pantry')} />
        <div className="pantry-list">
          {pantry.slice(0, 5).map((item) => <PantryRow key={item.id} item={item} onQuantity={onQuantity} onDelete={onDelete} />)}
          {pantry.length === 0 && <EmptyState icon={<PackageOpen />} title="Your shelves are waiting" text="Scan or add your first pantry item." onAction={() => onAdd('pantry')} />}
        </div>
      </section>

      <div className="side-stack">
        <section className="panel attention-panel">
          <SectionHeading icon={<CalendarClock size={18} />} title="Use these next" caption="Waste less" />
          <div className="attention-list">
            {expiring.slice(0, 3).map((item) => {
              const status = expirationState(item.expirationDate)
              return (
                <div className="attention-item" key={item.id}>
                  <ItemAvatar item={item} />
                  <div><strong>{item.name}</strong><span className={`status-text ${status.tone}`}>{status.label}</span></div>
                  <ChevronRight size={17} />
                </div>
              )
            })}
            {expiring.length === 0 && <p className="quiet-note"><CircleCheck size={18} /> Nothing urgent. Nicely managed.</p>}
          </div>
        </section>

        <section className="panel list-preview">
          <SectionHeading icon={<ShoppingBasket size={18} />} title="Next shop" caption={`${shopping.filter((item) => !item.checked).length + suggestions.length} to pick up`} action="Open list" onAction={() => onView('list')} />
          <div className="mini-list">
            {suggestions.slice(0, 2).map((item) => <div key={item.key}><span className="mini-check" /><span>{item.name}</span><small>{item.reason}</small></div>)}
            {shopping.filter((item) => !item.checked).slice(0, Math.max(1, 3 - suggestions.length)).map((item) => <div key={item.id}><span className="mini-check" /><span>{item.name}</span><small>Added manually</small></div>)}
          </div>
          <button className="secondary-button wide" type="button" onClick={() => onAdd('shopping')}><Plus size={17} /> Add to list</button>
        </section>
      </div>
    </div>
  )
}

function PantryView({ items, onAdd, onQuantity, onDelete }: { items: GroceryItem[]; onAdd: () => void; onQuantity: (item: GroceryItem, delta: number) => void; onDelete: (id: number) => void }) {
  const [query, setQuery] = useState('')
  const filtered = items.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))
  return (
    <section className="panel full-panel">
      <div className="view-heading">
        <div><span className="eyebrow">Pantry tracker</span><h2>Everything on the shelf</h2><p>Quantities and dates at a glance.</p></div>
        <button className="primary-button" type="button" onClick={onAdd}><Plus size={18} /> Add pantry item</button>
      </div>
      <div className="search-field inline-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter your pantry" /></div>
      <div className="pantry-list roomy">
        {filtered.map((item) => <PantryRow key={item.id} item={item} onQuantity={onQuantity} onDelete={onDelete} />)}
        {filtered.length === 0 && <EmptyState icon={<PackageOpen />} title="No matching groceries" text="Try a different search or add something new." onAction={onAdd} />}
      </div>
    </section>
  )
}

function PantryRow({ item, onQuantity, onDelete }: { item: GroceryItem; onQuantity: (item: GroceryItem, delta: number) => void; onDelete: (id: number) => void }) {
  const status = expirationState(item.expirationDate)
  return (
    <div className="pantry-row">
      <ItemAvatar item={item} />
      <div className="item-main"><strong>{item.name}</strong><span>{item.barcode ? `Barcode ${item.barcode}` : 'Pantry staple'}</span></div>
      <div className={`date-pill ${status.tone}`}><Clock3 size={14} /><span>{status.label}</span></div>
      <div className="quantity-control">
        <button type="button" onClick={() => onQuantity(item, -1)} aria-label={`Reduce ${item.name}`}><Minus size={14} /></button>
        <span><b>{item.quantity}</b><small>{item.unit}</small></span>
        <button type="button" onClick={() => onQuantity(item, 1)} aria-label={`Add ${item.name}`}><Plus size={14} /></button>
      </div>
      <button className="icon-button delete-button" type="button" onClick={() => onDelete(item.id)} aria-label={`Delete ${item.name}`}><Trash2 size={16} /></button>
    </div>
  )
}

function ShoppingListView({ items, suggestions, onAdd, onShop, onToggle, onDelete }: {
  items: GroceryItem[]
  suggestions: SuggestedItem[]
  onAdd: () => void
  onShop: () => void
  onToggle: (item: GroceryItem) => void
  onDelete: (id: number) => void
}) {
  const active = items.filter((item) => !item.checked)
  const done = items.filter((item) => item.checked)
  return (
    <section className="panel full-panel shopping-panel">
      <div className="view-heading">
        <div><span className="eyebrow">Smart shopping list</span><h2>Buy only what you need</h2><p>Low and expired items appear here automatically.</p></div>
        <div className="heading-actions"><button className="secondary-button" type="button" onClick={onAdd}><Plus size={18} /> Add item</button><button className="primary-button" type="button" onClick={onShop}><ShoppingBasket size={18} /> Start shopping</button></div>
      </div>
      {suggestions.length > 0 && (
        <div className="suggestion-block">
          <div className="suggestion-heading"><Sparkles size={16} /><strong>Suggested from your pantry</strong></div>
          {suggestions.map((item) => <div className="shopping-row" key={item.key}><span className="smart-dot"><Sparkles size={14} /></span><div><strong>{item.name}</strong><small>{item.reason}</small></div><span className="auto-label">Auto-added</span></div>)}
        </div>
      )}
      <div className="shopping-list">
        {active.map((item) => <ShoppingRow key={item.id} item={item} onToggle={onToggle} onDelete={onDelete} />)}
        {active.length === 0 && suggestions.length === 0 && <EmptyState icon={<ListChecks />} title="Your list is clear" text="Low pantry items and anything you add show up here." onAction={onAdd} />}
      </div>
      {done.length > 0 && <div className="done-block"><span>Picked up</span>{done.map((item) => <ShoppingRow key={item.id} item={item} onToggle={onToggle} onDelete={onDelete} />)}</div>}
    </section>
  )
}

function ShoppingRow({ item, onToggle, onDelete }: { item: GroceryItem; onToggle: (item: GroceryItem) => void; onDelete: (id: number) => void }) {
  return (
    <div className={`shopping-row ${item.checked ? 'checked' : ''}`}>
      <button className="list-checkbox" type="button" onClick={() => onToggle(item)} aria-label={`Mark ${item.name} ${item.checked ? 'not done' : 'done'}`}>{item.checked && <Check size={16} />}</button>
      <div><strong>{item.name}</strong><small>{item.quantity} {item.unit}{item.quantity === 1 ? '' : 's'}</small></div>
      <button className="icon-button delete-button" type="button" onClick={() => onDelete(item.id)} aria-label={`Delete ${item.name}`}><Trash2 size={16} /></button>
    </div>
  )
}

function ShoppingMode({ items, suggestions, onBack, onToggle, onToggleSuggestion }: {
  items: GroceryItem[]
  suggestions: SuggestedItem[]
  onBack: () => void
  onToggle: (item: GroceryItem) => void
  onToggleSuggestion: (key: string) => void
}) {
  const total = items.length + suggestions.length
  const checked = items.filter((item) => item.checked).length + suggestions.filter((item) => item.checked).length
  const progress = total ? Math.round((checked / total) * 100) : 0
  return (
    <div className="shop-mode">
      <div className="shop-mode-top"><button type="button" onClick={onBack}><ArrowLeft size={20} /> Back</button><span>Shopping mode</span><span>{checked}/{total}</span></div>
      <div className="shop-progress"><span style={{ width: `${progress}%` }} /></div>
      <div className="shop-mode-heading"><span className="eyebrow">Today’s run</span><h1>{checked === total && total > 0 ? 'Cart complete.' : 'Let’s fill the basket.'}</h1><p>Big tap targets, no distractions.</p></div>
      <div className="shop-checklist">
        {suggestions.map((item) => <ShopCheckRow key={item.key} name={item.name} note={item.reason} checked={item.checked} onToggle={() => onToggleSuggestion(item.key)} />)}
        {items.map((item) => <ShopCheckRow key={item.id} name={item.name} note={`${item.quantity} ${item.unit}`} checked={item.checked} onToggle={() => onToggle(item)} />)}
        {total === 0 && <EmptyState icon={<ShoppingBasket />} title="Nothing to pick up" text="Head back and add a few groceries first." onAction={onBack} />}
      </div>
      {total > 0 && checked === total && <div className="complete-card"><CircleCheck size={28} /><div><strong>All done</strong><span>You got everything on the list.</span></div></div>}
    </div>
  )
}

function ShopCheckRow({ name, note, checked, onToggle }: { name: string; note: string; checked: boolean; onToggle: () => void }) {
  return <button className={`shop-check-row ${checked ? 'checked' : ''}`} type="button" onClick={onToggle}><span className="large-check">{checked && <Check size={24} />}</span><span><strong>{name}</strong><small>{note}</small></span></button>
}

function AddItemModal({ destination, onClose, onAdded }: { destination: 'pantry' | 'shopping'; onClose: () => void; onAdded: (values: Record<string, unknown>) => Promise<void> }) {
  const [mode, setMode] = useState<'search' | 'scan'>('search')
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [selected, setSelected] = useState<Product | null>(null)
  const [searching, setSearching] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [minimumQuantity, setMinimumQuantity] = useState(1)
  const [unit, setUnit] = useState('item')
  const [expirationDate, setExpirationDate] = useState('')

  async function searchProducts(searchQuery = query) {
    const cleanQuery = searchQuery.trim()
    if (!cleanQuery) return
    setSearching(true)
    setMessage('')
    try {
      const response = await fetch(`/api/products/${encodeURIComponent(cleanQuery)}`)
      const data = (await response.json()) as { products?: Product[]; error?: string }
      if (!response.ok) throw new Error(data.error || 'Search failed.')
      const results = data.products ?? []
      setProducts(results)
      if (/^\d{8,14}$/.test(cleanQuery) && results[0]) setSelected(results[0])
      if (results.length === 0) setMessage('No match found. You can still add it as a custom item.')
    } catch (searchError) {
      setMessage(searchError instanceof Error ? searchError.message : 'Search failed.')
    } finally {
      setSearching(false)
    }
  }

  async function saveItem() {
    const name = selected?.name || query.trim()
    if (!name) return setMessage('Enter or choose a product first.')
    if (destination === 'pantry' && !expirationDate) return setMessage('Add an expiration or best-by date.')
    setSaving(true)
    setMessage('')
    try {
      await onAdded({
        name,
        barcode: selected?.barcode || null,
        imageUrl: selected?.imageUrl || null,
        listType: destination,
        quantity,
        minimumQuantity,
        unit,
        expirationDate: destination === 'pantry' ? expirationDate : null,
        source: selected ? 'open-food-facts' : 'manual',
      })
    } catch (saveError) {
      setMessage(saveError instanceof Error ? saveError.message : 'Could not add that item.')
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose() }}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="add-item-title">
        <div className="modal-header"><div><span className="eyebrow">{destination === 'pantry' ? 'Stock the shelf' : 'Plan the next shop'}</span><h2 id="add-item-title">Add a grocery</h2></div><button className="icon-button" type="button" onClick={onClose} aria-label="Close"><X size={20} /></button></div>
        {!selected ? (
          <>
            <div className="mode-tabs"><button className={mode === 'search' ? 'active' : ''} type="button" onClick={() => setMode('search')}><Search size={17} /> Search</button><button className={mode === 'scan' ? 'active' : ''} type="button" onClick={() => setMode('scan')}><Camera size={17} /> Camera scan</button></div>
            {mode === 'scan' ? <CameraScanner onCode={(code) => { setQuery(code); void searchProducts(code) }} onFallback={() => setMode('search')} /> : (
              <div className="product-search">
                <label htmlFor="product-query">Product name or barcode</label>
                <div className="search-field"><Barcode size={19} /><input id="product-query" autoFocus value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void searchProducts() }} placeholder="Try “oat milk” or scan a code" /><button type="button" onClick={() => void searchProducts()} disabled={searching}>{searching ? <LoaderCircle className="spin" size={18} /> : 'Find'}</button></div>
                <p className="field-hint">Product details come from Open Food Facts.</p>
                {message && <p className="inline-message">{message}</p>}
                <div className="product-results">
                  {products.map((product) => <button key={`${product.barcode}-${product.name}`} type="button" onClick={() => setSelected(product)}><ProductImage product={product} /><span><strong>{product.name}</strong><small>{[product.brand, product.packageSize].filter(Boolean).join(' · ') || 'Product match'}</small></span><ChevronRight size={18} /></button>)}
                </div>
                {query.trim() && products.length === 0 && !searching && <button className="secondary-button wide" type="button" onClick={() => setSelected({ barcode: '', name: query.trim(), brand: '', imageUrl: '', packageSize: '' })}>Use “{query.trim()}”</button>}
              </div>
            )}
          </>
        ) : (
          <div className="item-details-form">
            <button className="back-link" type="button" onClick={() => setSelected(null)}><ArrowLeft size={16} /> Choose another product</button>
            <div className="selected-product"><ProductImage product={selected} /><div><strong>{selected.name}</strong><span>{selected.brand || 'Custom grocery'}{selected.packageSize ? ` · ${selected.packageSize}` : ''}</span></div></div>
            <div className="form-grid">
              <label>Quantity<input type="number" min="0" value={quantity} onChange={(event) => setQuantity(Math.max(0, Number(event.target.value)))} /></label>
              <label>Unit<select value={unit} onChange={(event) => setUnit(event.target.value)}><option>item</option><option>bag</option><option>box</option><option>carton</option><option>bottle</option><option>can</option><option>jar</option><option>loaf</option></select></label>
              {destination === 'pantry' && <><label>Restock when at<input type="number" min="0" value={minimumQuantity} onChange={(event) => setMinimumQuantity(Math.max(0, Number(event.target.value)))} /></label><label>Best by / expires<input type="date" value={expirationDate} onChange={(event) => setExpirationDate(event.target.value)} /></label></>}
            </div>
            {message && <p className="inline-message">{message}</p>}
            <button className="primary-button wide save-button" type="button" onClick={() => void saveItem()} disabled={saving}>{saving ? <LoaderCircle className="spin" size={18} /> : <Plus size={18} />} Add to {destination}</button>
          </div>
        )}
      </div>
    </div>
  )
}

function CameraScanner({ onCode, onFallback }: { onCode: (code: string) => void; onFallback: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [status, setStatus] = useState('Starting camera…')
  const [manualCode, setManualCode] = useState('')

  useEffect(() => {
    let cancelled = false
    let frame = 0
    const BarcodeDetectorClass = (window as unknown as { BarcodeDetector?: new (options: { formats: string[] }) => { detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue: string }>> } }).BarcodeDetector

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia || !BarcodeDetectorClass) {
        setStatus('Live barcode detection is not supported on this browser. Enter the barcode below instead.')
        return
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
        if (cancelled) return stream.getTracks().forEach((track) => track.stop())
        streamRef.current = stream
        if (!videoRef.current) return
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setStatus('Hold the barcode inside the frame')
        const detector = new BarcodeDetectorClass({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] })
        const detect = async () => {
          if (cancelled || !videoRef.current) return
          try {
            const codes = await detector.detect(videoRef.current)
            if (codes[0]?.rawValue) {
              navigator.vibrate?.(80)
              onCode(codes[0].rawValue)
              return
            }
          } catch {
            setStatus('Keep the barcode steady and well lit')
          }
          frame = window.requestAnimationFrame(detect)
        }
        frame = window.requestAnimationFrame(detect)
      } catch {
        setStatus('Camera access was unavailable. Enter the barcode below instead.')
      }
    }
    void start()
    return () => {
      cancelled = true
      window.cancelAnimationFrame(frame)
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [onCode])

  return (
    <div className="scanner-wrap">
      <div className="camera-stage"><video ref={videoRef} muted playsInline /><div className="scan-frame"><span /><span /><span /><span /></div><div className="scan-line" /></div>
      <p>{status}</p>
      <div className="manual-barcode"><input inputMode="numeric" value={manualCode} onChange={(event) => setManualCode(event.target.value)} placeholder="Enter barcode number" /><button type="button" onClick={() => manualCode.trim() && onCode(manualCode.trim())}>Look up</button></div>
      <button className="text-button" type="button" onClick={onFallback}><Search size={16} /> Search by product name instead</button>
    </div>
  )
}

function SectionHeading({ icon, title, caption, action, onAction }: { icon: React.ReactNode; title: string; caption: string; action?: string; onAction?: () => void }) {
  return <div className="section-heading"><div className="section-title-icon">{icon}</div><div><h2>{title}</h2><span>{caption}</span></div>{action && <button type="button" onClick={onAction}>{action}<ChevronRight size={15} /></button>}</div>
}

function ItemAvatar({ item }: { item: GroceryItem }) {
  return <div className="item-avatar">{item.imageUrl ? <img src={item.imageUrl} alt="" /> : <span>{item.name.slice(0, 1).toUpperCase()}</span>}</div>
}

function ProductImage({ product }: { product: Product }) {
  return <div className="product-image">{product.imageUrl ? <img src={product.imageUrl} alt="" /> : <PackageOpen size={22} />}</div>
}

function EmptyState({ icon, title, text, onAction }: { icon: React.ReactNode; title: string; text: string; onAction: () => void }) {
  return <div className="empty-state"><span>{icon}</span><strong>{title}</strong><p>{text}</p><button className="text-button" type="button" onClick={onAction}><Plus size={16} /> Add something</button></div>
}

function LoadingState() {
  return <div className="loading-layout"><div className="skeleton hero-skeleton" /><div className="dashboard-grid"><div className="skeleton panel-skeleton" /><div className="side-stack"><div className="skeleton small-skeleton" /><div className="skeleton small-skeleton" /></div></div><span className="loading-caption"><RotateCcw className="spin" size={16} /> Checking your shelves…</span></div>
}
