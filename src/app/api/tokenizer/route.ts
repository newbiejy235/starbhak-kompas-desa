import Midtrans from "midtrans-client";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { commoditiesTable } from "@/db/schema";

const snap = new Midtrans.Snap({
  isProduction: false,
  serverKey: process.env.SECRET!,
  clientKey: process.env.NEXT_PUBLIC_CLIENT!,
});

export async function POST(request: Request) {
  try {
    const { id, commodityId, price, quantity } = await request.json();

    // Ambil produk berdasarkan commodityId
    // const [commodity] = await db
    //   .select({
    //     id: commoditiesTable.id,
    //     name: commoditiesTable.name,
    //   })
    //   .from(commoditiesTable)
    //   .where(eq(commoditiesTable.id, commodityId))
    //   .limit(1);

    // if (!commodity) {
    //   return Response.json(
    //     { error: "Komoditas tidak ditemukan" },
    //     { status: 404 },
    //   );
    // }

    const parameter = {
      item_details: {
        name: commodityId,
        price: price,
        quantity: quantity,
      },
      transaction_details: {
        order_id: id,
        gross_amount: price * quantity,
      },
      callbacks: {
        finish: "https://starbhak-kompas-desa.vercel.app/auth/login",
      },
    };

    const transaction = await snap.createTransaction(parameter);
    console.log("MIDTRANS RESPONSE:", transaction);

    return Response.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    });
  } catch (error) {
    console.error(error);

    return Response.json({ error: "Gagal membuat transaksi" }, { status: 500 });
  }
}
