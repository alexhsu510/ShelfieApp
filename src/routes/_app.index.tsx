import { Link, createFileRoute } from '@tanstack/react-router'
import { CalendarClock, ChevronRight, CircleCheck, PackageOpen, Plus, Refrigerator, ScanLine, ShoppingBasket, Sparkles } from 'lucide-react'
import { EmptyState, ItemAvatar, LoadingState, PantryRow, SectionHeading } from '../components/shared'
import { expirationState, useGrocery, type GroceryItem } from '../lib/grocery'
import { useLayoutDensity } from '../lib/layout'

export const Route = createFileRoute('/_app/')({ component: Overview })

function Overview() {
  const { loading, pantry, manualShopping, suggestions, expiring, shoppingCount, openAdd, updateItem, deleteItem } = useGrocery()
  const { pantryPreview, attentionPreview, listPreview } = useLayoutDensity()

  const pendingShopping = manualShopping.filter((item) => !item.checked)
  const previewSuggestions = suggestions.slice(0, Math.max(1, listPreview - 1))
  const previewShopping = pendingShopping.slice(0, Math.max(1, listPreview - previewSuggestions.length))

  return (
    <>
      <WelcomeStrip pantryCount={pantry.length} expiringCount={expiring.length} shoppingCount={shoppingCount} lowStockCount={suggestions.length} onScan={() => openAdd('pantry', 'scan')} />
      {loading ? (
        <LoadingState />
      ) : (
        <div className="dashboard-grid">
          <section className="panel pantry-panel">
            <SectionHeading icon={<Refrigerator size={18} />} title="In your pantry" caption={`${pantry.length} items`} action="See everything" actionTo="/pantry" />
            <div className="pantry-list">
              {pantry.slice(0, pantryPreview).map((item) => (
                <PantryRow
                  key={item.id}
                  item={item}
                  linkToDetail
                  onQuantity={(target, delta) => void updateItem(target.id, { quantity: Math.max(0, target.quantity + delta) })}
                  onDelete={(id) => void deleteItem(id)}
                />
              ))}
              {pantry.length === 0 && <EmptyState icon={<PackageOpen />} title="Your shelves are waiting" text="Scan or add your first pantry item." onAction={() => openAdd('pantry')} />}
            </div>
          </section>

          <div className="side-stack">
            <section className="panel attention-panel">
              <SectionHeading icon={<CalendarClock size={18} />} title="Use these next" />
              <div className="attention-list">
                {expiring.slice(0, attentionPreview).map((item) => <AttentionRow key={item.id} item={item} />)}
                {expiring.length === 0 && <p className="quiet-note"><CircleCheck size={18} /> Nothing urgent. Nicely managed.</p>}
              </div>
            </section>

            <section className="panel list-preview">
              <SectionHeading icon={<ShoppingBasket size={18} />} title="Next shop" caption={`${pendingShopping.length + suggestions.length} to pick up`} action="Open list" actionTo="/list" />
              <div className="mini-list">
                {previewSuggestions.map((item) => <div key={item.key}><span className="mini-check" /><span>{item.name}</span><small>{item.reason}</small></div>)}
                {previewShopping.map((item) => <div key={item.id}><span className="mini-check" /><span>{item.name}</span><small>{item.quantity} {item.unit}{item.quantity === 1 ? '' : 's'}</small></div>)}
              </div>
              <button className="secondary-button wide" type="button" onClick={() => openAdd('shopping')}><Plus size={17} /> Add to list</button>
            </section>
          </div>
        </div>
      )}
    </>
  )
}

function AttentionRow({ item }: { item: GroceryItem }) {
  const status = expirationState(item.expirationDate)
  return (
    <Link className="attention-item" to="/pantry/$itemId" params={{ itemId: String(item.id) }}>
      <ItemAvatar item={item} />
      <div>
        <strong>{item.name}</strong>
        <span className={`status-text ${status.tone}`}>
          {status.label}
          <span className="wide-detail"> · {item.quantity} {item.unit}{item.quantity === 1 ? '' : 's'} left</span>
        </span>
      </div>
      <ChevronRight size={17} />
    </Link>
  )
}

function WelcomeStrip({ pantryCount, expiringCount, shoppingCount, lowStockCount, onScan }: { pantryCount: number; expiringCount: number; shoppingCount: number; lowStockCount: number; onScan: () => void }) {
  return (
    <section className="welcome-strip">
      <div>
        <span className="eyebrow"><Sparkles size={14} /> Your kitchen, in sync</span>
        <h1>Overview</h1>
        <button className="primary-button hero-button" type="button" onClick={onScan}><ScanLine size={19} /> Scan a grocery</button>
      </div>
      <div className="hero-stats" aria-label="Grocery summary">
        <div><strong>{pantryCount}</strong><span>items stocked</span></div>
        <div><strong>{expiringCount}</strong><span>need attention</span></div>
        <div><strong>{shoppingCount}</strong><span>on your list</span></div>
        <div className="wide-stat"><strong>{lowStockCount}</strong><span>running low</span></div>
      </div>
    </section>
  )
}
