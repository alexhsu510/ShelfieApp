import type { Config, Context } from '@netlify/functions'
import { asc, eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { groceryItems, type NewGroceryItem } from '../../db/schema.js'

const allowedListTypes = new Set(['pantry', 'shopping'])

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
    if (!name) throw new Error('Item name is required.')
    item.name = name.slice(0, 120)
  }

  if (body.listType !== undefined) {
    if (typeof body.listType !== 'string' || !allowedListTypes.has(body.listType)) {
      throw new Error('List type must be pantry or shopping.')
    }
    item.listType = body.listType
  }

  for (const key of ['quantity', 'minimumQuantity'] as const) {
    if (body[key] !== undefined) {
      const value = Number(body[key])
      if (!Number.isInteger(value) || value < 0 || value > 9999) {
        throw new Error(`${key} must be a whole number between 0 and 9999.`)
      }
      item[key] = value
    }
  }

  for (const key of ['barcode', 'imageUrl', 'expirationDate'] as const) {
    if (body[key] !== undefined) {
      item[key] = typeof body[key] === 'string' && body[key] ? body[key] : null
    }
  }

  for (const key of ['unit', 'source'] as const) {
    if (body[key] !== undefined) {
      if (typeof body[key] !== 'string' || !body[key].trim()) throw new Error(`${key} must be a non-empty string.`)
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
    const message = error instanceof Error ? error.message : 'Something went wrong.'
    return jsonError(message, message.includes('required') || message.includes('must') ? 400 : 500)
  }
}

export const config: Config = {
  path: ['/api/items', '/api/items/:id'],
}
