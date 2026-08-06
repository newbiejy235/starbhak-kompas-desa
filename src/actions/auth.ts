"use server";

import { login, register } from "@/lib/auth/auth.service";
// import { RegisterInput,LoginInput } from "@/lib/types/auth";

export async function loginAction(
  prevState: { success: boolean; message: string } | null,
  data: FormData
) {
  return await login(data);
}

export async function registerAction(
  prevState: { success: boolean; message: string } | null,
  data: FormData
) {
  return await register(data);
}
