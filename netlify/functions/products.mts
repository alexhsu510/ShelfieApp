import type { Config, Context } from '@netlify/functions'

type FoodFactsProduct = {
  code?: string
  product_name?: string
  brands?: string
  image_front_small_url?: string
  image_url?: string
  quantity?: string
}

function normalizeProduct(product: FoodFactsProduct) {
  return {
    barcode: product.code ?? '',
    name: product.product_name?.trim() || product.brands?.trim() || 'Unknown product',
    brand: product.brands?.trim() || '',
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

    const params = new URLSearchParams({
      search_terms: query,
      search_simple: '1',
      action: 'process',
      json: '1',
      page_size: '8',
      fields,
    })
    const response = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?${params}`, {
      headers: { 'User-Agent': 'Shelfie Grocery Manager/1.0' },
    })
    if (!response.ok) throw new Error('Product search failed.')
    const data = (await response.json()) as { products?: FoodFactsProduct[] }
    return Response.json({ products: (data.products ?? []).map(normalizeProduct) })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Product lookup failed.'
    return Response.json({ error: message }, { status: 502 })
  }
}

export const config: Config = {
  path: '/api/products/:query',
}
