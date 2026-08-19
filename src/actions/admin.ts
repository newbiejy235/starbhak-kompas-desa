"use server";

import { db } from "@/db";
import {
  usersTable,
  ordersTable,
  paymentsTable,
  commoditiesTable,
  categoriesTable,
  feeSettingsTable,
  notificationsTable,
  ImageUpload,
} from "@/db/schema";
import { eq, desc, asc, sql } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth/auth.service";
import { revalidatePath } from "next/cache";
import type { ActionState } from "@/lib/types/auth";

const validStatuses = ["pending", "verified", "suspended"];

async function requireAdmin(adminId: number) {
  const admin = await getAuthUser(adminId);
  if (!admin || admin.role !== "admin") return null;
  return admin;
}

export async function getAllUsers() {
  return db
    .select()
    .from(usersTable)
    .orderBy(desc(usersTable.createdAt));
}

export async function updateUserStatus(
  userId: number,
  status: string,
  adminId: number,
): Promise<ActionState> {
  const admin = await requireAdmin(adminId);
  if (!admin) return { success: false, message: "Unauthorized" };

  if (!validStatuses.includes(status)) {
    return { success: false, message: "Status tidak valid" };
  }

  try {
    await db
      .update(usersTable)
      .set({ status: status as never })
      .where(eq(usersTable.id, userId));

    const [target] = await db
      .select({ email: usersTable.email })
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    await db.insert(notificationsTable).values({
      userId,
      title: "Status Akun Diperbarui",
      message:
        status === "verified"
          ? "Selamat, akun Anda telah diverifikasi oleh admin."
          : status === "suspended"
            ? "Akun Anda telah ditangguhkan oleh admin."
            : "Status akun Anda menunggu verifikasi kembali.",
      type: "system",
    });

    revalidatePath("/admin/users");
    return { success: true, message: `Status akun diperbarui (${target?.email})` };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal memperbarui status akun" };
  }
}

export async function updateUser(
  userId: number,
  adminId: number,
  data: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin(adminId);
  if (!admin) return { success: false, message: "Unauthorized" };

  const fullName = (data.get("fullName") as string)?.trim() || "";
  const username = (data.get("username") as string)?.trim() || "";
  const noTelp = (data.get("noTelp") as string)?.trim() || "";
  const businessType = (data.get("businessType") as string) || "";
  const role = (data.get("role") as string) || "";
  const status = (data.get("status") as string) || "";

  if (!fullName || !username || !noTelp) {
    return { success: false, message: "Lengkapi field wajib" };
  }

  try {
    await db
      .update(usersTable)
      .set({
        fullName,
        username,
        noTelp,
        ...(businessType ? { businessType: businessType as never } : {}),
        ...(["admin", "petani", "pembeli"].includes(role)
          ? { role: role as never }
          : {}),
        ...(validStatuses.includes(status) ? { status: status as never } : {}),
      })
      .where(eq(usersTable.id, userId));
    revalidatePath("/admin/users");
    return { success: true, message: "Data pengguna diperbarui" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal memperbarui data pengguna" };
  }
}

export async function deleteUser(
  userId: number,
  adminId: number,
): Promise<ActionState> {
  const admin = await requireAdmin(adminId);
  if (!admin) return { success: false, message: "Unauthorized" };
  if (userId === adminId) {
    return { success: false, message: "Tidak dapat menghapus akun sendiri" };
  }

  try {
    await db.delete(usersTable).where(eq(usersTable.id, userId));
    revalidatePath("/admin/users");
    return { success: true, message: "Pengguna berhasil dihapus" };
  } catch {
    return { success: false, message: "Gagal menghapus pengguna" };
  }
}

export async function getAllCommoditiesAdmin() {
  return db
    .select({
      id: commoditiesTable.id,
      name: commoditiesTable.name,
      price: commoditiesTable.price,
      stock: commoditiesTable.stock,
      unit: commoditiesTable.unit,
      quality: commoditiesTable.quality,
      location: commoditiesTable.location,
      image: ImageUpload.secureUrl,
      status: commoditiesTable.status,
      rating: commoditiesTable.rating,
      reviewCount: commoditiesTable.reviewCount,
      createdAt: commoditiesTable.createdAt,
      categoryName: categoriesTable.name,
      farmerName: usersTable.fullName,
    })
    .from(commoditiesTable)
    .innerJoin(categoriesTable, eq(categoriesTable.id, commoditiesTable.categoryId))
    .innerJoin(usersTable, eq(usersTable.id, commoditiesTable.farmerId))
    .leftJoin(ImageUpload, eq(ImageUpload.id, commoditiesTable.image))
    .orderBy(desc(commoditiesTable.createdAt));
}

export async function verifyCommodity(
  commodityId: number,
  status: "verified" | "rejected",
  adminId: number,
): Promise<ActionState> {
  const admin = await requireAdmin(adminId);
  if (!admin) return { success: false, message: "Unauthorized" };

  try {
    await db
      .update(commoditiesTable)
      .set({ status: status as never })
      .where(eq(commoditiesTable.id, commodityId));

    const [commodity] = await db
      .select({ farmerId: commoditiesTable.farmerId, name: commoditiesTable.name })
      .from(commoditiesTable)
      .where(eq(commoditiesTable.id, commodityId));

    if (commodity) {
      await db.insert(notificationsTable).values({
        userId: commodity.farmerId,
        title: status === "verified" ? "Komoditas Diverifikasi" : "Komoditas Ditolak",
        message:
          status === "verified"
            ? `Komoditas "${commodity.name}" telah diverifikasi dan dapat dipasarkan.`
            : `Komoditas "${commodity.name}" ditolak oleh admin. Periksa kembali informasinya.`,
        type: "commodity",
      });
    }

    revalidatePath("/admin/commodities");
    return {
      success: true,
      message:
        status === "verified"
          ? "Komoditas diverifikasi"
          : "Komoditas ditolak",
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal memperbarui status komoditas" };
  }
}

export async function getAllTransactions() {
  return db
    .select({
      id: paymentsTable.id,
      referenceCode: paymentsTable.referenceCode,
      amount: paymentsTable.amount,
      fee: paymentsTable.fee,
      method: paymentsTable.method,
      status: paymentsTable.status,
      paidAt: paymentsTable.paidAt,
      createdAt: paymentsTable.createdAt,
      orderCode: ordersTable.orderCode,
      orderStatus: ordersTable.status,
      buyerName: usersTable.fullName,
      commodityName: commoditiesTable.name,
    })
    .from(paymentsTable)
    .innerJoin(ordersTable, eq(ordersTable.id, paymentsTable.orderId))
    .innerJoin(usersTable, eq(usersTable.id, paymentsTable.buyerId))
    .innerJoin(
      commoditiesTable,
      eq(commoditiesTable.id, ordersTable.commodityId),
    )
    .orderBy(desc(paymentsTable.createdAt));
}

export async function getFeeSettings() {
  return db
    .select({
      id: feeSettingsTable.id,
      name: feeSettingsTable.name,
      percentage: feeSettingsTable.percentage,
      categoryId: feeSettingsTable.categoryId,
      active: feeSettingsTable.active,
      updatedAt: feeSettingsTable.updatedAt,
      categoryName: categoriesTable.name,
    })
    .from(feeSettingsTable)
    .leftJoin(
      categoriesTable,
      eq(categoriesTable.id, feeSettingsTable.categoryId),
    )
    .orderBy(asc(feeSettingsTable.id));
}

export async function saveFeeSettings(
  adminId: number,
  data: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin(adminId);
  if (!admin) return { success: false, message: "Unauthorized" };

  const percentage = Number(data.get("percentage"));
  const categoryId = data.get("categoryId")
    ? Number(data.get("categoryId"))
    : null;
  const active = (data.get("active") as string) === "on";
  const name = (data.get("name") as string)?.trim() || "Biaya Layanan";

  if (percentage < 0 || percentage > 100) {
    return { success: false, message: "Persentase fee harus 0-100" };
  }

  try {
    await db.insert(feeSettingsTable).values({
      name,
      percentage: String(percentage),
      categoryId,
      active,
    });
    revalidatePath("/admin/fees");
    return { success: true, message: "Pengaturan fee disimpan" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal menyimpan pengaturan fee" };
  }
}

export async function toggleFee(
  feeId: number,
  adminId: number,
): Promise<ActionState> {
  const admin = await requireAdmin(adminId);
  if (!admin) return { success: false, message: "Unauthorized" };

  try {
    const [fee] = await db
      .select({ active: feeSettingsTable.active })
      .from(feeSettingsTable)
      .where(eq(feeSettingsTable.id, feeId));
    await db
      .update(feeSettingsTable)
      .set({ active: !fee?.active })
      .where(eq(feeSettingsTable.id, feeId));
    revalidatePath("/admin/fees");
    return { success: true, message: "Status fee diperbarui" };
  } catch {
    return { success: false, message: "Gagal memperbarui status fee" };
  }
}

export async function getDashboardStats() {
  // OPTIMASI: Jalankan semua query ke database secara BERSAMAAN (Paralel) 
  // biar loadingnya super ngebut, nggak nunggu satu-satu.
  const [
    [totalUsers],
    [totalFarmers],
    [totalBuyers],
    [totalCommodities],
    [pendingCommodities],
    [pendingUsers],
    [totalOrders],
    [totalPaidPayments],
    feeRevenueRows,
    transactionVolumeRows,
    pendingOrdersRows,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(usersTable),
    db.select({ count: sql<number>`count(*)::int` }).from(usersTable).where(eq(usersTable.role, "petani")),
    db.select({ count: sql<number>`count(*)::int` }).from(usersTable).where(eq(usersTable.role, "pembeli")),
    db.select({ count: sql<number>`count(*)::int` }).from(commoditiesTable),
    db.select({ count: sql<number>`count(*)::int` }).from(commoditiesTable).where(eq(commoditiesTable.status, "pending")),
    db.select({ count: sql<number>`count(*)::int` }).from(usersTable).where(eq(usersTable.status, "pending")),
    db.select({ count: sql<number>`count(*)::int` }).from(ordersTable),
    db.select({ count: sql<number>`count(*)::int` }).from(paymentsTable).where(eq(paymentsTable.status, "paid")),
    db.select({ total: sql<string>`coalesce(sum(${paymentsTable.fee}), 0)` }).from(paymentsTable).where(eq(paymentsTable.status, "paid")),
    db.select({ total: sql<string>`coalesce(sum(${paymentsTable.amount}), 0)` }).from(paymentsTable).where(eq(paymentsTable.status, "paid")),
    db.select({ count: sql<number>`count(*)::int` }).from(ordersTable).where(eq(ordersTable.status, "pending")),
  ]);

  const totalFeeRevenue = Number(feeRevenueRows[0]?.total ?? 0);
  const totalTransactionVolume = Number(transactionVolumeRows[0]?.total ?? 0);

  return {
    totalUsers: Number(totalUsers?.count ?? 0),
    totalFarmers: Number(totalFarmers?.count ?? 0),
    totalBuyers: Number(totalBuyers?.count ?? 0),
    totalCommodities: Number(totalCommodities?.count ?? 0),
    pendingCommodities: Number(pendingCommodities?.count ?? 0),
    pendingUsers: Number(pendingUsers?.count ?? 0),
    totalOrders: Number(totalOrders?.count ?? 0),
    totalPaidPayments: Number(totalPaidPayments?.count ?? 0),
    totalFeeRevenue,
    totalTransactionVolume,
    pendingOrders: Number(pendingOrdersRows[0]?.count ?? 0),
  };
}

export async function getTopCommodities(limit = 5) {
  return db
    .select({
      id: commoditiesTable.id,
      name: commoditiesTable.name,
      reviewCount: commoditiesTable.reviewCount,
      rating: commoditiesTable.rating,
      sold: sql<number>`coalesce(sum(${ordersTable.quantity}), 0)`,
    })
    .from(commoditiesTable)
    .leftJoin(ordersTable, eq(ordersTable.commodityId, commoditiesTable.id))
    .groupBy(commoditiesTable.id)
    .orderBy(desc(sql`coalesce(sum(${ordersTable.quantity}), 0)`))
    .limit(limit);
}

export async function getSalesPerCategory() {
  return db
    .select({
      categoryName: categoriesTable.name,
      totalQuantity: sql<number>`coalesce(sum(${ordersTable.quantity}), 0)`,
      totalRevenue: sql<number>`coalesce(sum(${ordersTable.totalPrice}), 0)`,
    })
    .from(categoriesTable)
    .leftJoin(
      commoditiesTable,
      eq(commoditiesTable.categoryId, categoriesTable.id),
    )
    .leftJoin(ordersTable, eq(ordersTable.commodityId, commoditiesTable.id))
    .groupBy(categoriesTable.id)
    .orderBy(desc(sql`coalesce(sum(${ordersTable.totalPrice}), 0)`));
}

export async function getPaymentStatusBreakdown() {
  return db
    .select({
      status: paymentsTable.status,
      count: sql<number>`count(*)::int`,
      total: sql<number>`coalesce(sum(${paymentsTable.amount}), 0)`,
    })
    .from(paymentsTable)
    .groupBy(paymentsTable.status)
    .orderBy(desc(sql`count(*)::int`));
}

export async function getMonthlyRevenue() {
  const rows = await db
    .select({
      month: sql<string>`to_char(${paymentsTable.paidAt}, 'YYYY-MM')`,
      total: sql<number>`coalesce(sum(${paymentsTable.fee}), 0)`,
    })
    .from(paymentsTable)
    .where(eq(paymentsTable.status, "paid"))
    .groupBy(sql`to_char(${paymentsTable.paidAt}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${paymentsTable.paidAt}, 'YYYY-MM')`)
    .limit(12);

  return rows;
}

export async function getMonthlyOrders() {
  const rows = await db
    .select({
      month: sql<string>`to_char(${ordersTable.createdAt}, 'YYYY-MM')`,
      total: sql<number>`count(*)::int`,
    })
    .from(ordersTable)
    .groupBy(sql`to_char(${ordersTable.createdAt}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${ordersTable.createdAt}, 'YYYY-MM')`)
    .limit(12);

  return rows;
}