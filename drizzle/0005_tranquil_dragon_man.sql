CREATE TABLE "cart_items_table" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "cart_items_table_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"cartId" integer NOT NULL,
	"productId" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"agreedPrice" numeric(12, 2),
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cart_items_cart_product_key" UNIQUE("cartId","productId")
);
--> statement-breakpoint
CREATE TABLE "carts_table" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "carts_table_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "carts_table_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "invoice" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "invoice_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"productId" integer
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
ALTER TABLE "cart_items_table" ADD CONSTRAINT "cart_items_table_cartId_carts_table_id_fk" FOREIGN KEY ("cartId") REFERENCES "public"."carts_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items_table" ADD CONSTRAINT "cart_items_table_productId_commodities_table_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."commodities_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts_table" ADD CONSTRAINT "carts_table_userId_users_table_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_productId_commodities_table_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."commodities_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_code" ADD CONSTRAINT "verification_code_userId_users_table_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cart_items_cart_idx" ON "cart_items_table" USING btree ("cartId");--> statement-breakpoint
CREATE INDEX "cart_items_product_idx" ON "cart_items_table" USING btree ("productId");