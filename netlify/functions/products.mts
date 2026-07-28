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

// Restrict text search to products sold in the US. The value must stay quoted:
// the colon in `en:united-states` is otherwise read as a Lucene field separator.
const COUNTRY_FILTER = 'countries_tags:"en:united-states"'

// The query is interpolated into Lucene syntax, where a bare `:` turns the
// preceding word into a field name and an odd `"` breaks parsing outright.
function escapeLucene(query: string) {
  return query.replace(/(&&|\|\||[+\-!(){}[\]^"~*?:\\/])/g, '\\$1')
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

// Netlify hands path params through still percent-encoded, so a two-word search
// arrived as "greek%20yogurt" and matched the literal "%20" as a search term.
function decodeParam(raw: string) {
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw // malformed escape (a lone "%"); search the text as typed
  }
}

export default async (_request: Request, context: Context) => {
  const query = decodeParam(context.params.query ?? '').trim()
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
    //
    // Filter and search terms are space-separated, not joined with AND: `AND`
    // makes multi-word queries ("oat milk") match nothing at all.
    const params = new URLSearchParams({
      q: `${COUNTRY_FILTER} ${escapeLucene(query)}`,
      page_size: '8',
      fields,
    })
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
