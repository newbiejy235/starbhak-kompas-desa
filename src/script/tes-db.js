import "dotenv/config";
import { db } from "../db/index";
import { usersTable } from "../db/schema"; // ganti sesuai nama tabel di schema.js lu
import { and, eq } from "drizzle-orm";


async function main() {
  console.log("mulai ambil data....");
  const data = await db.select().from(usersTable);
  console.log(data);
}

// main();

async function regis() {
  const data = await db.insert(usersTable).values({
    firstName: "jhguggugyu",
    lastName: "hvhgggu",
    noTelp: "gtyfytr",
    email: "agussantoso@gmail.com",
  });

  return data;
}

// regis();

async function login() {
  try {
    const data = await db
      .select({
        email: usersTable.email,
        password: usersTable.password,
      })
      .from(usersTable)
      .where(
        and(
          eq(usersTable.email, "admin@gmail.com"),
          eq(usersTable.password, "12345678"),
        ),
      );

    console.log(data);
    return;
  } catch (error) {
    console.log(error);
    return;

}
}

login();
