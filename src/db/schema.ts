import {
  integer,
  pgTable,
  varchar,
  text,
  timestamp,
  numeric,
  boolean,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "petani",
  "pembeli",
]);

export const userStatusEnum = pgEnum("user_status", [
  "pending",
  "verified",
  "suspended",
]);

export const businessTypeEnum = pgEnum("business_type", [
  "distributor",
  "umkm",
  "restoran",
  "koperasi",
  "",
]);

export const commodityStatusEnum = pgEnum("commodity_status", [
  "pending",
  "verified",
  "rejected",
  "available",
  "sold_out",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "completed",
  "cancelled",
]);

export const deliveryMethodEnum = pgEnum("delivery_method", [
  "pickup",
  "expedition",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "bank_transfer",
  "virtual_account",
  "ewallet",
  "qris",
  "cod",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "failed",
  "refunded",
]);

export const usersTable = pgTable(
  "users_table",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    username: varchar({ length: 100 }).notNull(),
    fullName: varchar({ length: 100 }).notNull(),
    noTelp: varchar({ length: 20 }).notNull(),
    password: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 100 }).notNull().unique(),
    role: userRoleEnum().notNull().default("pembeli"),
    businessType: businessTypeEnum().notNull().default(""),
    fotoProfile: text(),
    address: text(),
    status: userStatusEnum().notNull().default("pending"),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("users_role_idx").on(table.role)],
);

export const categoriesTable = pgTable("categories_table", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 100 }).notNull().unique(),
  description: text(),
  icon: text(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const commoditiesTable = pgTable(
  "commodities_table",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    farmerId: integer()
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    categoryId: integer()
      .notNull()
      .references(() => categoriesTable.id, { onDelete: "restrict" }),
    name: varchar({ length: 150 }).notNull(),
    description: text(),
    price: numeric({ precision: 12, scale: 2 }).notNull(),
    stock: numeric({ precision: 12, scale: 2 }).notNull(),
    unit: varchar({ length: 30 }).notNull().default("kg"),
    quality: varchar({ length: 50 }).notNull().default("A"),
    location: varchar({ length: 150 }).notNull(),
    harvestEstimate: timestamp({ withTimezone: true }),
    image: text(),
    status: commodityStatusEnum().notNull().default("pending"),
    rating: numeric({ precision: 3, scale: 2 }).notNull().default("0"),
    reviewCount: integer().notNull().default(0),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("commodities_farmer_idx").on(table.farmerId),
    index("commodities_category_idx").on(table.categoryId),
    index("commodities_status_idx").on(table.status),
  ],
);

export const ordersTable = pgTable(
  "orders_table",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    orderCode: varchar({ length: 30 }).notNull().unique(),
    buyerId: integer()
      .notNull()
      .references(() => usersTable.id, { onDelete: "restrict" }),
    farmerId: integer()
      .notNull()
      .references(() => usersTable.id, { onDelete: "restrict" }),
    commodityId: integer()
      .notNull()
      .references(() => commoditiesTable.id, { onDelete: "restrict" }),
    quantity: numeric({ precision: 12, scale: 2 }).notNull(),
    unitPrice: numeric({ precision: 12, scale: 2 }).notNull(),
    subtotal: numeric({ precision: 14, scale: 2 }).notNull(),
    serviceFee: numeric({ precision: 14, scale: 2 }).notNull().default("0"),
    deliveryFee: numeric({ precision: 14, scale: 2 }).notNull().default("0"),
    totalPrice: numeric({ precision: 14, scale: 2 }).notNull(),
    deliveryMethod: deliveryMethodEnum().notNull().default("pickup"),
    deliveryAddress: text(),
    status: orderStatusEnum().notNull().default("pending"),
    notes: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("orders_buyer_idx").on(table.buyerId),
    index("orders_farmer_idx").on(table.farmerId),
    index("orders_status_idx").on(table.status),
  ],
);

export const paymentsTable = pgTable(
  "payments_table",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    orderId: integer()
      .notNull()
      .references(() => ordersTable.id, { onDelete: "cascade" }),
    buyerId: integer()
      .notNull()
      .references(() => usersTable.id, { onDelete: "restrict" }),
    method: paymentMethodEnum().notNull().default("bank_transfer"),
    amount: numeric({ precision: 14, scale: 2 }).notNull(),
    fee: numeric({ precision: 14, scale: 2 }).notNull().default("0"),
    status: paymentStatusEnum().notNull().default("pending"),
    referenceCode: varchar({ length: 50 }),
    paidAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("payments_order_idx").on(table.orderId)],
);

export const reviewsTable = pgTable(
  "reviews_table",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    orderId: integer()
      .notNull()
      .references(() => ordersTable.id, { onDelete: "cascade" }),
    buyerId: integer()
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    farmerId: integer()
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    commodityId: integer()
      .notNull()
      .references(() => commoditiesTable.id, { onDelete: "cascade" }),
    rating: integer().notNull(),
    comment: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("reviews_farmer_idx").on(table.farmerId),
    index("reviews_commodity_idx").on(table.commodityId),
  ],
);

export const notificationsTable = pgTable(
  "notifications_table",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: integer()
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    title: varchar({ length: 150 }).notNull(),
    message: varchar().notNull(),
    type: varchar({ length: 30 }).notNull().default("info"),
    isRead: boolean().notNull().default(false),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("notifications_user_idx").on(table.userId)],
);

export const feeSettingsTable = pgTable("fee_settings_table", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 100 }).notNull(),
  categoryId: integer().references(() => categoriesTable.id, {
    onDelete: "cascade",
  }),
  percentage: numeric({ precision: 5, scale: 2 }).notNull().default("2.5"),
  active: boolean().notNull().default(true),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
export type Category = typeof categoriesTable.$inferSelect;
export type Commodity = typeof commoditiesTable.$inferSelect;
export type NewCommodity = typeof commoditiesTable.$inferInsert;
export type Order = typeof ordersTable.$inferSelect;
export type Payment = typeof paymentsTable.$inferSelect;
export type Review = typeof reviewsTable.$inferSelect;
export type Notification = typeof notificationsTable.$inferSelect;
