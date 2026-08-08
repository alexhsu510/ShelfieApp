import { Link } from '@tanstack/react-router'
import { Check, ChevronRight, Clock3, ListPlus, Minus, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { expirationState, type GroceryItem } from '../lib/grocery'

export function SectionHeading({ icon, title, caption, action, actionTo, onAction }: { icon: React.ReactNode; title: string; caption?: string; action?: string; actionTo?: string; onAction?: () => void }) {
  return (
    <div className="section-heading">
      <div className="section-title-icon">{icon}</div>
      <div><h2>{title}</h2>{caption && <span>{caption}</span>}</div>
      {action && actionTo && <Link to={actionTo}>{action}<ChevronRight size={15} /></Link>}
      {action && !actionTo && <button type="button" onClick={onAction}>{action}<ChevronRight size={15} /></button>}
    </div>
  )
}

export function ItemAvatar({ item }: { item: GroceryItem }) {
  return <div className="item-avatar">{item.imageUrl ? <img src={item.imageUrl} alt="" /> : <span>{item.name.slice(0, 1).toUpperCase()}</span>}</div>
}

export function EmptyState({ icon, title, text, onAction }: { icon: React.ReactNode; title: string; text: string; onAction: () => void }) {
  return <div className="empty-state"><span>{icon}</span><strong>{title}</strong><p>{text}</p><button className="text-button" type="button" onClick={onAction}><Plus size={16} /> Add something</button></div>
}

export function LoadingState() {
  return <div className="loading-layout"><div className="skeleton hero-skeleton" /><div className="dashboard-grid"><div className="skeleton panel-skeleton" /><div className="side-stack"><div className="skeleton small-skeleton" /><div className="skeleton small-skeleton" /></div></div><span className="loading-caption"><RotateCcw className="spin" size={16} /> Checking your shelves…</span></div>
}

/** Stock against the restock point. Hidden by CSS until the row has a spare column. */
export function StockMeter({ item }: { item: GroceryItem }) {
  const low = item.quantity <= item.minimumQuantity
  const full = Math.max(item.minimumQuantity * 2, 1)
  const fill = Math.min(100, Math.round((item.quantity / full) * 100))
  return (
    <div className="stock-meter">
      <span className={`stock-track ${low ? 'low' : ''}`}><span style={{ width: `${fill}%` }} /></span>
      <small>
        {item.quantity} {item.unit}{item.quantity === 1 ? '' : 's'}
        {item.minimumQuantity > 0 ? ` · ${low ? 'below' : 'restock at'} ${item.minimumQuantity}` : ' · no restock point'}
      </small>
    </div>
  )
}

export function PantryRow({ item, onQuantity, onDelete, onAddToList, onList, linkToDetail }: { item: GroceryItem; onQuantity: (item: GroceryItem, delta: number) => void; onDelete: (id: number) => void; onAddToList: (item: GroceryItem) => void; onList: boolean; linkToDetail?: boolean }) {
  const status = expirationState(item.expirationDate)
  const main = (
    <>
      <ItemAvatar item={item} />
      <div className="item-main"><strong>{item.name}</strong>{item.barcode && <span>Barcode {item.barcode}</span>}</div>
    </>
  )
  return (
    <div className="pantry-row">
      {linkToDetail ? (
        <Link className="pantry-row-link" to="/pantry/$itemId" params={{ itemId: String(item.id) }}>{main}</Link>
      ) : main}
      <StockMeter item={item} />
      <div className={`date-pill ${status.tone}`}><Clock3 size={14} /><span>{status.label}</span></div>
      <div className="quantity-control">
        <button type="button" onClick={() => onQuantity(item, -1)} aria-label={`Reduce ${item.name}`}><Minus size={14} /></button>
        <span><b>{item.quantity}</b><small>{item.unit}</small></span>
        <button type="button" onClick={() => onQuantity(item, 1)} aria-label={`Add ${item.name}`}><Plus size={14} /></button>
      </div>
      <button
        className={`icon-button list-button ${onList ? 'on-list' : ''}`}
        type="button"
        onClick={() => onAddToList(item)}
        disabled={onList}
        title={onList ? `${item.name} is already on your shopping list` : `Add ${item.name} to your shopping list`}
        aria-label={onList ? `${item.name} is already on your shopping list` : `Add ${item.name} to your shopping list`}
      >
        {onList ? <Check size={16} /> : <ListPlus size={16} />}
      </button>
      <button className="icon-button delete-button" type="button" onClick={() => onDelete(item.id)} aria-label={`Delete ${item.name}`}><Trash2 size={16} /></button>
    </div>
  )
}

export function ShoppingRow({ item, onToggle, onDelete }: { item: GroceryItem; onToggle: (item: GroceryItem) => void; onDelete: (id: number) => void }) {
  return (
    <div className={`shopping-row ${item.checked ? 'checked' : ''}`}>
      <button className="list-checkbox" type="button" onClick={() => onToggle(item)} aria-label={`Mark ${item.name} ${item.checked ? 'not done' : 'done'}`}>{item.checked && <Check size={16} />}</button>
      <div><strong>{item.name}</strong><small>{item.quantity} {item.unit}{item.quantity === 1 ? '' : 's'}</small></div>
      <button className="icon-button delete-button" type="button" onClick={() => onDelete(item.id)} aria-label={`Delete ${item.name}`}><Trash2 size={16} /></button>
    </div>
  )
}

export function ShopCheckRow({ name, note, checked, onToggle }: { name: string; note: string; checked: boolean; onToggle: () => void }) {
  return <button className={`shop-check-row ${checked ? 'checked' : ''}`} type="button" onClick={onToggle}><span className="large-check">{checked && <Check size={24} />}</span><span><strong>{name}</strong><small>{note}</small></span></button>
}
