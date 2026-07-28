import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { log } from "node:console";

export async function POST(req: Response) {
  const data = await req.json();

  try {
    const login = await db
      .select({
        email: usersTable.email,
        password: usersTable.password,
      })
      .from(usersTable)
      .where(eq(usersTable.email, data) && eq(usersTable.password, data));

      NextResponse.json({
        message: "Login berhasil",
        status: 200
        
      })
  } catch (error) {
    console.log(error);
    NextResponse.json({
        message: error,
        status: 500
    })
    
  }
}
