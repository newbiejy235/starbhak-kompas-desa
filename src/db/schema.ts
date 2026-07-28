import { int, mysqlTable, varchar, text } from "drizzle-orm/mysql-core";

export const usersTable = mysqlTable("users_table", {
  id: int().primaryKey().autoincrement(),
  nama_pengguna: varchar({ length: 20 }).notNull(),
  no_telp: varchar({ length: 14 }).notNull(),
  password: varchar({ length: 255 }).notNull(),
  nama_lengkap: varchar({ length: 50 }).notNull(),
  foto_profile: text().default(""),
  email: varchar({ length: 40 }).notNull().unique(),
});
