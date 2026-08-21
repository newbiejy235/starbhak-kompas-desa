CREATE TYPE "public"."chat_message_type" AS ENUM('text', 'offer', 'counter_offer', 'accept', 'reject', 'system');--> statement-breakpoint
CREATE TYPE "public"."chat_room_status" AS ENUM('active', 'closed');--> statement-breakpoint
CREATE TYPE "public"."negotiation_status" AS ENUM('pending', 'accepted', 'rejected', 'expired');--> statement-breakpoint
CREATE TABLE "chat_messages_table" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "chat_messages_table_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"roomId" integer NOT NULL,
	"senderId" integer NOT NULL,
	"type" "chat_message_type" DEFAULT 'text' NOT NULL,
	"content" text NOT NULL,
	"offerPrice" numeric(12, 2),
	"offerQuantity" numeric(12, 2),
	"isRead" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_rooms_table" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "chat_rooms_table_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"buyerId" integer NOT NULL,
	"farmerId" integer NOT NULL,
	"commodityId" integer NOT NULL,
	"status" "chat_room_status" DEFAULT 'active' NOT NULL,
	"lastMessage" text,
	"lastMessageAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "negotiation_offers_table" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "negotiation_offers_table_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"roomId" integer NOT NULL,
	"commodityId" integer NOT NULL,
	"buyerId" integer NOT NULL,
	"farmerId" integer NOT NULL,
	"price" numeric(12, 2) NOT NULL,
	"quantity" numeric(12, 2) NOT NULL,
	"unit" varchar(30) DEFAULT 'kg' NOT NULL,
	"status" "negotiation_status" DEFAULT 'pending' NOT NULL,
	"acceptedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chat_messages_table" ADD CONSTRAINT "chat_messages_table_roomId_chat_rooms_table_id_fk" FOREIGN KEY ("roomId") REFERENCES "public"."chat_rooms_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages_table" ADD CONSTRAINT "chat_messages_table_senderId_users_table_id_fk" FOREIGN KEY ("senderId") REFERENCES "public"."users_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_rooms_table" ADD CONSTRAINT "chat_rooms_table_buyerId_users_table_id_fk" FOREIGN KEY ("buyerId") REFERENCES "public"."users_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_rooms_table" ADD CONSTRAINT "chat_rooms_table_farmerId_users_table_id_fk" FOREIGN KEY ("farmerId") REFERENCES "public"."users_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_rooms_table" ADD CONSTRAINT "chat_rooms_table_commodityId_commodities_table_id_fk" FOREIGN KEY ("commodityId") REFERENCES "public"."commodities_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "negotiation_offers_table" ADD CONSTRAINT "negotiation_offers_table_roomId_chat_rooms_table_id_fk" FOREIGN KEY ("roomId") REFERENCES "public"."chat_rooms_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "negotiation_offers_table" ADD CONSTRAINT "negotiation_offers_table_commodityId_commodities_table_id_fk" FOREIGN KEY ("commodityId") REFERENCES "public"."commodities_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "negotiation_offers_table" ADD CONSTRAINT "negotiation_offers_table_buyerId_users_table_id_fk" FOREIGN KEY ("buyerId") REFERENCES "public"."users_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "negotiation_offers_table" ADD CONSTRAINT "negotiation_offers_table_farmerId_users_table_id_fk" FOREIGN KEY ("farmerId") REFERENCES "public"."users_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "chat_messages_room_idx" ON "chat_messages_table" USING btree ("roomId");--> statement-breakpoint
CREATE INDEX "chat_messages_sender_idx" ON "chat_messages_table" USING btree ("senderId");--> statement-breakpoint
CREATE INDEX "chat_rooms_buyer_idx" ON "chat_rooms_table" USING btree ("buyerId");--> statement-breakpoint
CREATE INDEX "chat_rooms_farmer_idx" ON "chat_rooms_table" USING btree ("farmerId");--> statement-breakpoint
CREATE INDEX "chat_rooms_commodity_idx" ON "chat_rooms_table" USING btree ("commodityId");--> statement-breakpoint
CREATE INDEX "negotiation_room_idx" ON "negotiation_offers_table" USING btree ("roomId");--> statement-breakpoint
CREATE INDEX "negotiation_buyer_idx" ON "negotiation_offers_table" USING btree ("buyerId");--> statement-breakpoint
CREATE INDEX "negotiation_farmer_idx" ON "negotiation_offers_table" USING btree ("farmerId");