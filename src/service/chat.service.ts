// import { db } from "@/db";
// import { message, roomChat, usersTable } from "@/db/schema";
// import { and, eq } from "drizzle-orm";

// export async function userMessage(pesan: string) {
//   const [user1] = await db
//     .select({ id: usersTable.id })
//     .from(usersTable)
//     .where(and(eq(usersTable.id, 11), eq(usersTable.role, "petani")));
//   const [user2] = await db
//     .select({ id: usersTable.id })
//     .from(usersTable)
//     .where(and(eq(usersTable.id, 9), eq(usersTable.role, "pembeli")));

//   const insertRoom = await db
//     .insert(roomChat)
//     .values({
//       userId1: user1.id,
//       userId2: user2.id,
//     })
//     .returning({ id: roomChat.id });

//   const roomChatId = insertRoom[0].id;

//   const pesanUser = await db.insert(message).values({
//     message: pesan,
//     roomChat: roomChatId,
//   });

//   return pesanUser;
// }
