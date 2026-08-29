ALTER TABLE "negotiation_offers_table" ADD COLUMN "buyerAccepted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "negotiation_offers_table" ADD COLUMN "farmerAccepted" boolean DEFAULT false NOT NULL;
