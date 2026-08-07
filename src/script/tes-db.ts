// import "dotenv/config";
import { db } from "../db/index";
import { usersTable } from "../db/schema"; // ganti sesuai nama tabel di schema.js lu
import { and, eq } from "drizzle-orm";

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
          eq(usersTable.email, "tiger@gmail.com"),
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
