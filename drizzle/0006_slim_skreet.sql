CREATE TYPE "public"."cart_item_status" AS ENUM('waiting_negotiation', 'ready');--> statement-breakpoint
ALTER TYPE "public"."negotiation_status" ADD VALUE 'counter_offer' BEFORE 'accepted';--> statement-breakpoint
ALTER TYPE "public"."negotiation_status" ADD VALUE 'cancelled';--> statement-breakpoint
CREATE TABLE "wishlist_items_table" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "wishlist_items_table_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"commodityId" integer NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wishlist_items_user_commodity_key" UNIQUE("userId","commodityId")
);
--> statement-breakpoint
ALTER TABLE "cart_items_table" ADD COLUMN "negotiationId" integer;--> statement-breakpoint
ALTER TABLE "cart_items_table" ADD COLUMN "status" "cart_item_status" DEFAULT 'waiting_negotiation' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders_table" ADD COLUMN "negotiationId" integer;--> statement-breakpoint
ALTER TABLE "wishlist_items_table" ADD CONSTRAINT "wishlist_items_table_userId_users_table_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_items_table" ADD CONSTRAINT "wishlist_items_table_commodityId_commodities_table_id_fk" FOREIGN KEY ("commodityId") REFERENCES "public"."commodities_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "wishlist_items_user_idx" ON "wishlist_items_table" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "wishlist_items_commodity_idx" ON "wishlist_items_table" USING btree ("commodityId");--> statement-breakpoint
ALTER TABLE "cart_items_table" ADD CONSTRAINT "cart_items_table_negotiationId_negotiation_offers_table_id_fk" FOREIGN KEY ("negotiationId") REFERENCES "public"."negotiation_offers_table"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders_table" ADD CONSTRAINT "orders_table_negotiationId_negotiation_offers_table_id_fk" FOREIGN KEY ("negotiationId") REFERENCES "public"."negotiation_offers_table"("id") ON DELETE set null ON UPDATE no action;