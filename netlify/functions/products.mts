import type { Config, Context } from '@netlify/functions'

type FoodFactsProduct = {
  code?: string
  product_name?: string
  // The barcode API returns a comma-joined string; the search API returns an array.
  brands?: string | string[]
  image_front_small_url?: string
  image_url?: string
  quantity?: string
}

function normalizeBrand(brands: FoodFactsProduct['brands']) {
  return (Array.isArray(brands) ? brands.join(', ') : (brands ?? '')).trim()
}

function normalizeProduct(product: FoodFactsProduct) {
  const brand = normalizeBrand(product.brands)
  return {
    barcode: product.code ?? '',
    name: product.product_name?.trim() || brand || 'Unknown product',
    brand,
    imageUrl: product.image_front_small_url || product.image_url || '',
    packageSize: product.quantity || '',
  }
}

export default async (_request: Request, context: Context) => {
  const query = context.params.query?.trim()
  if (!query) return Response.json({ error: 'Enter a product name or barcode.' }, { status: 400 })

  try {
    const fields = 'code,product_name,brands,image_front_small_url,image_url,quantity'
    if (/^\d{8,14}$/.test(query)) {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(query)}.json?fields=${fields}`,
        { headers: { 'User-Agent': 'Shelfie Grocery Manager/1.0' } },
      )
      if (!response.ok) throw new Error('Product lookup failed.')
      const data = (await response.json()) as { status: number; product?: FoodFactsProduct }
      return Response.json({ products: data.status === 1 && data.product ? [normalizeProduct(data.product)] : [] })
    }

    // Open Food Facts retired the legacy /cgi/search.pl endpoint (it now 503s);
    // search.openfoodfacts.org is the supported replacement. It returns matches
    // under `hits` rather than `products`.
    const params = new URLSearchParams({ q: query, page_size: '8', fields })
    const response = await fetch(`https://search.openfoodfacts.org/search?${params}`, {
      headers: { 'User-Agent': 'Shelfie Grocery Manager/1.0' },
    })
    if (!response.ok) throw new Error(`Search API returned ${response.status}.`)
    const data = (await response.json()) as { hits?: FoodFactsProduct[] }
    return Response.json({ products: (data.hits ?? []).map(normalizeProduct) })
  } catch (error) {
    // Surface the real cause in the function log; the client only ever saw the
    // generic message, which made the retired-endpoint outage hard to diagnose.
    console.error('Open Food Facts lookup failed:', error)
    return Response.json({ error: 'Product search failed.' }, { status: 502 })
  }
}

export const config: Config = {
  path: '/api/products/:query',
}
