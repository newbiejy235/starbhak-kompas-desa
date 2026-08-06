import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
// import { RegisterInput, LoginInput } from "@/lib/types/auth";

export async function register(data: FormData) {
  const userInput = {
    username: data.get("username") as string,
    fullName: data.get("fullName") as string,
    noTelp: data.get("noTelp") as string,
    password: data.get("password") as string,
    email: data.get("email") as string,
  };

  try {
    const users = await db.insert(usersTable).values(userInput);
    console.log(users);
    return { success: true, message: "akun berhasil dibuat" };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "akun gagal dibuat, email sudah terdaftar",
    };
  }
}

export async function login(data: FormData) {
  const loginInput = {
    email: data.get("email") as string,
    password: data.get("password") as string,
  };

  try {
    const [user] = await db
      .select({
        email: usersTable.email,
        password: usersTable.password,
      })
      .from(usersTable)
      .where(
        and(
          eq(usersTable.email, loginInput.email),
          eq(usersTable.password, loginInput.password),
        ),
      );

    if (!user) {
      console.log("gagal");

      return { success: false, message: "Email atau password salah" };
    }
    console.log("berhasil");

    return { success: true, message: "Login berhasil" };
  } catch (error) {
    console.log("error:", error);
    return { success: false, message: "Login gagal" };
  }
}
