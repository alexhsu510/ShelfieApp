import {
  boolean,
  date,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

export const groceryItems = pgTable('grocery_items', {
  id: serial().primaryKey(),
  name: text().notNull(),
  barcode: text(),
  imageUrl: text('image_url'),
  listType: text('list_type').notNull().default('pantry'),
  quantity: integer().notNull().default(1),
  minimumQuantity: integer('minimum_quantity').notNull().default(1),
  unit: text().notNull().default('item'),
  expirationDate: date('expiration_date'),
  checked: boolean().notNull().default(false),
  source: text().notNull().default('manual'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export type GroceryItem = typeof groceryItems.$inferSelect
export type NewGroceryItem = typeof groceryItems.$inferInsert
