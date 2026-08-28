ALTER TABLE "chat_rooms_table" ADD COLUMN "buyerPinned" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_rooms_table" ADD COLUMN "farmerPinned" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "commodities_table" ADD COLUMN "isPublished" boolean DEFAULT false NOT NULL;