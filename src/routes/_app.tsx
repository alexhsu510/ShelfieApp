import { Link, Outlet, createFileRoute, useLocation } from '@tanstack/react-router'
import { AlertTriangle, Leaf, ListChecks, Plus, Refrigerator, ScanLine, X } from 'lucide-react'
import { GroceryProvider, useGrocery } from '../lib/grocery'
import { AddItemModal } from '../components/AddItemModal'

export const Route = createFileRoute('/_app')({ component: AppLayout })

function AppLayout() {
  return (
    <GroceryProvider>
      <AppShell />
    </GroceryProvider>
  )
}

function AppShell() {
  const { error, setError, addOpen, addDestination, openAdd, closeAdd, addItem } = useGrocery()
  const location = useLocation()
  const onShoppingList = location.pathname === '/list'
  const onShop = location.pathname === '/shop'

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <Header onAdd={() => openAdd('pantry')} />

      <main className="page-wrap">
        {error && (
          <div className="error-banner" role="alert">
            <AlertTriangle size={18} />
            <span>{error}</span>
            <button type="button" onClick={() => setError('')} aria-label="Dismiss error"><X size={16} /></button>
          </div>
        )}

        <Outlet />
      </main>

      {!onShop && (
        <button className="scan-fab" type="button" onClick={() => openAdd(onShoppingList ? 'shopping' : 'pantry')}>
          <ScanLine size={21} />
          <span>Scan item</span>
        </button>
      )}

      {addOpen && (
        <AddItemModal
          destination={addDestination}
          onClose={closeAdd}
          onAdded={async (values) => {
            await addItem(values)
            closeAdd()
          }}
        />
      )}
    </div>
  )
}

function Header({ onAdd }: { onAdd: () => void }) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link className="brand" to="/">
          <span className="brand-mark"><Leaf size={23} strokeWidth={2.4} /></span>
          <span>Shelfie</span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          <NavButton to="/" label="Overview" />
          <NavButton to="/pantry" label="My pantry" />
          <NavButton to="/list" label="Shopping list" showCount />
        </nav>
        <button className="primary-button compact" type="button" onClick={onAdd}><Plus size={17} /> Add item</button>
      </div>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        <Link to="/" activeProps={{ className: 'active' }} activeOptions={{ exact: true }}><Leaf size={18} />Home</Link>
        <Link to="/pantry" activeProps={{ className: 'active' }}><Refrigerator size={18} />Pantry</Link>
        <Link to="/list" activeProps={{ className: 'active' }}><ListChecks size={18} />List</Link>
      </nav>
    </header>
  )
}

function NavButton({ to, label, showCount }: { to: string; label: string; showCount?: boolean }) {
  const { shoppingCount } = useGrocery()
  return (
    <Link to={to} activeProps={{ className: 'active' }} activeOptions={{ exact: to === '/' }}>
      {label}
      {showCount && shoppingCount > 0 && <span className="nav-count">{shoppingCount}</span>}
    </Link>
  )
}
