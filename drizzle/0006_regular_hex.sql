CREATE TABLE "farmer_profile_images_table" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "farmer_profile_images_table_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"farmerId" integer NOT NULL,
	"public_id" varchar(255) NOT NULL,
	"secure_url" text NOT NULL,
	"caption" varchar(150),
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users_table" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "users_table" ADD COLUMN "farmingExperience" varchar(50);--> statement-breakpoint
ALTER TABLE "users_table" ADD COLUMN "farmArea" varchar(50);--> statement-breakpoint
ALTER TABLE "users_table" ADD COLUMN "farmingMethod" varchar(100);--> statement-breakpoint
ALTER TABLE "users_table" ADD COLUMN "village" varchar(100);--> statement-breakpoint
ALTER TABLE "farmer_profile_images_table" ADD CONSTRAINT "farmer_profile_images_table_farmerId_users_table_id_fk" FOREIGN KEY ("farmerId") REFERENCES "public"."users_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "farmer_profile_images_farmer_idx" ON "farmer_profile_images_table" USING btree ("farmerId");