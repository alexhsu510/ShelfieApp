import { createFileRoute } from '@tanstack/react-router'
import { PackageOpen, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { EmptyState, LoadingState, PantryRow } from '../components/shared'
import { useGrocery } from '../lib/grocery'

export const Route = createFileRoute('/_app/pantry')({ component: PantryPage })

function PantryPage() {
  const { loading, pantry, openAdd, updateItem, deleteItem } = useGrocery()
  const [query, setQuery] = useState('')

  if (loading) return <LoadingState />

  const filtered = pantry.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <section className="panel full-panel">
      <div className="view-heading">
        <div><span className="eyebrow">Pantry tracker</span><h2>Everything on the shelf</h2><p>Quantities and dates at a glance.</p></div>
        <button className="primary-button" type="button" onClick={() => openAdd('pantry')}><Plus size={18} /> Add pantry item</button>
      </div>
      <div className="search-field inline-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter your pantry" /></div>
      <div className="pantry-list roomy">
        {filtered.map((item) => (
          <PantryRow
            key={item.id}
            item={item}
            linkToDetail
            onQuantity={(target, delta) => void updateItem(target.id, { quantity: Math.max(0, target.quantity + delta) })}
            onDelete={(id) => void deleteItem(id)}
          />
        ))}
        {filtered.length === 0 && <EmptyState icon={<PackageOpen />} title="No matching groceries" text="Try a different search or add something new." onAction={() => openAdd('pantry')} />}
      </div>
    </section>
  )
}
