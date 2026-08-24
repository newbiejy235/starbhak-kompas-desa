"use server";

import { login, register, upgradeToPetani } from "@/lib/auth/auth.service";
import type { ActionState } from "@/lib/types/auth";
import { updatePassword } from "@/lib/auth/auth.service";

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
  if (!userId)
    return { success: false, message: "Silakan masuk terlebih dahulu" };
  return await upgradeToPetani(userId, data);
}

export async function changesPassword(
  email: string,
  newPassword: string,
  code: string,
) {
  try {
    if (!code) {
      return {
        success: false,
        message: "code salah",
      };
    }

    const result = await updatePassword(email, newPassword, code);
    console.log(`status ${result.success} message ${result.message} `);

    return result;
  } catch (error) {
    console.log(error);
  }
}
