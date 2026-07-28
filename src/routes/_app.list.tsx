import { Link, createFileRoute } from '@tanstack/react-router'
import { ListChecks, Plus, ShoppingBasket, Sparkles } from 'lucide-react'
import { EmptyState, LoadingState, ShoppingRow } from '../components/shared'
import { useGrocery } from '../lib/grocery'

export const Route = createFileRoute('/_app/list')({ component: ShoppingListPage })

function ShoppingListPage() {
  const { loading, manualShopping, suggestions, openAdd, updateItem, deleteItem } = useGrocery()

  if (loading) return <LoadingState />

  const active = manualShopping.filter((item) => !item.checked)
  const done = manualShopping.filter((item) => item.checked)

  return (
    <section className="panel full-panel shopping-panel">
      <div className="view-heading">
        <div><span className="eyebrow">Smart shopping list</span><h2>Buy only what you need</h2><p>Low and expired items appear here automatically.</p></div>
        <div className="heading-actions">
          <button className="secondary-button" type="button" onClick={() => openAdd('shopping')}><Plus size={18} /> Add item</button>
          <Link className="primary-button" to="/shop"><ShoppingBasket size={18} /> Start shopping</Link>
        </div>
      </div>
      {suggestions.length > 0 && (
        <div className="suggestion-block">
          <div className="suggestion-heading"><Sparkles size={16} /><strong>Suggested from your pantry</strong></div>
          {suggestions.map((item) => <div className="shopping-row" key={item.key}><span className="smart-dot"><Sparkles size={14} /></span><div><strong>{item.name}</strong><small>{item.reason}</small></div><span className="auto-label">Auto-added</span></div>)}
        </div>
      )}
      <div className="shopping-list">
        {active.map((item) => <ShoppingRow key={item.id} item={item} onToggle={(target) => void updateItem(target.id, { checked: !target.checked })} onDelete={(id) => void deleteItem(id)} />)}
        {active.length === 0 && suggestions.length === 0 && <EmptyState icon={<ListChecks />} title="Your list is clear" text="Low pantry items and anything you add show up here." onAction={() => openAdd('shopping')} />}
      </div>
      {done.length > 0 && <div className="done-block"><span>Picked up</span>{done.map((item) => <ShoppingRow key={item.id} item={item} onToggle={(target) => void updateItem(target.id, { checked: !target.checked })} onDelete={(id) => void deleteItem(id)} />)}</div>}
    </section>
  )
}
