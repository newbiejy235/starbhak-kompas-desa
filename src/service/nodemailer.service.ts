import nodemailer from "nodemailer";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function verification(email: string) {
  try {
    const validatedEmail = await db
      .select({ email: usersTable.email })
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    const getEmail = await validatedEmail[0].email;

    if (validatedEmail.length == 0) {
      return {
        success: false,
        messgae: "user not found",
      };
    }

    const codeVerifivation = await Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    const expires = new Date(Date.now() + 10 * 60 * 1000);

    // await db
    //   .update(usersTable)
    //   .set({
    //     resetCode: code,
    //     resetCodeExpires: expires,
    //   })
    //   .where(eq(usersTable.email, email));
      
    await sendResetCode(email, codeVerifivation);

    return {
      success: true,
      messgae: "user found",
      data: codeVerifivation,
    };
  } catch (error) {
    console.error("message", error);
    return {
      success: false,
      messgae: "Internal server error",
    };
  }
}

async function sendResetCode(email: string, code: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"My App" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Kode Reset Password",
    html: `
      <h2>Reset Password</h2>

      <p>Gunakan kode berikut untuk reset password:</p>

      <h1>${code}</h1>

      <p>Kode ini berlaku selama 10 menit.</p>

      <p>Jika lu tidak meminta reset password, abaikan email ini.</p>
    `,
  });

  return {
    success: true,
    messgae: "success",
  };
}
