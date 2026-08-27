# Arsitektur Frontend — Kompas Desa

Panduan singkat: **di mana saya menaruh X?**

| Kebutuhan | Lokasi | Catatan |
|---|---|---|
| Halaman / route | `src/app/<role>/<route>/page.tsx` | Hanya komposisi UI & state halaman. Wajib mengikuti konvensi App Router (`layout.tsx`, `loading.tsx`, dst.). |
| Komponen UI lintas role | `src/components/shared/` | Dipakai ≥2 role (petani + user/admin). Contoh: `DashboardSidebar`, `PageHeader`, `Sonner`, `StatusBadge`. |
| Komponen UI khusus petani | `src/components/petanipage/` | Contoh: `HarvestCalendarGrid`, `PriceChart`, `CommodityFormPopup`. |
| Komponen UI khusus pembeli | `src/components/userpage/` | Contoh: `Header`, `NegoChatbot`. |
| Nilai statis (label, konten, warna brand) | `src/constants/` | Dikelompokkan per domain: `calendar.ts`, `brand.ts`, `panduan.ts`, `bantuan.ts`. Konstanta spesifik satu fitur boleh tinggal di file fiturnya. |
| Fungsi murni reusable (tanpa React/JSX) | `src/utils/` atau `src/lib/format.ts` | Manipulasi tanggal → `utils/date.ts`; format tampilan (rupiah, tanggal, inisial) → `lib/format.ts` (konvensi eksisting). |
| Komunikasi data (query/mutasi DB) | `src/actions/*.ts` | Server Actions dengan `"use server"` — INI lapisan "service" proyek ini. Jangan buat layer service/repository tambahan. |
| Hook React reusable | `src/lib/hooks.ts` | `useFetch`, `useAuth`. Tidak perlu folder `hooks/` terpisah saat ini. |
| Tipe TypeScript turunan dari actions | `src/lib/types/market.ts` | Pola: `type X = Awaited<ReturnType<typeof getX>>[number]`. |
| Infrastruktur / integrasi | `src/lib/` | Auth (JWT, bcrypt), db client Drizzle, cloudinary. |
| Skrip dev/seed | `src/script/` | `npm run seed`, `npm test`. |

## Aturan dependensi

```text
app → components → lib/utils/constants/types
```

- `constants/` dan `utils/` **tidak** mengimpor komponen/halaman.
- Server actions tidak pernah diimpor langsung oleh komponen server untuk render; halaman client memanggilnya via `useFetch` / handler.
- Hindari relative import dalam-dalam; gunakan alias `@/`.

## Keputusan yang disengaja (jangan "perbaiki" tanpa alasan)

1. **Tidak ada `services/`** — Server Actions sudah menjadi batas server/client; menambah layer lagi = duplikasi.
2. **Nama folder tetap `components/petanipage` & `components/userpage`** — konsisten dengan `adminpage`; bukan `petani/user`.
3. **Skeleton kecil & sub-komponen single-use** tetap di file halamannya (contoh: `SalesSkeleton`, `StatCard`). Ekstraksi hanya bila benar-benar reuse.
4. **Konten panduan/bantuan** ada di `src/constants/` agar teks bisa diedit tanpa menyentuh JSX.
