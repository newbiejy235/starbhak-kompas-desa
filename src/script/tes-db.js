import "dotenv/config";
import { db } from "../db/index";
import { usersTable } from "../db/schema"; // ganti sesuai nama tabel di schema.js lu
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

async function main() {
  console.log("mulai ambil data....");
  const data = await db.select().from(usersTable);
  console.log(data);
}

// main();

async function regis() {
  const data = await db.insert(usersTable).values({
    firstName : "jhguggugyu",
    lastName : "hvhgggu",
    noTelp : "gtyfytr",
    email : "agussantoso@gmail.com"
  })

  return data
  
}

regis()





