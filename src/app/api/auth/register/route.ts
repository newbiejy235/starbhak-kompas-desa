import "dotenv/config";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const data = await req.json();

  const existingEmail = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, data.email));
  if (!existingEmail.length) {
    return NextResponse.json(
      { message: "Data tidak ditemukan" },
      { status: 404 },
    );
  }

  try {
    const succesRegister = await db.insert(usersTable).values(data)
     return NextResponse.json(
      { message: "Registrasi berhasil", succesRegister },
      { status: 201 },
    );

    // Jika data berhasil ditemukan
  } catch (error) {
    // Jika terjadi kesalahan server
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server", error },
      { status: 500 },
    );
  }
}
