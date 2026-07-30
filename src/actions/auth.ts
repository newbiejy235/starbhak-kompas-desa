"use server";

import { login, register } from "@/lib/auth/auth.service";
import { RegisterInput,LoginInput } from "@/lib/types/auth";

export async function registerAction(data: RegisterInput) {
  return await register(data);
}

export async function loginAction(data: LoginInput) {
  return await login(data);
}
