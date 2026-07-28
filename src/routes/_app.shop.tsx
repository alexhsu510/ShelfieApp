import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowLeft, CircleCheck, ShoppingBasket } from 'lucide-react'
import { ShopCheckRow } from '../components/shared'
import { useGrocery } from '../lib/grocery'

export const Route = createFileRoute('/_app/shop')({ component: ShopModePage })

function ShopModePage() {
  const { manualShopping, suggestions, updateItem, toggleSuggestion } = useGrocery()
  const total = manualShopping.length + suggestions.length
  const checked = manualShopping.filter((item) => item.checked).length + suggestions.filter((item) => item.checked).length
  const progress = total ? Math.round((checked / total) * 100) : 0

  return (
    <div className="shop-mode">
      <div className="shop-mode-top">
        <Link to="/list"><ArrowLeft size={20} /> Back</Link>
        <span>Shopping mode</span>
        <span>{checked}/{total}</span>
      </div>
      <div className="shop-progress"><span style={{ width: `${progress}%` }} /></div>
      <div className="shop-mode-heading"><span className="eyebrow">Today’s run</span><h1>{checked === total && total > 0 ? 'Cart complete.' : 'Let’s fill the basket.'}</h1><p>Big tap targets, no distractions.</p></div>
      <div className="shop-checklist">
        {suggestions.map((item) => <ShopCheckRow key={item.key} name={item.name} note={item.reason} checked={item.checked} onToggle={() => toggleSuggestion(item.key)} />)}
        {manualShopping.map((item) => <ShopCheckRow key={item.id} name={item.name} note={`${item.quantity} ${item.unit}`} checked={item.checked} onToggle={() => void updateItem(item.id, { checked: !item.checked })} />)}
        {total === 0 && <EmptyStateLink />}
      </div>
      {total > 0 && checked === total && <div className="complete-card"><CircleCheck size={28} /><div><strong>All done</strong><span>You got everything on the list.</span></div></div>}
    </div>
  )
}

function EmptyStateLink() {
  return (
    <Link to="/list" className="empty-state">
      <span><ShoppingBasket /></span>
      <strong>Nothing to pick up</strong>
      <p>Head back and add a few groceries first.</p>
    </Link>
  )
}
