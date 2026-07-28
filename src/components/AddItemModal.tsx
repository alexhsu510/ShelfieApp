import { ArrowLeft, Barcode, Camera, ChevronRight, LoaderCircle, PackageOpen, Plus, Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { AddMode, Product } from '../lib/grocery'

export function AddItemModal({ destination, initialMode = 'search', onClose, onAdded }: { destination: 'pantry' | 'shopping'; initialMode?: AddMode; onClose: () => void; onAdded: (values: Record<string, unknown>) => Promise<void> }) {
  const [mode, setMode] = useState<AddMode>(initialMode)
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

function ProductImage({ product }: { product: Product }) {
  return <div className="product-image">{product.imageUrl ? <img src={product.imageUrl} alt="" /> : <PackageOpen size={22} />}</div>
}
