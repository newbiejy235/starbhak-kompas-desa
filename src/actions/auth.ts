"use server";

import { login, register } from "@/lib/auth/auth.service";
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
