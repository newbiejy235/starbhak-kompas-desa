CREATE TYPE "public"."cart_item_status" AS ENUM('waiting_negotiation', 'ready');--> statement-breakpoint
ALTER TABLE "cart_items_table" ADD COLUMN "negotiationId" integer;--> statement-breakpoint
ALTER TABLE "cart_items_table" ADD COLUMN "status" "cart_item_status" DEFAULT 'waiting_negotiation' NOT NULL;--> statement-breakpoint
ALTER TABLE "cart_items_table" ADD CONSTRAINT "cart_items_table_negotiationId_negotiation_offers_table_id_fk" FOREIGN KEY ("negotiationId") REFERENCES "public"."negotiation_offers_table"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
UPDATE "cart_items_table" SET "status" = 'ready' WHERE "agreedPrice" IS NOT NULL;
