CREATE TABLE "grocery_items" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"barcode" text,
	"image_url" text,
	"list_type" text DEFAULT 'pantry' NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"minimum_quantity" integer DEFAULT 1 NOT NULL,
	"unit" text DEFAULT 'item' NOT NULL,
	"expiration_date" date,
	"checked" boolean DEFAULT false NOT NULL,
	"source" text DEFAULT 'manual' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
