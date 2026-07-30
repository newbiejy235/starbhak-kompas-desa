import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { RegisterInput, LoginInput } from "@/lib/types/auth";

export async function register(data: RegisterInput) {
  try {
    const register_query = await db.insert(usersTable).values({
      nama_pengguna: data.nama_pengguna,
      nama_lengkap: data.nama_lengkap,
      no_telp: data.no_telp,
      email: data.email,
      password: data.password,
      foto_profile: "",
    });
    console.log(register_query);
    return {
      success: true,
      message: "Register berhasil",
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Register gagal",
    };
  }
}

export async function login(data: LoginInput) {
  try {
    const login_query = db
      .select({
        email: usersTable.email,
        password: usersTable.password,
      })
      .from(usersTable)
      .where(
        and(
          eq(usersTable.email, data.email),
          eq(usersTable.password, data.password),
        ),
      );

    console.log(login_query);
    return {
      success: true,
      message: "Login berhasil",
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Login gagal",
    };
  }
}
