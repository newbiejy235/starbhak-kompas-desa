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
  adminActivityLogTable,
  reviewsTable,
  farmerProfileImagesTable,
  contactMessagesTable,
} from "@/db/schema";
import {
  eq,
  desc,
  asc,
  sql,
  and,
  or,
  ilike,
  avg,
  inArray,
  SQL,
} from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { getAuthUser, verifyAuth } from "@/lib/auth/auth.service";
import { ADMIN_ACTION_LABEL } from "@/lib/format";
import { revalidatePath } from "next/cache";
import type { ActionState } from "@/lib/types/auth";

const validStatuses = ["pending", "verified", "suspended"];

const reviewerUser = alias(usersTable, "reviewer_user");
const buyerUser = alias(usersTable, "admin_buyer_user");
const farmerUser = alias(usersTable, "admin_farmer_user");

/**
 * Validasi admin server-side.
 * Selain mengecek role dari database, dipastikan sesi (cookie token)
 * benar-benar milik admin tersebut — ID dari client saja tidak cukup.
 */
async function requireAdmin(adminId: number) {
  const admin = await getAuthUser(adminId);
  if (!admin || admin.role !== "admin") return null;

  const session = await verifyAuth();
  if (!session || session.userId !== adminId) return null;

  return admin;
}

/**
 * Catat aksi admin ke audit log (best-effort: kegagalan logging tidak
 * menggagalkan aksi utama, tapi tetap dicatat di console).
 */
export async function logAdminAction(
  adminId: number,
  action: string,
  entityType: string,
  entityId: number,
  reason?: string | null,
  metadata?: Record<string, unknown>,
) {
  try {
    await db.insert(adminActivityLogTable).values({
      adminId,
      action,
      entityType,
      entityId,
      reason: reason?.trim() || null,
      metadata: metadata ?? {},
    });
  } catch (error) {
    console.error("Gagal mencatat audit log:", error);
  }
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
  return verifyCommodityAdmin(commodityId, status, null, adminId);
}

/**
 * Workflow verifikasi komoditas (PRD: Approve/Reject + reason wajib saat reject).
 * - Approve: konfirmasi + update status + audit log.
 * - Reject: alasan WAJIB + update status + alasan tersimpan + audit log.
 */
export async function verifyCommodityAdmin(
  commodityId: number,
  action: "verified" | "rejected",
  reason: string | null,
  adminId: number,
): Promise<ActionState> {
  const admin = await requireAdmin(adminId);
  if (!admin) return { success: false, message: "Unauthorized" };

  if (action !== "verified" && action !== "rejected") {
    return { success: false, message: "Aksi tidak valid" };
  }

  const finalReason = reason?.trim() || null;
  if (action === "rejected") {
    if (!finalReason) {
      return { success: false, message: "Alasan penolakan wajib diisi" };
    }
    if (finalReason.length < 5) {
      return { success: false, message: "Alasan penolakan minimal 5 karakter" };
    }
  }

  try {
    const [commodity] = await db
      .select({ farmerId: commoditiesTable.farmerId, name: commoditiesTable.name })
      .from(commoditiesTable)
      .where(eq(commoditiesTable.id, commodityId));

    if (!commodity) {
      return { success: false, message: "Komoditas tidak ditemukan" };
    }

    await db
      .update(commoditiesTable)
      .set({
        status: action as never,
        rejectedReason: action === "rejected" ? finalReason : null,
        reviewedAt: new Date(),
        reviewedBy: adminId,
      })
      .where(eq(commoditiesTable.id, commodityId));

    await db.insert(notificationsTable).values({
      userId: commodity.farmerId,
      title: action === "verified" ? "Komoditas Diverifikasi" : "Komoditas Ditolak",
      message:
        action === "verified"
          ? `Komoditas "${commodity.name}" telah diverifikasi dan dapat dipasarkan.`
          : `Komoditas "${commodity.name}" ditolak oleh admin. Alasan: ${finalReason}`,
      type: "commodity",
    });

    await logAdminAction(
      adminId,
      action === "verified" ? "APPROVE" : "REJECT",
      "commodity",
      commodityId,
      action === "rejected" ? finalReason : null,
      { entityLabel: commodity.name },
    );

    revalidatePath("/admin/commodities");
    revalidatePath("/admin/verification");
    revalidatePath("/admin");
    revalidatePath("/admin/activity");
    return {
      success: true,
      message:
        action === "verified"
          ? "Komoditas diverifikasi"
          : "Komoditas ditolak",
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal memperbarui status komoditas" };
  }
}

/**
 * Verifikasi akun petani (PRD: Approve/Reject + reason wajib saat reject).
 */
export async function verifyFarmer(
  userId: number,
  action: "verified" | "rejected",
  reason: string | null,
  adminId: number,
): Promise<ActionState> {
  const admin = await requireAdmin(adminId);
  if (!admin) return { success: false, message: "Unauthorized" };

  if (action !== "verified" && action !== "rejected") {
    return { success: false, message: "Aksi tidak valid" };
  }

  const finalReason = reason?.trim() || null;
  if (action === "rejected") {
    if (!finalReason) {
      return { success: false, message: "Alasan penolakan wajib diisi" };
    }
    if (finalReason.length < 5) {
      return { success: false, message: "Alasan penolakan minimal 5 karakter" };
    }
  }

  try {
    const [target] = await db
      .select({
        id: usersTable.id,
        fullName: usersTable.fullName,
        email: usersTable.email,
        role: usersTable.role,
        status: usersTable.status,
      })
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    if (!target || target.role !== "petani") {
      return { success: false, message: "Petani tidak ditemukan" };
    }
    if (target.status === "suspended") {
      return {
        success: false,
        message: "Akun sedang ditangguhkan. Pulihkan akun terlebih dahulu.",
      };
    }

    await db
      .update(usersTable)
      .set({
        status: action as never,
        rejectedReason: action === "rejected" ? finalReason : null,
        reviewedAt: new Date(),
        reviewedBy: adminId,
      })
      .where(eq(usersTable.id, userId));

    await db.insert(notificationsTable).values({
      userId,
      title:
        action === "verified"
          ? "Akun Petani Terverifikasi"
          : "Pengajuan Akun Petani Ditolak",
      message:
        action === "verified"
          ? "Selamat, akun petani Anda telah diverifikasi oleh admin."
          : `Pengajuan akun petani Anda ditolak. Alasan: ${finalReason}`,
      type: "system",
    });

    await logAdminAction(
      adminId,
      action === "verified" ? "APPROVE" : "REJECT",
      "farmer",
      userId,
      action === "rejected" ? finalReason : null,
      { entityLabel: target.fullName, email: target.email },
    );

    revalidatePath("/admin/farmers");
    revalidatePath("/admin/users");
    revalidatePath("/admin/verification");
    revalidatePath("/admin");
    revalidatePath("/admin/activity");
    return {
      success: true,
      message:
        action === "verified"
          ? "Petani berhasil diverifikasi"
          : "Pengajuan petani ditolak",
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal memproses verifikasi petani" };
  }
}

/**
 * Verifikasi akun user umum (pembeli/admin lain). Petani pakai verifyFarmer.
 * Workflow sama: Approve/Reject + reason wajib saat reject + audit log.
 */
export async function verifyUserAccount(
  userId: number,
  action: "verified" | "rejected",
  reason: string | null,
  adminId: number,
): Promise<ActionState> {
  const admin = await requireAdmin(adminId);
  if (!admin) return { success: false, message: "Unauthorized" };

  if (action !== "verified" && action !== "rejected") {
    return { success: false, message: "Aksi tidak valid" };
  }

  const finalReason = reason?.trim() || null;
  if (action === "rejected") {
    if (!finalReason) {
      return { success: false, message: "Alasan penolakan wajib diisi" };
    }
    if (finalReason.length < 5) {
      return { success: false, message: "Alasan penolakan minimal 5 karakter" };
    }
  }

  try {
    const [target] = await db
      .select({
        id: usersTable.id,
        fullName: usersTable.fullName,
        role: usersTable.role,
        status: usersTable.status,
      })
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    if (!target) return { success: false, message: "Pengguna tidak ditemukan" };
    if (target.status === "suspended") {
      return {
        success: false,
        message: "Akun sedang ditangguhkan. Pulihkan akun terlebih dahulu.",
      };
    }

    await db
      .update(usersTable)
      .set({
        status: action as never,
        rejectedReason: action === "rejected" ? finalReason : null,
        reviewedAt: new Date(),
        reviewedBy: adminId,
      })
      .where(eq(usersTable.id, userId));

    await db.insert(notificationsTable).values({
      userId,
      title:
        action === "verified"
          ? "Akun Terverifikasi"
          : "Pengajuan Akun Ditolak",
      message:
        action === "verified"
          ? "Selamat, akun Anda telah diverifikasi oleh admin."
          : `Pengajuan akun Anda ditolak. Alasan: ${finalReason}`,
      type: "system",
    });

    await logAdminAction(
      adminId,
      action === "verified" ? "APPROVE" : "REJECT",
      "user",
      userId,
      action === "rejected" ? finalReason : null,
      { entityLabel: target.fullName, role: target.role },
    );

    revalidatePath("/admin/users");
    revalidatePath("/admin");
    revalidatePath("/admin/activity");
    return {
      success: true,
      message:
        action === "verified"
          ? "Akun berhasil diverifikasi"
          : "Pengajuan akun ditolak",
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal memproses verifikasi akun" };
  }
}

/**
 * Tangguhkan akun (PRD: no hard delete — gunakan suspend/restore).
 */
export async function suspendUserAccount(
  userId: number,
  reason: string | null,
  adminId: number,
): Promise<ActionState> {
  const admin = await requireAdmin(adminId);
  if (!admin) return { success: false, message: "Unauthorized" };
  if (userId === adminId) {
    return { success: false, message: "Tidak dapat menangguhkan akun sendiri" };
  }

  try {
    const [target] = await db
      .select({ id: usersTable.id, fullName: usersTable.fullName })
      .from(usersTable)
      .where(eq(usersTable.id, userId));
    if (!target) return { success: false, message: "Pengguna tidak ditemukan" };

    await db
      .update(usersTable)
      .set({ status: "suspended" })
      .where(eq(usersTable.id, userId));

    await db.insert(notificationsTable).values({
      userId,
      title: "Akun Ditangguhkan",
      message: reason?.trim()
        ? `Akun Anda ditangguhkan oleh admin. Alasan: ${reason.trim()}`
        : "Akun Anda ditangguhkan oleh admin.",
      type: "system",
    });

    await logAdminAction(
      adminId,
      "SUSPEND",
      "user",
      userId,
      reason?.trim() || null,
      { entityLabel: target.fullName },
    );

    revalidatePath("/admin/users");
    revalidatePath("/admin/farmers");
    revalidatePath("/admin");
    revalidatePath("/admin/activity");
    return { success: true, message: "Akun berhasil ditangguhkan" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal menangguhkan akun" };
  }
}

/**
 * Pulihkan akun yang ditangguhkan.
 */
export async function restoreUserAccount(
  userId: number,
  adminId: number,
): Promise<ActionState> {
  const admin = await requireAdmin(adminId);
  if (!admin) return { success: false, message: "Unauthorized" };

  try {
    const [target] = await db
      .select({ id: usersTable.id, fullName: usersTable.fullName })
      .from(usersTable)
      .where(eq(usersTable.id, userId));
    if (!target) return { success: false, message: "Pengguna tidak ditemukan" };

    await db
      .update(usersTable)
      .set({ status: "verified" })
      .where(eq(usersTable.id, userId));

    await db.insert(notificationsTable).values({
      userId,
      title: "Akun Dipulihkan",
      message: "Akun Anda telah dipulihkan oleh admin.",
      type: "system",
    });

    await logAdminAction(adminId, "RESTORE", "user", userId, null, {
      entityLabel: target.fullName,
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin/farmers");
    revalidatePath("/admin");
    revalidatePath("/admin/activity");
    return { success: true, message: "Akun berhasil dipulihkan" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal memulihkan akun" };
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
    [pendingFarmers],
    [verifiedFarmers],
    [rejectedFarmers],
    [verifiedCommodities],
    [rejectedCommodities],
    [activeOrders],
    [completedOrders],
    [cancelledOrders],
    [failedPayments],
    [unreadMessages],
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
    db.select({ count: sql<number>`count(*)::int` }).from(usersTable).where(and(eq(usersTable.role, "petani"), eq(usersTable.status, "pending"))),
    db.select({ count: sql<number>`count(*)::int` }).from(usersTable).where(and(eq(usersTable.role, "petani"), eq(usersTable.status, "verified"))),
    db.select({ count: sql<number>`count(*)::int` }).from(usersTable).where(and(eq(usersTable.role, "petani"), eq(usersTable.status, "rejected"))),
    db.select({ count: sql<number>`count(*)::int` }).from(commoditiesTable).where(eq(commoditiesTable.status, "verified")),
    db.select({ count: sql<number>`count(*)::int` }).from(commoditiesTable).where(eq(commoditiesTable.status, "rejected")),
    db.select({ count: sql<number>`count(*)::int` }).from(ordersTable).where(inArray(ordersTable.status, ["confirmed", "processing", "shipped"])),
    db.select({ count: sql<number>`count(*)::int` }).from(ordersTable).where(eq(ordersTable.status, "completed")),
    db.select({ count: sql<number>`count(*)::int` }).from(ordersTable).where(eq(ordersTable.status, "cancelled")),
    db.select({ count: sql<number>`count(*)::int` }).from(paymentsTable).where(eq(paymentsTable.status, "failed")),
    db.select({ count: sql<number>`count(*)::int` }).from(contactMessagesTable).where(eq(contactMessagesTable.status, "unread")),
  ]);

  const totalFeeRevenue = Number(feeRevenueRows[0]?.total ?? 0);
  const totalTransactionVolume = Number(transactionVolumeRows[0]?.total ?? 0);

  return {
    totalUsers: Number(totalUsers?.count ?? 0),
    totalFarmers: Number(totalFarmers?.count ?? 0),
    totalBuyers: Number(totalBuyers?.count ?? 0),
    totalCommodities: Number(totalCommodities?.count ?? 0),
    pendingCommodities: Number(pendingCommodities?.count ?? 0),
    verifiedCommodities: Number(verifiedCommodities?.count ?? 0),
    rejectedCommodities: Number(rejectedCommodities?.count ?? 0),
    pendingUsers: Number(pendingUsers?.count ?? 0),
    pendingFarmers: Number(pendingFarmers?.count ?? 0),
    verifiedFarmers: Number(verifiedFarmers?.count ?? 0),
    rejectedFarmers: Number(rejectedFarmers?.count ?? 0),
    totalOrders: Number(totalOrders?.count ?? 0),
    activeOrders: Number(activeOrders?.count ?? 0),
    completedOrders: Number(completedOrders?.count ?? 0),
    problematicOrders:
      Number(cancelledOrders?.count ?? 0) + Number(failedPayments?.count ?? 0),
    totalPaidPayments: Number(totalPaidPayments?.count ?? 0),
    totalFeeRevenue,
    totalTransactionVolume,
    pendingOrders: Number(pendingOrdersRows[0]?.count ?? 0),
    unreadMessages: Number(unreadMessages?.count ?? 0),
  };
}

/* ═══════════════════════════════════════════════════════════
   QUERIES PEMBACAAN ADMIN (pagination server-side)
   ═══════════════════════════════════════════════════════════ */

const ADMIN_PAGE_SIZE = 20;

function buildAdminPagination(params?: {
  page?: number;
  pageSize?: number;
}) {
  const page = Math.max(1, params?.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, params?.pageSize ?? ADMIN_PAGE_SIZE));
  return { page, pageSize, offset: (page - 1) * pageSize };
}

/** Daftar petani untuk admin (search, filter status, pagination). */
export async function getAdminFarmers(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}) {
  const { pageSize, offset } = buildAdminPagination(params);
  const conditions = [eq(usersTable.role, "petani")];

  const search = params?.search?.trim();
  if (search) {
    const q = `%${search}%`;
    conditions.push(
      or(
        ilike(usersTable.fullName, q),
        ilike(usersTable.username, q),
        ilike(usersTable.email, q),
        ilike(usersTable.noTelp, q),
        ilike(usersTable.village, q),
      )!,
    );
  }
  if (params?.status && params.status !== "all") {
    conditions.push(eq(usersTable.status, params.status as never));
  }

  const commodityCountSub = db
    .select({
      farmerId: commoditiesTable.farmerId,
      total: sql<number>`count(*)::int`.as("total"),
    })
    .from(commoditiesTable)
    .groupBy(commoditiesTable.farmerId)
    .as("admin_farmer_commodity_count");

  return db
    .select({
      id: usersTable.id,
      fullName: usersTable.fullName,
      username: usersTable.username,
      email: usersTable.email,
      noTelp: usersTable.noTelp,
      fotoProfile: usersTable.fotoProfile,
      village: usersTable.village,
      address: usersTable.address,
      status: usersTable.status,
      rejectedReason: usersTable.rejectedReason,
      reviewedAt: usersTable.reviewedAt,
      createdAt: usersTable.createdAt,
      commodityCount: sql<number>`coalesce(${commodityCountSub.total}, 0)`,
    })
    .from(usersTable)
    .leftJoin(commodityCountSub, eq(commodityCountSub.farmerId, usersTable.id))
    .where(and(...conditions))
    .orderBy(desc(usersTable.createdAt))
    .limit(pageSize)
    .offset(offset);
}

export async function countAdminFarmers(params?: {
  search?: string;
  status?: string;
}) {
  const conditions = [eq(usersTable.role, "petani")];
  const search = params?.search?.trim();
  if (search) {
    const q = `%${search}%`;
    conditions.push(
      or(
        ilike(usersTable.fullName, q),
        ilike(usersTable.username, q),
        ilike(usersTable.email, q),
        ilike(usersTable.noTelp, q),
        ilike(usersTable.village, q),
      )!,
    );
  }
  if (params?.status && params.status !== "all") {
    conditions.push(eq(usersTable.status, params.status as never));
  }
  const [result] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(usersTable)
    .where(and(...conditions));
  return result?.total ?? 0;
}

/** Detail lengkap petani untuk halaman /admin/farmers/[id]. */
export async function getAdminFarmerDetail(farmerId: number) {
  const [farmer] = await db
    .select({
      id: usersTable.id,
      username: usersTable.username,
      fullName: usersTable.fullName,
      noTelp: usersTable.noTelp,
      email: usersTable.email,
      fotoProfile: usersTable.fotoProfile,
      address: usersTable.address,
      bio: usersTable.bio,
      farmingExperience: usersTable.farmingExperience,
      farmArea: usersTable.farmArea,
      farmingMethod: usersTable.farmingMethod,
      village: usersTable.village,
      status: usersTable.status,
      rejectedReason: usersTable.rejectedReason,
      reviewedAt: usersTable.reviewedAt,
      reviewedBy: usersTable.reviewedBy,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .where(and(eq(usersTable.id, farmerId), eq(usersTable.role, "petani")));

  if (!farmer) return null;

  const [reviewer] = farmer.reviewedBy
    ? await db
        .select({
          fullName: reviewerUser.fullName,
          email: reviewerUser.email,
        })
        .from(reviewerUser)
        .where(eq(reviewerUser.id, farmer.reviewedBy))
    : [null];

  const commodities = await db
    .select({
      id: commoditiesTable.id,
      name: commoditiesTable.name,
      price: commoditiesTable.price,
      stock: commoditiesTable.stock,
      unit: commoditiesTable.unit,
      quality: commoditiesTable.quality,
      location: commoditiesTable.location,
      status: commoditiesTable.status,
      isPublished: commoditiesTable.isPublished,
      rejectedReason: commoditiesTable.rejectedReason,
      createdAt: commoditiesTable.createdAt,
      categoryName: categoriesTable.name,
      image: ImageUpload.secureUrl,
      rating: commoditiesTable.rating,
      reviewCount: commoditiesTable.reviewCount,
    })
    .from(commoditiesTable)
    .innerJoin(categoriesTable, eq(categoriesTable.id, commoditiesTable.categoryId))
    .leftJoin(ImageUpload, eq(ImageUpload.id, commoditiesTable.image))
    .where(eq(commoditiesTable.farmerId, farmerId))
    .orderBy(desc(commoditiesTable.createdAt));

  const [orderStats] = await db
    .select({
      totalOrders: sql<number>`count(*)::int`,
      completedOrders: sql<number>`count(*) filter (where ${ordersTable.status} = 'completed')::int`,
      activeOrders: sql<number>`count(*) filter (where ${ordersTable.status} in ('confirmed','processing','shipped'))::int`,
      revenue: sql<string>`coalesce(sum(${ordersTable.totalPrice}) filter (where ${ordersTable.status} = 'completed'), 0)`,
    })
    .from(ordersTable)
    .where(eq(ordersTable.farmerId, farmerId));

  const [ratingAgg] = await db
    .select({
      avgRating: avg(reviewsTable.rating),
      reviewCount: sql<number>`count(*)::int`,
    })
    .from(reviewsTable)
    .where(eq(reviewsTable.farmerId, farmerId));

  const farmImages = await db
    .select()
    .from(farmerProfileImagesTable)
    .where(eq(farmerProfileImagesTable.farmerId, farmerId))
    .orderBy(asc(farmerProfileImagesTable.sortOrder));

  return {
    ...farmer,
    reviewer,
    commodities,
    farmImages,
    avgRating: ratingAgg?.avgRating ? Number(ratingAgg.avgRating) : null,
    reviewCount: ratingAgg?.reviewCount ?? 0,
    totalOrders: orderStats?.totalOrders ?? 0,
    completedOrders: orderStats?.completedOrders ?? 0,
    activeOrders: orderStats?.activeOrders ?? 0,
    revenue: orderStats?.revenue ?? "0",
  };
}

/** Detail komoditas untuk admin (produk + petani + informasi penjualan). */
export async function getAdminCommodityDetail(commodityId: number) {
  const [commodity] = await db
    .select({
      id: commoditiesTable.id,
      name: commoditiesTable.name,
      description: commoditiesTable.description,
      price: commoditiesTable.price,
      minPrice: commoditiesTable.minPrice,
      maxPrice: commoditiesTable.maxPrice,
      stock: commoditiesTable.stock,
      unit: commoditiesTable.unit,
      quality: commoditiesTable.quality,
      location: commoditiesTable.location,
      isPublished: commoditiesTable.isPublished,
      minWeightForNego: commoditiesTable.minWeightForNego,
      fixedPrice: commoditiesTable.fixedPrice,
      harvestEstimate: commoditiesTable.harvestEstimate,
      image: ImageUpload.secureUrl,
      images: commoditiesTable.images,
      videoUrl: commoditiesTable.videoUrl,
      status: commoditiesTable.status,
      rejectedReason: commoditiesTable.rejectedReason,
      reviewedAt: commoditiesTable.reviewedAt,
      reviewedBy: commoditiesTable.reviewedBy,
      rating: commoditiesTable.rating,
      reviewCount: commoditiesTable.reviewCount,
      createdAt: commoditiesTable.createdAt,
      categoryId: commoditiesTable.categoryId,
      categoryName: categoriesTable.name,
      categoryIcon: categoriesTable.icon,
      farmerId: commoditiesTable.farmerId,
      farmerName: usersTable.fullName,
      farmerFotoProfile: usersTable.fotoProfile,
      farmerVillage: usersTable.village,
      farmerStatus: usersTable.status,
      farmerEmail: usersTable.email,
      farmerNoTelp: usersTable.noTelp,
      farmerCreatedAt: usersTable.createdAt,
    })
    .from(commoditiesTable)
    .innerJoin(categoriesTable, eq(categoriesTable.id, commoditiesTable.categoryId))
    .innerJoin(usersTable, eq(usersTable.id, commoditiesTable.farmerId))
    .leftJoin(ImageUpload, eq(ImageUpload.id, commoditiesTable.image))
    .where(eq(commoditiesTable.id, commodityId));

  if (!commodity) return null;

  const [reviewer] = commodity.reviewedBy
    ? await db
        .select({ fullName: reviewerUser.fullName })
        .from(reviewerUser)
        .where(eq(reviewerUser.id, commodity.reviewedBy))
    : [null];

  const [farmerRating] = await db
    .select({
      avgRating: avg(reviewsTable.rating),
      reviewCount: sql<number>`count(*)::int`,
    })
    .from(reviewsTable)
    .where(eq(reviewsTable.farmerId, commodity.farmerId));

  const [sales] = await db
    .select({
      totalSold: sql<string>`coalesce(sum(${ordersTable.quantity}) filter (where ${ordersTable.status} <> 'cancelled'), 0)`,
      totalOrders: sql<number>`count(*)::int`,
      activeOrders: sql<number>`count(*) filter (where ${ordersTable.status} in ('confirmed','processing','shipped'))::int`,
    })
    .from(ordersTable)
    .where(eq(ordersTable.commodityId, commodityId));

  return {
    ...commodity,
    reviewer,
    farmerAvgRating: farmerRating?.avgRating ? Number(farmerRating.avgRating) : null,
    farmerReviewCount: farmerRating?.reviewCount ?? 0,
    totalSold: sales?.totalSold ?? "0",
    totalOrderCount: sales?.totalOrders ?? 0,
    activeOrderCount: sales?.activeOrders ?? 0,
  };
}

/** Detail user untuk /admin/users/[id]. */
export async function getAdminUserDetail(userId: number) {
  const [user] = await db
    .select({
      id: usersTable.id,
      username: usersTable.username,
      fullName: usersTable.fullName,
      noTelp: usersTable.noTelp,
      email: usersTable.email,
      role: usersTable.role,
      businessType: usersTable.businessType,
      preferredCommodity: usersTable.preferredCommodity,
      demandScale: usersTable.demandScale,
      fotoProfile: usersTable.fotoProfile,
      address: usersTable.address,
      bio: usersTable.bio,
      farmingExperience: usersTable.farmingExperience,
      farmArea: usersTable.farmArea,
      farmingMethod: usersTable.farmingMethod,
      village: usersTable.village,
      status: usersTable.status,
      rejectedReason: usersTable.rejectedReason,
      reviewedAt: usersTable.reviewedAt,
      reviewedBy: usersTable.reviewedBy,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  if (!user) return null;

  const [reviewer] = user.reviewedBy
    ? await db
        .select({ fullName: reviewerUser.fullName })
        .from(reviewerUser)
        .where(eq(reviewerUser.id, user.reviewedBy))
    : [null];

  const [orderStats] = await db
    .select({
      totalOrders: sql<number>`count(*)::int`,
      activeOrders: sql<number>`count(*) filter (where ${ordersTable.status} in ('confirmed','processing','shipped'))::int`,
      completedOrders: sql<number>`count(*) filter (where ${ordersTable.status} = 'completed')::int`,
      totalSpent: sql<string>`coalesce(sum(${ordersTable.totalPrice}) filter (where ${ordersTable.status} <> 'cancelled'), 0)`,
    })
    .from(ordersTable)
    .where(eq(ordersTable.buyerId, userId));

  const [farmerStats] = await db
    .select({
      commodityCount: sql<number>`count(*)::int`,
    })
    .from(commoditiesTable)
    .where(eq(commoditiesTable.farmerId, userId));

  const orders = await db
    .select({
      id: ordersTable.id,
      orderCode: ordersTable.orderCode,
      totalPrice: ordersTable.totalPrice,
      status: ordersTable.status,
      createdAt: ordersTable.createdAt,
      commodityName: commoditiesTable.name,
      paymentStatus: paymentsTable.status,
    })
    .from(ordersTable)
    .innerJoin(commoditiesTable, eq(commoditiesTable.id, ordersTable.commodityId))
    .leftJoin(paymentsTable, eq(paymentsTable.orderId, ordersTable.id))
    .where(
      user.role === "petani"
        ? eq(ordersTable.farmerId, userId)
        : eq(ordersTable.buyerId, userId),
    )
    .orderBy(desc(ordersTable.createdAt))
    .limit(10);

  const activity = await db
    .select()
    .from(adminActivityLogTable)
    .where(
      and(
        eq(adminActivityLogTable.entityType, "user"),
        eq(adminActivityLogTable.entityId, userId),
      ),
    )
    .orderBy(desc(adminActivityLogTable.createdAt))
    .limit(20);

  return {
    ...user,
    reviewer,
    totalOrders: orderStats?.totalOrders ?? 0,
    activeOrders: orderStats?.activeOrders ?? 0,
    completedOrders: orderStats?.completedOrders ?? 0,
    totalSpent: orderStats?.totalSpent ?? "0",
    commodityCount: farmerStats?.commodityCount ?? 0,
    orders,
    activity,
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
/* ═══════════════════════════════════════════════════════════
   ORDER DETAIL (relasi Buyer → Order → Komoditas → Petani →
   Payment → Delivery, lengkap dengan kontak)
   ═══════════════════════════════════════════════════════════ */
export async function getAdminOrderDetail(orderId: number) {
  const [order] = await db
    .select({
      id: ordersTable.id,
      orderCode: ordersTable.orderCode,
      quantity: ordersTable.quantity,
      unitPrice: ordersTable.unitPrice,
      subtotal: ordersTable.subtotal,
      serviceFee: ordersTable.serviceFee,
      deliveryFee: ordersTable.deliveryFee,
      totalPrice: ordersTable.totalPrice,
      deliveryMethod: ordersTable.deliveryMethod,
      deliveryAddress: ordersTable.deliveryAddress,
      recipientName: ordersTable.recipientName,
      recipientPhone: ordersTable.recipientPhone,
      addressStreet: ordersTable.addressStreet,
      addressProvince: ordersTable.addressProvince,
      addressCity: ordersTable.addressCity,
      addressDistrict: ordersTable.addressDistrict,
      addressPostalCode: ordersTable.addressPostalCode,
      addressNotes: ordersTable.addressNotes,
      status: ordersTable.status,
      notes: ordersTable.notes,
      createdAt: ordersTable.createdAt,
      updatedAt: ordersTable.updatedAt,
      buyerId: ordersTable.buyerId,
      farmerId: ordersTable.farmerId,
      commodityId: ordersTable.commodityId,
      commodityName: commoditiesTable.name,
      commodityImage: ImageUpload.secureUrl,
      commodityImages: commoditiesTable.images,
      commodityUnit: commoditiesTable.unit,
      commodityLocation: commoditiesTable.location,
      buyerName: buyerUser.fullName,
      buyerNoTelp: buyerUser.noTelp,
      buyerEmail: buyerUser.email,
      buyerStatus: buyerUser.status,
      farmerName: farmerUser.fullName,
      farmerNoTelp: farmerUser.noTelp,
      farmerEmail: farmerUser.email,
      farmerStatus: farmerUser.status,
      farmerVillage: farmerUser.village,
      paymentId: paymentsTable.id,
      paymentMethod: paymentsTable.method,
      paymentStatus: paymentsTable.status,
      paymentReference: paymentsTable.referenceCode,
      paymentPaidAt: paymentsTable.paidAt,
    })
    .from(ordersTable)
    .innerJoin(commoditiesTable, eq(commoditiesTable.id, ordersTable.commodityId))
    .leftJoin(ImageUpload, eq(ImageUpload.id, commoditiesTable.image))
    .innerJoin(buyerUser, eq(buyerUser.id, ordersTable.buyerId))
    .innerJoin(farmerUser, eq(farmerUser.id, ordersTable.farmerId))
    .leftJoin(paymentsTable, eq(paymentsTable.orderId, ordersTable.id))
    .where(eq(ordersTable.id, orderId));

  return order ?? null;
}

/* ═══════════════════════════════════════════════════════════
   PAYMENT MONITORING (read-only, status dari sistem payment)
   ═══════════════════════════════════════════════════════════ */
export async function getAdminPayments(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  method?: string;
}) {
  const { pageSize, offset } = buildAdminPagination(params);
  const conditions: SQL[] = [];

  const search = params?.search?.trim();
  if (search) {
    const q = `%${search}%`;
    conditions.push(
      or(
        ilike(paymentsTable.referenceCode, q),
        ilike(ordersTable.orderCode, q),
        ilike(usersTable.fullName, q),
      )!,
    );
  }
  if (params?.status && params.status !== "all") {
    conditions.push(eq(paymentsTable.status, params.status as never));
  }
  if (params?.method && params.method !== "all") {
    conditions.push(eq(paymentsTable.method, params.method as never));
  }

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
      orderId: ordersTable.id,
      orderCode: ordersTable.orderCode,
      orderStatus: ordersTable.status,
      buyerName: usersTable.fullName,
      commodityName: commoditiesTable.name,
    })
    .from(paymentsTable)
    .innerJoin(ordersTable, eq(ordersTable.id, paymentsTable.orderId))
    .innerJoin(usersTable, eq(usersTable.id, paymentsTable.buyerId))
    .innerJoin(commoditiesTable, eq(commoditiesTable.id, ordersTable.commodityId))
    .where(and(...conditions))
    .orderBy(desc(paymentsTable.createdAt))
    .limit(pageSize)
    .offset(offset);
}

export async function countAdminPayments(params?: {
  search?: string;
  status?: string;
  method?: string;
}) {
  const conditions: SQL[] = [];
  const search = params?.search?.trim();
  if (search) {
    const q = `%${search}%`;
    conditions.push(
      or(
        ilike(paymentsTable.referenceCode, q),
        ilike(ordersTable.orderCode, q),
        ilike(usersTable.fullName, q),
      )!,
    );
  }
  if (params?.status && params.status !== "all") {
    conditions.push(eq(paymentsTable.status, params.status as never));
  }
  if (params?.method && params.method !== "all") {
    conditions.push(eq(paymentsTable.method, params.method as never));
  }

  const [result] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(paymentsTable)
    .innerJoin(ordersTable, eq(ordersTable.id, paymentsTable.orderId))
    .innerJoin(usersTable, eq(usersTable.id, paymentsTable.buyerId))
    .where(and(...conditions));
  return result?.total ?? 0;
}

/* ═══════════════════════════════════════════════════════════
   DISTRIBUTION / DELIVERY MONITORING
   ═══════════════════════════════════════════════════════════ */
export async function getAdminDistribution(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  deliveryMethod?: string;
  status?: string;
}) {
  const { pageSize, offset } = buildAdminPagination(params);
  const conditions: SQL[] = [];

  const search = params?.search?.trim();
  if (search) {
    const q = `%${search}%`;
    conditions.push(
      or(
        ilike(ordersTable.orderCode, q),
        ilike(buyerUser.fullName, q),
        ilike(farmerUser.fullName, q),
        ilike(ordersTable.deliveryAddress, q),
      )!,
    );
  }
  if (params?.deliveryMethod && params.deliveryMethod !== "all") {
    conditions.push(
      eq(ordersTable.deliveryMethod, params.deliveryMethod as never),
    );
  }
  if (params?.status && params.status !== "all") {
    conditions.push(eq(ordersTable.status, params.status as never));
  }

  return db
    .select({
      id: ordersTable.id,
      orderCode: ordersTable.orderCode,
      status: ordersTable.status,
      deliveryMethod: ordersTable.deliveryMethod,
      deliveryAddress: ordersTable.deliveryAddress,
      recipientName: ordersTable.recipientName,
      recipientPhone: ordersTable.recipientPhone,
      addressStreet: ordersTable.addressStreet,
      addressCity: ordersTable.addressCity,
      addressProvince: ordersTable.addressProvince,
      totalPrice: ordersTable.totalPrice,
      createdAt: ordersTable.createdAt,
      updatedAt: ordersTable.updatedAt,
      buyerId: buyerUser.id,
      buyerName: buyerUser.fullName,
      buyerNoTelp: buyerUser.noTelp,
      farmerId: farmerUser.id,
      farmerName: farmerUser.fullName,
      commodityName: commoditiesTable.name,
      paymentStatus: paymentsTable.status,
    })
    .from(ordersTable)
    .innerJoin(commoditiesTable, eq(commoditiesTable.id, ordersTable.commodityId))
    .innerJoin(buyerUser, eq(buyerUser.id, ordersTable.buyerId))
    .innerJoin(farmerUser, eq(farmerUser.id, ordersTable.farmerId))
    .leftJoin(paymentsTable, eq(paymentsTable.orderId, ordersTable.id))
    .where(and(...conditions))
    .orderBy(desc(ordersTable.createdAt))
    .limit(pageSize)
    .offset(offset);
}

export async function countAdminDistribution(params?: {
  search?: string;
  deliveryMethod?: string;
  status?: string;
}) {
  const conditions: SQL[] = [];
  const search = params?.search?.trim();
  if (search) {
    const q = `%${search}%`;
    conditions.push(
      or(
        ilike(ordersTable.orderCode, q),
        ilike(buyerUser.fullName, q),
        ilike(farmerUser.fullName, q),
      )!,
    );
  }
  if (params?.deliveryMethod && params.deliveryMethod !== "all") {
    conditions.push(
      eq(ordersTable.deliveryMethod, params.deliveryMethod as never),
    );
  }
  if (params?.status && params.status !== "all") {
    conditions.push(eq(ordersTable.status, params.status as never));
  }

  const [result] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(ordersTable)
    .innerJoin(buyerUser, eq(buyerUser.id, ordersTable.buyerId))
    .innerJoin(farmerUser, eq(farmerUser.id, ordersTable.farmerId))
    .where(and(...conditions));
  return result?.total ?? 0;
}

/* ═══════════════════════════════════════════════════════════
   AUDIT LOG
   ═══════════════════════════════════════════════════════════ */
export async function getAdminAuditLogs(params?: {
  page?: number;
  pageSize?: number;
  action?: string;
  entityType?: string;
}) {
  const { pageSize, offset } = buildAdminPagination(params);
  const conditions: SQL[] = [];

  if (params?.action && params.action !== "all") {
    conditions.push(eq(adminActivityLogTable.action, params.action));
  }
  if (params?.entityType && params.entityType !== "all") {
    conditions.push(
      eq(adminActivityLogTable.entityType, params.entityType),
    );
  }

  return db
    .select({
      id: adminActivityLogTable.id,
      adminId: adminActivityLogTable.adminId,
      adminName: usersTable.fullName,
      adminFotoProfile: usersTable.fotoProfile,
      action: adminActivityLogTable.action,
      entityType: adminActivityLogTable.entityType,
      entityId: adminActivityLogTable.entityId,
      reason: adminActivityLogTable.reason,
      metadata: adminActivityLogTable.metadata,
      createdAt: adminActivityLogTable.createdAt,
    })
    .from(adminActivityLogTable)
    .innerJoin(usersTable, eq(usersTable.id, adminActivityLogTable.adminId))
    .where(and(...conditions))
    .orderBy(desc(adminActivityLogTable.createdAt))
    .limit(pageSize)
    .offset(offset);
}

export async function countAdminAuditLogs(params?: {
  action?: string;
  entityType?: string;
}) {
  const conditions: SQL[] = [];
  if (params?.action && params.action !== "all") {
    conditions.push(eq(adminActivityLogTable.action, params.action));
  }
  if (params?.entityType && params.entityType !== "all") {
    conditions.push(
      eq(adminActivityLogTable.entityType, params.entityType),
    );
  }
  const [result] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(adminActivityLogTable)
    .where(and(...conditions));
  return result?.total ?? 0;
}

/* ═══════════════════════════════════════════════════════════
   RECENT ACTIVITY (dashboard feed)
   ═══════════════════════════════════════════════════════════ */
export async function getRecentActivity(limit = 15) {
  const safeLimit = Math.min(50, Math.max(1, limit));

  const [newUsers, newCommodities, newOrders, paidPayments, logs] =
    await Promise.all([
      db
        .select({
          id: usersTable.id,
          fullName: usersTable.fullName,
          role: usersTable.role,
          createdAt: usersTable.createdAt,
        })
        .from(usersTable)
        .orderBy(desc(usersTable.createdAt))
        .limit(safeLimit),
      db
        .select({
          id: commoditiesTable.id,
          name: commoditiesTable.name,
          status: commoditiesTable.status,
          createdAt: commoditiesTable.createdAt,
          farmerName: usersTable.fullName,
        })
        .from(commoditiesTable)
        .innerJoin(usersTable, eq(usersTable.id, commoditiesTable.farmerId))
        .orderBy(desc(commoditiesTable.createdAt))
        .limit(safeLimit),
      db
        .select({
          id: ordersTable.id,
          orderCode: ordersTable.orderCode,
          status: ordersTable.status,
          createdAt: ordersTable.createdAt,
          buyerName: buyerUser.fullName,
          totalPrice: ordersTable.totalPrice,
        })
        .from(ordersTable)
        .innerJoin(buyerUser, eq(buyerUser.id, ordersTable.buyerId))
        .orderBy(desc(ordersTable.createdAt))
        .limit(safeLimit),
      db
        .select({
          id: paymentsTable.id,
          orderCode: ordersTable.orderCode,
          amount: paymentsTable.amount,
          paidAt: paymentsTable.paidAt,
          createdAt: paymentsTable.createdAt,
        })
        .from(paymentsTable)
        .innerJoin(ordersTable, eq(ordersTable.id, paymentsTable.orderId))
        .where(eq(paymentsTable.status, "paid"))
        .orderBy(desc(paymentsTable.paidAt))
        .limit(safeLimit),
      db
        .select({
          id: adminActivityLogTable.id,
          adminName: usersTable.fullName,
          action: adminActivityLogTable.action,
          entityType: adminActivityLogTable.entityType,
          entityId: adminActivityLogTable.entityId,
          reason: adminActivityLogTable.reason,
          metadata: adminActivityLogTable.metadata,
          createdAt: adminActivityLogTable.createdAt,
        })
        .from(adminActivityLogTable)
        .innerJoin(usersTable, eq(usersTable.id, adminActivityLogTable.adminId))
        .orderBy(desc(adminActivityLogTable.createdAt))
        .limit(safeLimit),
    ]);

  const entries: Array<{
    key: string;
    type: string;
    title: string;
    description: string;
    href: string;
    createdAt: Date;
  }> = [];

  for (const u of newUsers) {
    const roleLabel =
      u.role === "petani"
        ? "Petani baru"
        : u.role === "admin"
          ? "Admin baru"
          : "Pengguna baru";
    entries.push({
      key: `user-${u.id}`,
      type: "user",
      title: `${roleLabel} mendaftar`,
      description: u.fullName,
      href: `/admin/users/${u.id}`,
      createdAt: u.createdAt,
    });
  }

  for (const c of newCommodities) {
    const statusLabel =
      c.status === "pending"
        ? "menunggu review"
        : c.status === "verified" || c.status === "available"
          ? "terverifikasi"
          : c.status === "rejected"
            ? "ditolak"
            : "diperbarui";
    entries.push({
      key: `commodity-${c.id}`,
      type: "commodity",
      title: `Komoditas "${c.name}" ${statusLabel}`,
      description: `oleh ${c.farmerName}`,
      href: `/admin/commodities/${c.id}`,
      createdAt: c.createdAt,
    });
  }

  for (const o of newOrders) {
    entries.push({
      key: `order-${o.id}`,
      type: "order",
      title: `Pesanan ${o.orderCode} dibuat`,
      description: `oleh ${o.buyerName} · ${o.totalPrice}`,
      href: `/admin/orders/${o.id}`,
      createdAt: o.createdAt,
    });
  }

  for (const p of paidPayments) {
    entries.push({
      key: `payment-${p.id}`,
      type: "payment",
      title: `Pembayaran ${p.orderCode} berhasil`,
      description: p.amount,
      href: `/admin/payments`,
      createdAt: p.paidAt ?? p.createdAt,
    });
  }

  for (const l of logs) {
    const label = ADMIN_ACTION_LABEL[l.action] ?? l.action;
    const entityLabel =
      (l.metadata as Record<string, unknown> | null)?.entityLabel ??
      `${l.entityType} #${l.entityId}`;
    entries.push({
      key: `log-${l.id}`,
      type: "audit",
      title: `Admin ${label.toLowerCase()} ${l.entityType === "farmer" ? "petani" : l.entityType}`,
      description: `${String(entityLabel)}${l.reason ? ` · ${l.reason}` : ""}`,
      href: `/admin/activity`,
      createdAt: l.createdAt,
    });
  }

  return entries
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, safeLimit);
}

/* ═══════════════════════════════════════════════════════════
   VERIFICATION OVERVIEW (verification center)
   ═══════════════════════════════════════════════════════════ */
export async function getVerificationOverview() {
  const [
    [pendingFarmers],
    [approvedFarmers],
    [rejectedFarmers],
    [pendingCommodities],
    [approvedCommodities],
    [rejectedCommodities],
  ] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(usersTable)
      .where(and(eq(usersTable.role, "petani"), eq(usersTable.status, "pending"))),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(usersTable)
      .where(and(eq(usersTable.role, "petani"), eq(usersTable.status, "verified"))),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(usersTable)
      .where(and(eq(usersTable.role, "petani"), eq(usersTable.status, "rejected"))),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(commoditiesTable)
      .where(eq(commoditiesTable.status, "pending")),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(commoditiesTable)
      .where(eq(commoditiesTable.status, "verified")),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(commoditiesTable)
      .where(eq(commoditiesTable.status, "rejected")),
  ]);

  return {
    pendingFarmers: Number(pendingFarmers?.count ?? 0),
    approvedFarmers: Number(approvedFarmers?.count ?? 0),
    rejectedFarmers: Number(rejectedFarmers?.count ?? 0),
    pendingCommodities: Number(pendingCommodities?.count ?? 0),
    approvedCommodities: Number(approvedCommodities?.count ?? 0),
    rejectedCommodities: Number(rejectedCommodities?.count ?? 0),
  };
}

/** Antrean verifikasi petani (status pending), dipakai verification center. */
export async function getPendingFarmerVerifications(limit = 50) {
  return db
    .select({
      id: usersTable.id,
      fullName: usersTable.fullName,
      village: usersTable.village,
      noTelp: usersTable.noTelp,
      email: usersTable.email,
      fotoProfile: usersTable.fotoProfile,
      status: usersTable.status,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .where(and(eq(usersTable.role, "petani"), eq(usersTable.status, "pending")))
    .orderBy(asc(usersTable.createdAt))
    .limit(Math.min(200, Math.max(1, limit)));
}

/** Antrean verifikasi komoditas (status pending), dipakai verification center. */
export async function getPendingCommodityVerifications(limit = 50) {
  return db
    .select({
      id: commoditiesTable.id,
      name: commoditiesTable.name,
      price: commoditiesTable.price,
      stock: commoditiesTable.stock,
      unit: commoditiesTable.unit,
      location: commoditiesTable.location,
      status: commoditiesTable.status,
      createdAt: commoditiesTable.createdAt,
      farmerId: usersTable.id,
      farmerName: usersTable.fullName,
      farmerVillage: usersTable.village,
      farmerStatus: usersTable.status,
      categoryName: categoriesTable.name,
      image: ImageUpload.secureUrl,
    })
    .from(commoditiesTable)
    .innerJoin(usersTable, eq(usersTable.id, commoditiesTable.farmerId))
    .innerJoin(categoriesTable, eq(categoriesTable.id, commoditiesTable.categoryId))
    .leftJoin(ImageUpload, eq(ImageUpload.id, commoditiesTable.image))
    .where(eq(commoditiesTable.status, "pending"))
    .orderBy(asc(commoditiesTable.createdAt))
    .limit(Math.min(200, Math.max(1, limit)));
}

/** Daftar petani untuk halaman verifikasi (semua status, dikelompokkan). */
export async function getFarmerVerificationsByStatus(
  status: "pending" | "verified" | "rejected" | "suspended" | "all",
) {
  const conditions = [eq(usersTable.role, "petani")];
  if (status !== "all") {
    conditions.push(eq(usersTable.status, status as never));
  }
  return db
    .select({
      id: usersTable.id,
      fullName: usersTable.fullName,
      village: usersTable.village,
      noTelp: usersTable.noTelp,
      email: usersTable.email,
      fotoProfile: usersTable.fotoProfile,
      status: usersTable.status,
      rejectedReason: usersTable.rejectedReason,
      reviewedAt: usersTable.reviewedAt,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .where(and(...conditions))
    .orderBy(desc(usersTable.createdAt))
    .limit(200);
}

/** Daftar komoditas untuk halaman verifikasi (semua status). */
export async function getCommodityVerificationsByStatus(
  status: "pending" | "verified" | "rejected" | "all",
) {
  const conditions = status === "all" ? [] : [eq(commoditiesTable.status, status as never)];
  return db
    .select({
      id: commoditiesTable.id,
      name: commoditiesTable.name,
      price: commoditiesTable.price,
      stock: commoditiesTable.stock,
      unit: commoditiesTable.unit,
      location: commoditiesTable.location,
      status: commoditiesTable.status,
      rejectedReason: commoditiesTable.rejectedReason,
      reviewedAt: commoditiesTable.reviewedAt,
      createdAt: commoditiesTable.createdAt,
      farmerId: usersTable.id,
      farmerName: usersTable.fullName,
      farmerVillage: usersTable.village,
      farmerStatus: usersTable.status,
      categoryName: categoriesTable.name,
      image: ImageUpload.secureUrl,
    })
    .from(commoditiesTable)
    .innerJoin(usersTable, eq(usersTable.id, commoditiesTable.farmerId))
    .innerJoin(categoriesTable, eq(categoriesTable.id, commoditiesTable.categoryId))
    .leftJoin(ImageUpload, eq(ImageUpload.id, commoditiesTable.image))
    .where(and(...conditions))
    .orderBy(desc(commoditiesTable.createdAt))
    .limit(200);
}
