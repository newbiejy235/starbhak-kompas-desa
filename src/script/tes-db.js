import "dotenv/config";
import { db } from "../db/index";
import { usersTable } from "../db/schema"; // ganti sesuai nama tabel di schema.js lu

async function main() {
  console.log("mulai ambil data....");
  const data = await db.select().from(usersTable);
  console.log(data);
}

main();
