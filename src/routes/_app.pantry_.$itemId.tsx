import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Check, Clock3, ListPlus, Minus, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { ItemAvatar, LoadingState, StockMeter } from '../components/shared'
import { expirationState, useGrocery } from '../lib/grocery'

export const Route = createFileRoute('/_app/pantry_/$itemId')({ component: ItemDetail })

function ItemDetail() {
  const { itemId } = Route.useParams()
  const { loading, pantry, shoppingNames, updateItem, deleteItem, addToShoppingList } = useGrocery()
  const navigate = useNavigate()
  const [expirationDate, setExpirationDate] = useState<string | null>(null)

  if (loading) return <LoadingState />

  const item = pantry.find((candidate) => candidate.id === Number(itemId))

  if (!item) {
    return (
      <section className="panel full-panel">
        <div className="view-heading">
          <div><span className="eyebrow">Pantry item</span><h2>Item not found</h2><p>It may have already been removed.</p></div>
        </div>
        <div className="item-details-form">
          <Link className="back-link" to="/pantry"><ArrowLeft size={16} /> Back to pantry</Link>
        </div>
      </section>
    )
  }

  const status = expirationState(item.expirationDate)
  const currentExpiration = expirationDate ?? item.expirationDate ?? ''
  const onList = shoppingNames.has(item.name.toLowerCase())

  async function handleDelete() {
    await deleteItem(item!.id)
    void navigate({ to: '/pantry' })
  }

  return (
    <section className="panel full-panel">
      <div className="view-heading">
        <div><span className="eyebrow">Pantry item</span><h2>{item.name}</h2></div>
      </div>
      <div className="item-details-form">
        <Link className="back-link" to="/pantry"><ArrowLeft size={16} /> Back to pantry</Link>
        <div className="selected-product">
          <ItemAvatar item={item} />
          <div>
            <strong>{item.name}</strong>
            <span className={`status-text ${status.tone}`}><Clock3 size={13} /> {status.label}</span>
            <StockMeter item={item} />
          </div>
        </div>
        <div className="form-grid">
          {/* Not a <label>: a label forwards its clicks to the first button
              inside it, so clicking the caption used to fire the minus step. */}
          <div className="field">
            <span>Quantity</span>
            <div className="quantity-control" role="group" aria-label={`Quantity of ${item.name}`}>
              <button type="button" onClick={() => void updateItem(item.id, { quantity: Math.max(0, item.quantity - 1) })} aria-label={`Reduce ${item.name}`}><Minus size={14} /></button>
              <span><b>{item.quantity}</b><small>{item.unit}</small></span>
              <button type="button" onClick={() => void updateItem(item.id, { quantity: item.quantity + 1 })} aria-label={`Add ${item.name}`}><Plus size={14} /></button>
            </div>
          </div>
          <label>Restock when at<input type="number" min="0" value={item.minimumQuantity} onChange={(event) => void updateItem(item.id, { minimumQuantity: Math.max(0, Number(event.target.value)) })} /></label>
          <label>
            Best by / expires
            <input
              type="date"
              value={currentExpiration}
              onChange={(event) => {
                setExpirationDate(event.target.value)
                void updateItem(item.id, { expirationDate: event.target.value || null })
              }}
            />
          </label>
          <label>Barcode<input value={item.barcode ?? ''} disabled placeholder="No barcode on file" /></label>
        </div>
        <div className="detail-actions">
          <button className="secondary-button" type="button" onClick={() => void addToShoppingList(item)} disabled={onList}>
            {onList ? <><Check size={18} /> On your shopping list</> : <><ListPlus size={18} /> Add to shopping list</>}
          </button>
          <button className="primary-button danger-button" type="button" onClick={() => void handleDelete()}>
            <Trash2 size={18} /> Remove from pantry
          </button>
        </div>
      </div>
    </section>
  )
}
