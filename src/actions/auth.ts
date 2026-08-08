"use server";

import { login, register, upgradeToPetani } from "@/lib/auth/auth.service";
import type { ActionState } from "@/lib/types/auth";

export async function loginAction(
  prevState: ActionState | null,
  data: FormData,
) {
  return await login(data);
}

export async function registerAction(
  prevState: ActionState | null,
  data: FormData,
) {
  return await register(data);
}

export async function becomePetaniAction(
  prevState: ActionState | null,
  data: FormData,
) {
  const userId = Number(data.get("userId"));
  if (!userId) return { success: false, message: "Silakan masuk terlebih dahulu" };
  return await upgradeToPetani(userId, data);
}
