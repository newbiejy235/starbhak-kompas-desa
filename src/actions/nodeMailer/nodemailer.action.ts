"use server";

import { verification } from "@/service/nodemailer.service";

export async function sendCode(email: string) {
  try {
    const result = await verification(email);
    return {
      success: true,
      message: "berhasil",
      data : result.data
    };
  } catch (error) {
    console.error("error data", error);

    return {
      success: false,
      message: "gagal",
    };
  }
}

