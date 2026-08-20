ALTER TABLE "chat_messages_table" ADD COLUMN "replyToId" integer;--> statement-breakpoint
ALTER TABLE "chat_messages_table" ADD CONSTRAINT "chat_messages_table_replyToId_chat_messages_table_id_fk" FOREIGN KEY ("replyToId") REFERENCES "public"."chat_messages_table"("id") ON DELETE set null ON UPDATE no action;
