CREATE TYPE "public"."chatbot_session_status" AS ENUM('ACTIVE', 'ESCALATED', 'CLOSED');--> statement-breakpoint
CREATE TABLE "chatbot_kb_articles_table" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "chatbot_kb_articles_table_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" varchar(200) NOT NULL,
	"category" varchar(50) NOT NULL,
	"triggerKeywords" text,
	"answerContent" text NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chatbot_messages_table" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "chatbot_messages_table_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"sessionId" integer NOT NULL,
	"sender" varchar(10) NOT NULL,
	"content" text NOT NULL,
	"intentDetected" varchar(50),
	"kbArticleId" integer,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chatbot_sessions_table" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "chatbot_sessions_table_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer,
	"guestSessionToken" varchar(255),
	"productId" integer,
	"status" "chatbot_session_status" DEFAULT 'ACTIVE' NOT NULL,
	"fallbackCount" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "commodities_table" ADD COLUMN "minPrice" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "commodities_table" ADD COLUMN "maxPrice" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "chatbot_messages_table" ADD CONSTRAINT "chatbot_messages_table_sessionId_chatbot_sessions_table_id_fk" FOREIGN KEY ("sessionId") REFERENCES "public"."chatbot_sessions_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chatbot_messages_table" ADD CONSTRAINT "chatbot_messages_table_kbArticleId_chatbot_kb_articles_table_id_fk" FOREIGN KEY ("kbArticleId") REFERENCES "public"."chatbot_kb_articles_table"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chatbot_sessions_table" ADD CONSTRAINT "chatbot_sessions_table_userId_users_table_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users_table"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chatbot_sessions_table" ADD CONSTRAINT "chatbot_sessions_table_productId_commodities_table_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."commodities_table"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "chatbot_messages_session_idx" ON "chatbot_messages_table" USING btree ("sessionId");--> statement-breakpoint
CREATE INDEX "chatbot_sessions_user_idx" ON "chatbot_sessions_table" USING btree ("userId");