"use server";

import { verification } from "@/service/nodemailer.service";

export async function sendCode(email: string) {
  try {
    const result = await verification(email);
    console.log("verification result:", result); // tambahin ini, liat exact message-nya
    return result; // langsung return aslinya, jangan di-generalisir
  } catch (error) {
    console.error("error data", error);
    return { success: false, message: "gagal" };
  }
}
