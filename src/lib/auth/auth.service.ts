import { db } from "@/db";
import { usersTable, notificationsTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { hashPassword, comparePassword } from "@/lib/auth/bcrypt";
import { signToken } from "@/lib/auth/jwt";
import type { ActionState } from "@/lib/types/auth";

export type RegisterResult = ActionState & { redirect?: string };

export async function register(data: FormData): Promise<RegisterResult> {
  const fullName = (data.get("fullName") as string)?.trim() || "";
  const username = (data.get("username") as string)?.trim() || "";
  const noTelp = (data.get("noTelp") as string)?.trim() || "";
  const email = (data.get("email") as string)?.trim().toLowerCase() || "";
  const password = (data.get("password") as string) || "";
  const confirmPassword = (data.get("confirmPassword") as string) || "";
  const role = (data.get("role") as string) || "pembeli";
  const address = (data.get("address") as string)?.trim() || "";
  const preferredCommodity =
    (data.get("preferredCommodity") as string)?.trim() || "";
  const demandScale = (data.get("demandScale") as string) || "";

  if (!fullName || !username || !noTelp || !email || !password) {
    return { success: false, message: "Semua field wajib diisi" };
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return { success: false, message: "Format email tidak valid" };
  }

  if (password.length < 6) {
    return { success: false, message: "Kata sandi minimal 6 karakter" };
  }

  if (password !== confirmPassword) {
    return { success: false, message: "Konfirmasi kata sandi tidak cocok" };
  }

  const validRoles = ["petani", "pembeli"];
  if (!validRoles.includes(role)) {
    return { success: false, message: "Peran tidak valid" };
  }

  try {
    const [existing] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (existing) {
      return { success: false, message: "Email sudah terdaftar" };
    }

    const hashedPassword = await hashPassword(password);

    const [user] = await db
      .insert(usersTable)
      .values({
        username,
        fullName,
        noTelp,
        email,
        password: hashedPassword,
        role: role as "petani" | "pembeli",
        businessType: "",
        address: address || null,
        preferredCommodity: preferredCommodity || null,
        demandScale: demandScale as
          | "SKALA_KECIL"
          | "SKALA_MENENGAH"
          | "SKALA_BESAR"
          | "",
        status: "pending",
      })
      .returning({ id: usersTable.id, email: usersTable.email });

    await db.insert(notificationsTable).values({
      userId: user.id,
      title: "Selamat datang di Kompas Desa",
      message: "Akun Anda berhasil dibuat. Menunggu verifikasi admin.",
      type: "system",
    });

    return {
      success: true,
      message: "Akun berhasil dibuat. Silakan masuk.",
      redirect: "/auth/login",
    };
  } catch (error) {
    console.error("register error:", error);
    return { success: false, message: "Pendaftaran gagal, coba lagi nanti" };
  }
}

export type LoginResult = ActionState & {
  redirect?: string;
  token?: string;
  user?: {
    id: number;
    email: string;
    role: string;
    fullName: string;
    status: string;
    fotoProfile?: string | null;
  };
};

export async function login(data: FormData): Promise<LoginResult> {
  const email = (data.get("email") as string)?.trim().toLowerCase() || "";
  const password = (data.get("password") as string) || "";

  if (!email || !password) {
    return { success: false, message: "Email dan kata sandi wajib diisi" };
  }

  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (!user) {
      return { success: false, message: "Email atau kata sandi salah" };
    }

    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) {
      return { success: false, message: "Email atau kata sandi salah" };
    }

    if (user.status === "suspended") {
      return { success: false, message: "Akun Anda sedang ditangguhkan" };
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    });

    let redirect = "/user/home";
    if (user.role === "admin") redirect = "/admin/dashboard";
    if (user.role === "petani") redirect = "/petani/dashboard";

    return {
      success: true,
      message: "Login berhasil",
      redirect,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        status: user.status,
        fotoProfile: user.fotoProfile ?? null,
      },
    };
  } catch (error) {
    console.error("login error:", error);
    return { success: false, message: "Login gagal, coba lagi nanti" };
  }
}

export async function getAuthUser(userId: number) {
  const [user] = await db
    .select({
      id: usersTable.id,
      username: usersTable.username,
      fullName: usersTable.fullName,
      noTelp: usersTable.noTelp,
      email: usersTable.email,
      role: usersTable.role,
      businessType: usersTable.businessType,
      fotoProfile: usersTable.fotoProfile,
      address: usersTable.address,
      status: usersTable.status,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .where(and(eq(usersTable.id, userId)));
  return user ?? null;
}

export async function upgradeToPetani(
  userId: number,
  data: FormData,
): Promise<RegisterResult> {
  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    if (!user) return { success: false, message: "Akun tidak ditemukan" };

    if (user.role === "petani") {
      return {
        success: true,
        message: "Anda sudah menjadi petani",
        redirect: "/petani/dashboard",
      };
    }

    const address = (data.get("address") as string)?.trim() || "";

    await db
      .update(usersTable)
      .set({ role: "petani", address, businessType: "" })
      .where(eq(usersTable.id, userId));

    await db.insert(notificationsTable).values({
      userId,
      title: "Selamat! Anda menjadi Petani",
      message: "Akun Anda ditingkatkan menjadi petani. Silakan tambahkan komoditas Anda.",
      type: "system",
    });

    return {
      success: true,
      message: "Selamat! Anda kini terdaftar sebagai petani",
      redirect: "/petani/dashboard",
    };
  } catch (error) {
    console.error("upgrade to petani error:", error);
    return { success: false, message: "Gagal, coba lagi nanti" };
  }
}
