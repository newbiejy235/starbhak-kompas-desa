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

export const userRoleEnum = pgEnum("user_role", ["admin", "petani", "pembeli"]);

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

export const demandScaleEnum = pgEnum("demand_scale", [
  "SKALA_KECIL",
  "SKALA_MENENGAH",
  "SKALA_BESAR",
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
    preferredCommodity: varchar({ length: 150 }),
    demandScale: demandScaleEnum().notNull().default(""),
    fotoProfile: text(),
    address: text(),
    bio: text(),
    farmingExperience: varchar({ length: 50 }),
    farmArea: varchar({ length: 50 }),
    farmingMethod: varchar({ length: 100 }),
    village: varchar({ length: 100 }),
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
    minPrice: numeric({ precision: 12, scale: 2 }),
    maxPrice: numeric({ precision: 12, scale: 2 }),
    stock: numeric({ precision: 12, scale: 2 }).notNull(),
    unit: varchar({ length: 30 }).notNull().default("kg"),
    quality: varchar({ length: 50 }).notNull().default("A"),
    location: varchar({ length: 150 }).notNull(),
    harvestEstimate: timestamp({ withTimezone: true }),
    image: integer().references(() => ImageUpload.id, {
      onDelete: "set null",
    }),
    status: commodityStatusEnum().notNull().default("pending"),
    isPublished: boolean().notNull().default(false),
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

export const ImageUpload = pgTable("ImageUpload", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  publicId: varchar("public_id", { length: 255 }).notNull(),
  secureUrl: text("secure_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const farmerProfileImagesTable = pgTable(
  "farmer_profile_images_table",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    farmerId: integer()
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    publicId: varchar("public_id", { length: 255 }).notNull(),
    secureUrl: text("secure_url").notNull(),
    caption: varchar({ length: 150 }),
    sortOrder: integer().notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("farmer_profile_images_farmer_idx").on(table.farmerId)],
);

export const chatbotSessionStatusEnum = pgEnum("chatbot_session_status", [
  "ACTIVE",
  "ESCALATED",
  "CLOSED",
]);

export const chatbotSessionsTable = pgTable(
  "chatbot_sessions_table",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: integer().references(() => usersTable.id, { onDelete: "set null" }),
    guestSessionToken: varchar({ length: 255 }),
    productId: integer().references(() => commoditiesTable.id, {
      onDelete: "set null",
    }),
    status: chatbotSessionStatusEnum().notNull().default("ACTIVE"),
    fallbackCount: integer().notNull().default(0),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("chatbot_sessions_user_idx").on(table.userId)],
);

export const chatbotMessagesTable = pgTable(
  "chatbot_messages_table",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    sessionId: integer()
      .notNull()
      .references(() => chatbotSessionsTable.id, { onDelete: "cascade" }),
    sender: varchar({ length: 10 }).notNull(),
    content: text().notNull(),
    intentDetected: varchar({ length: 50 }),
    kbArticleId: integer().references(() => chatbotKbArticlesTable.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("chatbot_messages_session_idx").on(table.sessionId)],
);

export const chatbotKbArticlesTable = pgTable("chatbot_kb_articles_table", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 200 }).notNull(),
  category: varchar({ length: 50 }).notNull(),
  triggerKeywords: text(),
  answerContent: text().notNull(),
  isActive: boolean().notNull().default(true),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const chatRoomStatusEnum = pgEnum("chat_room_status", [
  "active",
  "closed",
]);

export const chatRoomsTable = pgTable(
  "chat_rooms_table",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    buyerId: integer()
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    farmerId: integer()
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    commodityId: integer()
      .notNull()
      .references(() => commoditiesTable.id, { onDelete: "cascade" }),
    status: chatRoomStatusEnum().notNull().default("active"),
    buyerPinned: boolean().notNull().default(false),
    farmerPinned: boolean().notNull().default(false),
    lastMessage: text(),
    lastMessageAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("chat_rooms_buyer_idx").on(table.buyerId),
    index("chat_rooms_farmer_idx").on(table.farmerId),
    index("chat_rooms_commodity_idx").on(table.commodityId),
  ],
);

export const chatMessageTypeEnum = pgEnum("chat_message_type", [
  "text",
  "offer",
  "counter_offer",
  "accept",
  "reject",
  "system",
]);

export const chatMessagesTable = pgTable(
  "chat_messages_table",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    roomId: integer()
      .notNull()
      .references(() => chatRoomsTable.id, { onDelete: "cascade" }),
    senderId: integer()
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    type: chatMessageTypeEnum().notNull().default("text"),
    content: text().notNull(),
    offerPrice: numeric({ precision: 12, scale: 2 }),
    offerQuantity: numeric({ precision: 12, scale: 2 }),
    isRead: boolean().notNull().default(false),
    isEdited: boolean().notNull().default(false),
    isDeleted: boolean().notNull().default(false),
    replyToId: integer(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("chat_messages_room_idx").on(table.roomId),
    index("chat_messages_sender_idx").on(table.senderId),
  ],
);

export const negotiationStatusEnum = pgEnum("negotiation_status", [
  "pending",
  "accepted",
  "rejected",
  "expired",
]);

export const negotiationOffersTable = pgTable(
  "negotiation_offers_table",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    roomId: integer()
      .notNull()
      .references(() => chatRoomsTable.id, { onDelete: "cascade" }),
    commodityId: integer()
      .notNull()
      .references(() => commoditiesTable.id, { onDelete: "cascade" }),
    buyerId: integer()
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    farmerId: integer()
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    price: numeric({ precision: 12, scale: 2 }).notNull(),
    quantity: numeric({ precision: 12, scale: 2 }).notNull(),
    unit: varchar({ length: 30 }).notNull().default("kg"),
    status: negotiationStatusEnum().notNull().default("pending"),
    acceptedAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("negotiation_room_idx").on(table.roomId),
    index("negotiation_buyer_idx").on(table.buyerId),
    index("negotiation_farmer_idx").on(table.farmerId),
  ],
);

export const verificationCode = pgTable("verification_code", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer()
    .notNull()
    .references(() => usersTable.id),
  token: varchar({ length: 6 }).notNull(),
  expiredDate: timestamp().notNull().defaultNow(),
});

export const salesTargetStatusEnum = pgEnum("sales_target_status", [
  "active",
  "completed",
  "cancelled",
]);

export const salesTargetsTable = pgTable(
  "sales_targets_table",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    farmerId: integer()
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    targetAmount: numeric({ precision: 14, scale: 2 }).notNull(),
    startDate: timestamp({ withTimezone: true }).notNull(),
    endDate: timestamp({ withTimezone: true }).notNull(),
    status: salesTargetStatusEnum().notNull().default("active"),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("sales_targets_farmer_idx").on(table.farmerId)],
);

export const harvestRecordsTable = pgTable(
  "harvest_records_table",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    farmerId: integer()
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    commodityId: integer()
      .notNull()
      .references(() => commoditiesTable.id, { onDelete: "cascade" }),
    harvestDate: timestamp({ withTimezone: true }).notNull(),
    quantity: numeric({ precision: 12, scale: 2 }).notNull(),
    unit: varchar({ length: 30 }).notNull().default("kg"),
    quality: varchar({ length: 50 }).notNull().default("A"),
    notes: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("harvest_records_farmer_idx").on(table.farmerId),
    index("harvest_records_commodity_idx").on(table.commodityId),
  ],
);

export const orderUser = pgTable("orderUser_table", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer()
    .references(() => usersTable.id, {
      onDelete: "cascade",
    })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ordersComodity = pgTable("orders_comodity", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  orderUserId: integer("order_userId")
    .notNull()
    .references(() => orderUser.id, {
      onDelete: "cascade",
    }),
  commodityId: integer("commodity_id")
    .notNull()
    .references(() => commoditiesTable.id, {
      onDelete: "cascade",
    }),
  quantity: integer("quantity").notNull(),

  negotiatedPrice: numeric("negotiated_price", {
    precision: 15,
    scale: 2,
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
export type ChatRoom = typeof chatRoomsTable.$inferSelect;
export type ChatMessage = typeof chatMessagesTable.$inferSelect;
export type NegotiationOffer = typeof negotiationOffersTable.$inferSelect;
export type SalesTarget = typeof salesTargetsTable.$inferSelect;
export type HarvestRecord = typeof harvestRecordsTable.$inferSelect;
export type FarmerProfileImage = typeof farmerProfileImagesTable.$inferSelect;
