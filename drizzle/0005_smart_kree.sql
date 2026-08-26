CREATE TYPE "public"."sales_target_status" AS ENUM('active', 'completed', 'cancelled');--> statement-breakpoint
CREATE TABLE "harvest_records_table" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "harvest_records_table_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"farmerId" integer NOT NULL,
	"commodityId" integer NOT NULL,
	"harvestDate" timestamp with time zone NOT NULL,
	"quantity" numeric(12, 2) NOT NULL,
	"unit" varchar(30) DEFAULT 'kg' NOT NULL,
	"quality" varchar(50) DEFAULT 'A' NOT NULL,
	"notes" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales_targets_table" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sales_targets_table_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"farmerId" integer NOT NULL,
	"targetAmount" numeric(14, 2) NOT NULL,
	"startDate" timestamp with time zone NOT NULL,
	"endDate" timestamp with time zone NOT NULL,
	"status" "sales_target_status" DEFAULT 'active' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification_code" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "verification_code_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"token" varchar(6) NOT NULL,
	"expiredDate" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chat_messages_table" ADD COLUMN "isEdited" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_messages_table" ADD COLUMN "isDeleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_messages_table" ADD COLUMN "replyToId" integer;--> statement-breakpoint
ALTER TABLE "harvest_records_table" ADD CONSTRAINT "harvest_records_table_farmerId_users_table_id_fk" FOREIGN KEY ("farmerId") REFERENCES "public"."users_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "harvest_records_table" ADD CONSTRAINT "harvest_records_table_commodityId_commodities_table_id_fk" FOREIGN KEY ("commodityId") REFERENCES "public"."commodities_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_targets_table" ADD CONSTRAINT "sales_targets_table_farmerId_users_table_id_fk" FOREIGN KEY ("farmerId") REFERENCES "public"."users_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_code" ADD CONSTRAINT "verification_code_userId_users_table_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "harvest_records_farmer_idx" ON "harvest_records_table" USING btree ("farmerId");--> statement-breakpoint
CREATE INDEX "harvest_records_commodity_idx" ON "harvest_records_table" USING btree ("commodityId");--> statement-breakpoint
CREATE INDEX "sales_targets_farmer_idx" ON "sales_targets_table" USING btree ("farmerId");