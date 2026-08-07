import "dotenv/config";
import { db } from "../db/index";
import {
  usersTable,
  categoriesTable,
  commoditiesTable,
  ordersTable,
  paymentsTable,
  reviewsTable,
  notificationsTable,
  feeSettingsTable,
} from "../db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "../lib/auth/bcrypt";

async function seed() {
  console.log("Seeding...");

  const existing = await db.select().from(usersTable).limit(1);
  if (existing.length > 0) {
    console.log("Database sudah memiliki data, seed dilewati.");
    return;
  }

  const adminPassword = await hashPassword("admin123");
  const farmerPassword = await hashPassword("petani123");
  const buyerPassword = await hashPassword("pembeli123");

  const [admin] = await db
    .insert(usersTable)
    .values({
      username: "admin",
      fullName: "Admin Kompas Desa",
      noTelp: "081234567801",
      email: "admin@kompasdesa.id",
      password: adminPassword,
      role: "admin",
      status: "verified",
    })
    .returning({ id: usersTable.id });

  const [sukarno] = await db
    .insert(usersTable)
    .values({
      username: "pak_sukarno",
      fullName: "Sukarno",
      noTelp: "081234567802",
      email: "sukarno@kompasdesa.id",
      password: farmerPassword,
      role: "petani",
      status: "verified",
      address: "Kecamatan Cibinong, Kabupaten Bogor, Jawa Barat",
      fotoProfile: "",
    })
    .returning({ id: usersTable.id });

  const [dewi] = await db
    .insert(usersTable)
    .values({
      username: "dewi_pertiwi",
      fullName: "Dewi Pertiwi",
      noTelp: "081234567803",
      email: "dewi@kompasdesa.id",
      password: farmerPassword,
      role: "petani",
      status: "verified",
      address: "Kecamatan Parongpong, Kabupaten Bandung Barat, Jawa Barat",
      fotoProfile: "",
    })
    .returning({ id: usersTable.id });

  const [kartini] = await db
    .insert(usersTable)
    .values({
      username: "kartini_agro",
      fullName: "Kartini",
      noTelp: "081234567804",
      email: "kartini@kompasdesa.id",
      password: farmerPassword,
      role: "petani",
      status: "verified",
      address: "Kabupaten Malang, Jawa Timur",
      fotoProfile: "",
    })
    .returning({ id: usersTable.id });

  const [slamet] = await db
    .insert(usersTable)
    .values({
      username: "slamet_panen",
      fullName: "Slamet Riyadi",
      noTelp: "081234567805",
      email: "slamet@kompasdesa.id",
      password: farmerPassword,
      role: "petani",
      status: "pending",
      address: "Kabupaten Karawang, Jawa Barat",
      fotoProfile: "",
    })
    .returning({ id: usersTable.id });

  const [resto] = await db
    .insert(usersTable)
    .values({
      username: "resto_lestari",
      fullName: "Restoran Lestari",
      noTelp: "081234567806",
      email: "resto@kompasdesa.id",
      password: buyerPassword,
      role: "pembeli",
      businessType: "restoran",
      status: "verified",
      address: "Jl. Sudirman No. 12, Jakarta Selatan",
    })
    .returning({ id: usersTable.id });

  const [umkm] = await db
    .insert(usersTable)
    .values({
      username: "umkm_sehat",
      fullName: "UMKM Sehat Jaya",
      noTelp: "081234567807",
      email: "umkm@kompasdesa.id",
      password: buyerPassword,
      role: "pembeli",
      businessType: "umkm",
      status: "verified",
      address: "Jl. Merdeka No. 45, Bandung",
    })
    .returning({ id: usersTable.id });

  const [distributor] = await db
    .insert(usersTable)
    .values({
      username: "distributor_tani",
      fullName: "Distributor Tani Nusantara",
      noTelp: "081234567808",
      email: "distributor@kompasdesa.id",
      password: buyerPassword,
      role: "pembeli",
      businessType: "distributor",
      status: "pending",
      address: "Surabaya, Jawa Timur",
    })
    .returning({ id: usersTable.id });

  const categories = [
    { name: "Padi & Serealia", description: "Beras, gabah, dan hasil serealia", icon: "🌾" },
    { name: "Sayuran", description: "Sayuran segar hasil kebun", icon: "🥬" },
    { name: "Buah-buahan", description: "Buah segar musiman", icon: "🍎" },
    { name: "Palawija", description: "Kacang-kacangan dan umbi", icon: "🥔" },
    { name: "Hortikultura", description: "Tanaman hias dan bumbu", icon: "🌶️" },
  ];

  const insertedCategories: number[] = [];
  for (const c of categories) {
    const [row] = await db
      .insert(categoriesTable)
      .values(c)
      .returning({ id: categoriesTable.id });
    insertedCategories.push(row.id);
  }

  const [padiId, sayurId, buahId, palawijaId, hortikulturaId] = insertedCategories;

  const farmers = [sukarno.id, dewi.id, kartini.id];
  const farmerCommodityIds: number[] = [];

  const commoditySeeds = [
    {
      farmerId: farmers[0],
      categoryId: padiId,
      name: "Beras Pandan Wangi",
      description: "Beras pulen premium hasil panen sawah irigasi teknis. Kualitas super, aroma harum khas pandan.",
      price: 12500,
      stock: 500,
      unit: "kg",
      quality: "Premium",
      location: "Cibinong, Bogor",
      harvestEstimate: new Date("2026-09-15"),
    },
    {
      farmerId: farmers[0],
      categoryId: padiId,
      name: "Gabah Kering Panen",
      description: "Gabah kering berkadar air 12%. Siap digiling, hasil panen musim ini.",
      price: 5800,
      stock: 2000,
      unit: "kg",
      quality: "A",
      location: "Cibinong, Bogor",
      harvestEstimate: new Date("2026-08-20"),
    },
    {
      farmerId: farmers[1],
      categoryId: sayurId,
      name: "Kentang Granola",
      description: "Kentang granola ukuran seragam, bebas hama, cocok untuk restoran dan industri makanan.",
      price: 15000,
      stock: 300,
      unit: "kg",
      quality: "A",
      location: "Parongpong, Bandung Barat",
      harvestEstimate: new Date("2026-08-05"),
    },
    {
      farmerId: farmers[1],
      categoryId: sayurId,
      name: "Tomat Merah Segar",
      description: "Tomat merah cerah dengan tekstur padat, dipanen pagi hari untuk kesegaran maksimal.",
      price: 8000,
      stock: 150,
      unit: "kg",
      quality: "A",
      location: "Parongpong, Bandung Barat",
      harvestEstimate: new Date("2026-07-25"),
    },
    {
      farmerId: farmers[1],
      categoryId: sayurId,
      name: "Kol Hijau Organik",
      description: "Kol hijau ditanam secara organik tanpa pestisida, renyah dan manis.",
      price: 6500,
      stock: 200,
      unit: "kg",
      quality: "Premium",
      location: "Parongpong, Bandung Barat",
      harvestEstimate: new Date("2026-08-01"),
    },
    {
      farmerId: farmers[2],
      categoryId: buahId,
      name: "Apel Manalagi",
      description: "Apel manalagi Malang dengan rasa manis segar, kulit bersih tanpa lapisan lilin.",
      price: 22000,
      stock: 120,
      unit: "kg",
      quality: "Premium",
      location: "Batu, Malang",
      harvestEstimate: new Date("2026-09-01"),
    },
    {
      farmerId: farmers[2],
      categoryId: buahId,
      name: "Jeruk Keprok Batu 55",
      description: "Jeruk keprok batu 55 tanpa biji, manis dan kaya vitamin C.",
      price: 18000,
      stock: 250,
      unit: "kg",
      quality: "A",
      location: "Batu, Malang",
      harvestEstimate: new Date("2026-10-10"),
    },
    {
      farmerId: farmers[2],
      categoryId: hortikulturaId,
      name: "Cabai Rawit Merah",
      description: "Cabai rawit merah pedas, dipetik langsung dari kebun, segar dan kering alami.",
      price: 45000,
      stock: 80,
      unit: "kg",
      quality: "A",
      location: "Batu, Malang",
      harvestEstimate: new Date("2026-07-30"),
    },
    {
      farmerId: farmers[0],
      categoryId: palawijaId,
      name: "Jagung Manis",
      description: "Jagung manis hibrida, biji padat dan manis, cocok untuk dijual ke pasar atau industri pakan.",
      price: 9500,
      stock: 400,
      unit: "kg",
      quality: "A",
      location: "Cibinong, Bogor",
      harvestEstimate: new Date("2026-08-10"),
    },
  ];

  let commodityIndex = 0;
  for (const c of commoditySeeds) {
    const [row] = await db
      .insert(commoditiesTable)
      .values({
        ...c,
        price: String(c.price),
        stock: String(c.stock),
        status:
          commodityIndex === 2 || commodityIndex === 5 || commodityIndex === 7
            ? "pending"
            : "available",
        rating: "0",
        reviewCount: 0,
      })
      .returning({ id: commoditiesTable.id });
    farmerCommodityIds.push(row.id);
    commodityIndex++;
  }

  const [berasId, , kentangId, tomatId, , , jerukId] = farmerCommodityIds;

  await db.insert(ordersTable).values([
    {
      orderCode: "KD-260801-DEMOA1",
      buyerId: resto.id,
      farmerId: sukarno.id,
      commodityId: berasId,
      quantity: "100",
      unitPrice: "12500",
      subtotal: "1250000",
      serviceFee: "31250",
      deliveryFee: "0",
      totalPrice: "1281250",
      deliveryMethod: "pickup",
      deliveryAddress: "",
      status: "completed",
      notes: "Kirim dalam kemasan karung 50kg",
    },
    {
      orderCode: "KD-260802-DEMOA2",
      buyerId: umkm.id,
      farmerId: dewi.id,
      commodityId: kentangId,
      quantity: "80",
      unitPrice: "15000",
      subtotal: "1200000",
      serviceFee: "30000",
      deliveryFee: "25000",
      totalPrice: "1255000",
      deliveryMethod: "expedition",
      deliveryAddress: "Jl. Merdeka No. 45, Bandung",
      status: "shipped",
      notes: "",
    },
    {
      orderCode: "KD-260805-DEMOA3",
      buyerId: resto.id,
      farmerId: dewi.id,
      commodityId: tomatId,
      quantity: "30",
      unitPrice: "8000",
      subtotal: "240000",
      serviceFee: "6000",
      deliveryFee: "0",
      totalPrice: "246000",
      deliveryMethod: "pickup",
      deliveryAddress: "",
      status: "processing",
      notes: "",
    },
    {
      orderCode: "KD-260806-DEMOA4",
      buyerId: umkm.id,
      farmerId: kartini.id,
      commodityId: jerukId,
      quantity: "50",
      unitPrice: "18000",
      subtotal: "900000",
      serviceFee: "22500",
      deliveryFee: "25000",
      totalPrice: "947500",
      deliveryMethod: "expedition",
      deliveryAddress: "Jl. Merdeka No. 45, Bandung",
      status: "pending",
      notes: "Mohon kirim dalam kardus",
    },
  ]);

  const ordersResult = await db
    .select()
    .from(ordersTable)
    .orderBy(ordersTable.createdAt);

  await db.insert(paymentsTable).values([
    {
      orderId: ordersResult[0].id,
      buyerId: resto.id,
      method: "bank_transfer",
      amount: "1281250",
      fee: "31250",
      status: "paid",
      referenceCode: "PY-DEMOA1",
      paidAt: new Date("2026-08-01"),
    },
    {
      orderId: ordersResult[1].id,
      buyerId: umkm.id,
      method: "ewallet",
      amount: "1255000",
      fee: "30000",
      status: "paid",
      referenceCode: "PY-DEMOA2",
      paidAt: new Date("2026-08-02"),
    },
    {
      orderId: ordersResult[2].id,
      buyerId: resto.id,
      method: "qris",
      amount: "246000",
      fee: "6000",
      status: "pending",
      referenceCode: "PY-DEMOA3",
      paidAt: null,
    },
    {
      orderId: ordersResult[3].id,
      buyerId: umkm.id,
      method: "virtual_account",
      amount: "947500",
      fee: "22500",
      status: "pending",
      referenceCode: "PY-DEMOA4",
      paidAt: null,
    },
  ]);

  await db.insert(reviewsTable).values([
    {
      orderId: ordersResult[0].id,
      buyerId: resto.id,
      farmerId: sukarno.id,
      commodityId: berasId,
      rating: 5,
      comment: "Berasnya pulen dan harum, pelayanan petani sangat ramah.",
    },
    {
      orderId: ordersResult[1].id,
      buyerId: umkm.id,
      farmerId: dewi.id,
      commodityId: kentangId,
      rating: 4,
      comment: "Kentangnya seragam, ukuran bagus. Pengiriman sedikit terlambat.",
    },
  ]);

  await db
    .update(commoditiesTable)
    .set({ rating: "5.00", reviewCount: 1 })
    .where(eq(commoditiesTable.id, berasId));

  await db.insert(notificationsTable).values([
    {
      userId: sukarno.id,
      title: "Pesanan Baru",
      message: "Ada pesanan baru KD-260801-DEMOA1 sebesar Rp 1.281.250.",
      type: "order",
      isRead: true,
    },
    {
      userId: dewi.id,
      title: "Pesanan Baru",
      message: "Ada pesanan baru KD-260802-DEMOA2 sebesar Rp 1.255.000.",
      type: "order",
      isRead: true,
    },
    {
      userId: resto.id,
      title: "Pesanan Selesai",
      message: "Pesanan KD-260801-DEMOA1 telah selesai. Terima kasih!",
      type: "order",
      isRead: true,
    },
    {
      userId: umkm.id,
      title: "Pesanan Dibuat",
      message: "Pesanan KD-260806-DEMOA4 berhasil dibuat. Silakan selesaikan pembayaran.",
      type: "order",
      isRead: false,
    },
    {
      userId: slamet.id,
      title: "Selamat datang di Kompas Desa",
      message: "Akun Anda berhasil dibuat. Menunggu verifikasi admin.",
      type: "system",
      isRead: false,
    },
    {
      userId: distributor.id,
      title: "Selamat datang di Kompas Desa",
      message: "Akun Anda berhasil dibuat. Menunggu verifikasi admin.",
      type: "system",
      isRead: false,
    },
    {
      userId: admin.id,
      title: "Verifikasi Akun Baru",
      message: "Terdapat 2 akun baru yang menunggu verifikasi.",
      type: "system",
      isRead: false,
    },
  ]);

  await db.insert(feeSettingsTable).values([
    {
      name: "Biaya Layanan Umum",
      percentage: "2.5",
      categoryId: null,
      active: true,
    },
    {
      name: "Biaya Layanan Padi & Serealia",
      percentage: "1.5",
      categoryId: padiId,
      active: true,
    },
    {
      name: "Biaya Layanan Hortikultura",
      percentage: "3.0",
      categoryId: hortikulturaId,
      active: true,
    },
  ]);

  console.log("Seed selesai.");
  console.log("Akun demo:");
  console.log("  Admin   : admin@kompasdesa.id / admin123");
  console.log("  Petani  : sukarno@kompasdesa.id / petani123");
  console.log("  Pembeli : resto@kompasdesa.id / pembeli123");
}

seed()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
