import type { Config, Context } from '@netlify/functions'
import { asc, eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { groceryItems, type NewGroceryItem } from '../../db/schema.js'

const allowedListTypes = new Set(['pantry', 'shopping'])

// Only these reach the client. Anything else is treated as an internal fault and
// reported generically, so driver errors cannot leak the query or schema.
class ValidationError extends Error {}

const MAX_BARCODE_LENGTH = 32
const MAX_IMAGE_URL_LENGTH = 1024

function parseBarcode(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) return null
  const barcode = value.trim()
  if (!/^\d+$/.test(barcode) || barcode.length > MAX_BARCODE_LENGTH) {
    throw new ValidationError('Barcode must be digits only.')
  }
  return barcode
}

function parseImageUrl(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) return null
  const raw = value.trim()
  if (raw.length > MAX_IMAGE_URL_LENGTH) throw new ValidationError('Image URL is too long.')
  let parsed: URL
  try {
    parsed = new URL(raw)
  } catch {
    throw new ValidationError('Image URL must be a valid URL.')
  }
  // Every visitor's browser loads this, so keep it to https and nothing exotic
  // like javascript: or data:.
  if (parsed.protocol !== 'https:') throw new ValidationError('Image URL must use https.')
  return parsed.toString()
}

function parseExpirationDate(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) return null
  const date = value.trim()
  // Validated here so a bad date is a 400 rather than a failed insert.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) {
    throw new ValidationError('Expiration date must be formatted YYYY-MM-DD.')
  }
  return date
}

function futureDate(days: number) {
  const value = new Date()
  value.setUTCDate(value.getUTCDate() + days)
  return value.toISOString().slice(0, 10)
}

const starterItems: NewGroceryItem[] = [
  {
    name: 'Oat milk',
    listType: 'pantry',
    quantity: 1,
    minimumQuantity: 2,
    unit: 'carton',
    expirationDate: futureDate(2),
    source: 'starter',
  },
  {
    name: 'Baby spinach',
    listType: 'pantry',
    quantity: 1,
    minimumQuantity: 1,
    unit: 'bag',
    expirationDate: futureDate(-1),
    source: 'starter',
  },
  {
    name: 'Brown eggs',
    listType: 'pantry',
    quantity: 8,
    minimumQuantity: 4,
    unit: 'egg',
    expirationDate: futureDate(9),
    source: 'starter',
  },
  {
    name: 'Greek yogurt',
    listType: 'pantry',
    quantity: 3,
    minimumQuantity: 2,
    unit: 'cup',
    expirationDate: futureDate(5),
    source: 'starter',
  },
  {
    name: 'Sourdough bread',
    listType: 'shopping',
    quantity: 1,
    unit: 'loaf',
    source: 'starter',
  },
]

function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status })
}

function parseItem(body: Record<string, unknown>, partial = false) {
  const item: Record<string, unknown> = {}

  if (!partial || body.name !== undefined) {
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (!name) throw new ValidationError('Item name is required.')
    item.name = name.slice(0, 120)
  }

  if (body.listType !== undefined) {
    if (typeof body.listType !== 'string' || !allowedListTypes.has(body.listType)) {
      throw new ValidationError('List type must be pantry or shopping.')
    }
    item.listType = body.listType
  }

  for (const key of ['quantity', 'minimumQuantity'] as const) {
    if (body[key] !== undefined) {
      const value = Number(body[key])
      if (!Number.isInteger(value) || value < 0 || value > 9999) {
        throw new ValidationError(`${key} must be a whole number between 0 and 9999.`)
      }
      item[key] = value
    }
  }

  if (body.barcode !== undefined) item.barcode = parseBarcode(body.barcode)
  if (body.imageUrl !== undefined) item.imageUrl = parseImageUrl(body.imageUrl)
  if (body.expirationDate !== undefined) item.expirationDate = parseExpirationDate(body.expirationDate)

  for (const key of ['unit', 'source'] as const) {
    if (body[key] !== undefined) {
      if (typeof body[key] !== 'string' || !body[key].trim()) throw new ValidationError(`${key} must be a non-empty string.`)
      item[key] = body[key].trim().slice(0, 80)
    }
  }

  if (body.checked !== undefined) item.checked = Boolean(body.checked)
  item.updatedAt = new Date()
  return item as Partial<NewGroceryItem>
}

export default async (request: Request, context: Context) => {
  try {
    const id = context.params.id ? Number(context.params.id) : null

    if (request.method === 'GET') {
      let items = await db.select().from(groceryItems).orderBy(asc(groceryItems.id))
      if (items.length === 0) {
        items = await db.insert(groceryItems).values(starterItems).returning()
      }
      return Response.json({ items })
    }

    if (request.method === 'POST') {
      const body = (await request.json()) as Record<string, unknown>
      const values = parseItem(body) as NewGroceryItem
      const [item] = await db.insert(groceryItems).values(values).returning()
      return Response.json({ item }, { status: 201 })
    }

    if (!id || !Number.isInteger(id)) return jsonError('A valid item id is required.')

    if (request.method === 'PATCH') {
      const body = (await request.json()) as Record<string, unknown>
      const values = parseItem(body, true)
      const [item] = await db
        .update(groceryItems)
        .set(values)
        .where(eq(groceryItems.id, id))
        .returning()
      return item ? Response.json({ item }) : jsonError('Item not found.', 404)
    }

    if (request.method === 'DELETE') {
      const [item] = await db
        .delete(groceryItems)
        .where(eq(groceryItems.id, id))
        .returning({ id: groceryItems.id })
      return item ? new Response(null, { status: 204 }) : jsonError('Item not found.', 404)
    }

    return jsonError('Method not allowed.', 405)
  } catch (error) {
    if (error instanceof ValidationError) return jsonError(error.message, 400)
    if (error instanceof SyntaxError) return jsonError('Request body must be valid JSON.', 400)
    // Driver errors carry the full query, schema, and parameters, so log them
    // rather than returning them.
    console.error('items request failed:', error)
    return jsonError('Something went wrong.', 500)
  }
}

export const config: Config = {
  path: ['/api/items', '/api/items/:id'],
}
