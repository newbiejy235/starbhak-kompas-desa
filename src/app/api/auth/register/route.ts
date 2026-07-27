import "dotenv/config";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const data = await req.json();

  try {
    const register = await db.insert(usersTable).values(data);
    console.log(register);

    return NextResponse.json({ message: "Succes" }, { status: 200 });
  } catch (error) {
    console.log(error);

    return NextResponse.json({ message: "Failed (error)" }, { status: 500 });
  }
}
