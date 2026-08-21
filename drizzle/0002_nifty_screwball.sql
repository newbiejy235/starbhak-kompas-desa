CREATE TABLE "ImageUpload" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ImageUpload_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"public_id" varchar(255) NOT NULL,
	"secure_url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "commodities_table" ALTER COLUMN "image" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "commodities_table" ADD CONSTRAINT "commodities_table_image_ImageUpload_id_fk" FOREIGN KEY ("image") REFERENCES "public"."ImageUpload"("id") ON DELETE set null ON UPDATE no action;