CREATE TYPE "public"."demand_scale" AS ENUM('SKALA_KECIL', 'SKALA_MENENGAH', 'SKALA_BESAR', '');--> statement-breakpoint
ALTER TABLE "notifications_table" ALTER COLUMN "message" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "users_table" ADD COLUMN "preferredCommodity" varchar(150);--> statement-breakpoint
ALTER TABLE "users_table" ADD COLUMN "demandScale" "demand_scale" DEFAULT '' NOT NULL;