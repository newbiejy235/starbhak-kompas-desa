ALTER TABLE "chat_messages_table" ADD COLUMN "isEdited" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_messages_table" ADD COLUMN "isDeleted" boolean DEFAULT false NOT NULL;
