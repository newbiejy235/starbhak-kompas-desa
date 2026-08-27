ALTER TABLE "commodities_table" ADD COLUMN "images" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "commodities_table" ADD COLUMN "video_url" text;
