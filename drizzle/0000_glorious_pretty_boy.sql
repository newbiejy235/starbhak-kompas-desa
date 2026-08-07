CREATE TYPE "public"."business_type" AS ENUM('distributor', 'umkm', 'restoran', 'koperasi', '');--> statement-breakpoint
CREATE TYPE "public"."commodity_status" AS ENUM('pending', 'verified', 'rejected', 'available', 'sold_out');--> statement-breakpoint
CREATE TYPE "public"."delivery_method" AS ENUM('pickup', 'expedition');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'confirmed', 'processing', 'shipped', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('bank_transfer', 'virtual_account', 'ewallet', 'qris', 'cod');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'petani', 'pembeli');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('pending', 'verified', 'suspended');--> statement-breakpoint
CREATE TABLE "categories_table" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "categories_table_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(100) NOT NULL,
	"description" text,
	"icon" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_table_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "commodities_table" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "commodities_table_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"farmerId" integer NOT NULL,
	"categoryId" integer NOT NULL,
	"name" varchar(150) NOT NULL,
	"description" text,
	"price" numeric(12, 2) NOT NULL,
	"stock" numeric(12, 2) NOT NULL,
	"unit" varchar(30) DEFAULT 'kg' NOT NULL,
	"quality" varchar(50) DEFAULT 'A' NOT NULL,
	"location" varchar(150) NOT NULL,
	"harvestEstimate" timestamp with time zone,
	"image" text,
	"status" "commodity_status" DEFAULT 'pending' NOT NULL,
	"rating" numeric(3, 2) DEFAULT '0' NOT NULL,
	"reviewCount" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fee_settings_table" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "fee_settings_table_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(100) NOT NULL,
	"categoryId" integer,
	"percentage" numeric(5, 2) DEFAULT '2.5' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications_table" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "notifications_table_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"title" varchar(150) NOT NULL,
	"message" text NOT NULL,
	"type" varchar(30) DEFAULT 'info' NOT NULL,
	"isRead" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders_table" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "orders_table_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"orderCode" varchar(30) NOT NULL,
	"buyerId" integer NOT NULL,
	"farmerId" integer NOT NULL,
	"commodityId" integer NOT NULL,
	"quantity" numeric(12, 2) NOT NULL,
	"unitPrice" numeric(12, 2) NOT NULL,
	"subtotal" numeric(14, 2) NOT NULL,
	"serviceFee" numeric(14, 2) DEFAULT '0' NOT NULL,
	"deliveryFee" numeric(14, 2) DEFAULT '0' NOT NULL,
	"totalPrice" numeric(14, 2) NOT NULL,
	"deliveryMethod" "delivery_method" DEFAULT 'pickup' NOT NULL,
	"deliveryAddress" text,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"notes" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_table_orderCode_unique" UNIQUE("orderCode")
);
--> statement-breakpoint
CREATE TABLE "payments_table" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "payments_table_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"orderId" integer NOT NULL,
	"buyerId" integer NOT NULL,
	"method" "payment_method" DEFAULT 'bank_transfer' NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"fee" numeric(14, 2) DEFAULT '0' NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"referenceCode" varchar(50),
	"paidAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews_table" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "reviews_table_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"orderId" integer NOT NULL,
	"buyerId" integer NOT NULL,
	"farmerId" integer NOT NULL,
	"commodityId" integer NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users_table" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_table_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"username" varchar(100) NOT NULL,
	"fullName" varchar(100) NOT NULL,
	"noTelp" varchar(20) NOT NULL,
	"password" varchar(255) NOT NULL,
	"email" varchar(100) NOT NULL,
	"role" "user_role" DEFAULT 'pembeli' NOT NULL,
	"businessType" "business_type" DEFAULT '' NOT NULL,
	"fotoProfile" text,
	"address" text,
	"status" "user_status" DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_table_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "commodities_table" ADD CONSTRAINT "commodities_table_farmerId_users_table_id_fk" FOREIGN KEY ("farmerId") REFERENCES "public"."users_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commodities_table" ADD CONSTRAINT "commodities_table_categoryId_categories_table_id_fk" FOREIGN KEY ("categoryId") REFERENCES "public"."categories_table"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_settings_table" ADD CONSTRAINT "fee_settings_table_categoryId_categories_table_id_fk" FOREIGN KEY ("categoryId") REFERENCES "public"."categories_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications_table" ADD CONSTRAINT "notifications_table_userId_users_table_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders_table" ADD CONSTRAINT "orders_table_buyerId_users_table_id_fk" FOREIGN KEY ("buyerId") REFERENCES "public"."users_table"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders_table" ADD CONSTRAINT "orders_table_farmerId_users_table_id_fk" FOREIGN KEY ("farmerId") REFERENCES "public"."users_table"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders_table" ADD CONSTRAINT "orders_table_commodityId_commodities_table_id_fk" FOREIGN KEY ("commodityId") REFERENCES "public"."commodities_table"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments_table" ADD CONSTRAINT "payments_table_orderId_orders_table_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."orders_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments_table" ADD CONSTRAINT "payments_table_buyerId_users_table_id_fk" FOREIGN KEY ("buyerId") REFERENCES "public"."users_table"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews_table" ADD CONSTRAINT "reviews_table_orderId_orders_table_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."orders_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews_table" ADD CONSTRAINT "reviews_table_buyerId_users_table_id_fk" FOREIGN KEY ("buyerId") REFERENCES "public"."users_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews_table" ADD CONSTRAINT "reviews_table_farmerId_users_table_id_fk" FOREIGN KEY ("farmerId") REFERENCES "public"."users_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews_table" ADD CONSTRAINT "reviews_table_commodityId_commodities_table_id_fk" FOREIGN KEY ("commodityId") REFERENCES "public"."commodities_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "commodities_farmer_idx" ON "commodities_table" USING btree ("farmerId");--> statement-breakpoint
CREATE INDEX "commodities_category_idx" ON "commodities_table" USING btree ("categoryId");--> statement-breakpoint
CREATE INDEX "commodities_status_idx" ON "commodities_table" USING btree ("status");--> statement-breakpoint
CREATE INDEX "notifications_user_idx" ON "notifications_table" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "orders_buyer_idx" ON "orders_table" USING btree ("buyerId");--> statement-breakpoint
CREATE INDEX "orders_farmer_idx" ON "orders_table" USING btree ("farmerId");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders_table" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payments_order_idx" ON "payments_table" USING btree ("orderId");--> statement-breakpoint
CREATE INDEX "reviews_farmer_idx" ON "reviews_table" USING btree ("farmerId");--> statement-breakpoint
CREATE INDEX "reviews_commodity_idx" ON "reviews_table" USING btree ("commodityId");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users_table" USING btree ("role");