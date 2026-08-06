import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users_table", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: varchar({ length: 100 }).notNull(),
  fullName: varchar({ length: 100 }).notNull(),
  noTelp: varchar({ length: 100 }).notNull(),
  password: varchar({ length: 15 }).notNull(),
  email: varchar({ length: 40 }).notNull().unique(),
});
