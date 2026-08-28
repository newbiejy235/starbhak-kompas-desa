# PRD — Tambah Section "Ulasan" (Rating) di Halaman Profile User

## 1. Latar Belakang
Di `src/app/user/profile/page.tsx` (halaman Profil Saya untuk role Pembeli),
saat ini belum ada tampilan rating/ulasan sama sekali.

Setelah dicek, backend **sudah menghitung data ini** dan tidak perlu diubah:

- `actions/profile.ts` → fungsi `getProfile(userId)` sudah mengembalikan
  `avgRating` (rata-rata dari `reviewsTable.rating`, dibulatkan 1 desimal)
  dan `reviewCount` (jumlah ulasan), dengan fallback `avgRating: 0` kalau
  belum ada ulasan sama sekali:

  ```ts
  avgRating: reviewStats?.avgRating
    ? Number(Number(reviewStats.avgRating).toFixed(1))
    : 0,
  reviewCount: reviewStats?.reviewCount ?? 0,
  ```

- Pola tampilan yang sama **sudah dipakai** di halaman profile Petani
  (`src/app/petani/profile/page.tsx` via komponen
  `src/components/petanipage/profile/StatistikCard.tsx`), jadi ini bukan
  fitur baru dari nol — tinggal direplikasi ke sisi Pembeli dengan gaya
  komponen yang sudah dipakai di `user/profile/page.tsx`.

Kesimpulan: **tidak perlu perubahan backend/actions/database.** Task ini
murni UI — menampilkan field `avgRating` & `reviewCount` yang sudah
dikembalikan `getProfile()` ke halaman profile user.

## 2. Tujuan
Menambahkan section/kartu "Ulasan" di halaman `src/app/user/profile/page.tsx`
yang menampilkan:
- Rata-rata rating (`avgRating`), dibulatkan 1 desimal.
- Jumlah ulasan (`reviewCount`).
- Kalau belum ada ulasan sama sekali (`reviewCount === 0` /
  `avgRating === 0`), tampilkan rating **"0"** (atau "0.0"), **jangan**
  ditampilkan sebagai strip "-", kosong, atau disembunyikan.

## 3. Non-Goals — WAJIB DIPATUHI
- **Jangan ubah `actions/profile.ts`** — `getProfile()` sudah mengembalikan
  data yang dibutuhkan, tidak perlu query baru atau field baru.
- **Jangan ubah `updateProfile()`** atau logic form edit profile yang sudah
  ada di halaman ini.
- **Jangan ubah halaman/komponen lain** di luar
  `src/app/user/profile/page.tsx` (termasuk jangan sentuh halaman petani,
  `StatistikCard.tsx` milik petani, dsb — boleh dijadikan referensi visual,
  tapi filenya sendiri tidak diubah).
- **Jangan ubah struktur type `AuthUser`** di `lib/types/market.ts`.
- Tidak menambah dependency/package baru.
- Tidak mengubah behavior form edit profil, upload foto, ubah password,
  atau bagian lain yang sudah berjalan di halaman ini.

## 4. Detail Implementasi

### 4.1 Lokasi perubahan
Hanya file: **`src/app/user/profile/page.tsx`**

### 4.2 Sumber data
Data `avgRating` dan `reviewCount` sudah ada di object `profile` yang
di-fetch lewat `useFetch(() => getProfile(user.id), [user?.id])` — TIDAK
PERLU fetch tambahan, TIDAK PERLU actions baru.

Catatan teknis: saat ini kode melakukan
`const p = profile as AuthUser;` — cast ini membuang informasi
`avgRating`/`reviewCount` dari sisi TypeScript walau datanya tetap ada di
runtime (karena `getProfile()` mengembalikan lebih banyak field daripada
`AuthUser`). Perbaikannya **cukup di file ini saja**: ubah cast type lokal
supaya menyertakan kedua field tersebut, misalnya:

```ts
const p = profile as AuthUser & { avgRating: number; reviewCount: number };
```

(Tidak perlu mengubah definisi `AuthUser` itu sendiri di
`lib/types/market.ts`.)

### 4.3 UI yang ditambahkan
Tambahkan kartu baru bergaya konsisten dengan kartu-kartu lain yang sudah
ada di kolom kiri halaman ini (`Avatar Card`, `Info Card` — pakai class
`bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_rgba(0,0,0,0.06)]`
dan warna brand `#025246`, sama seperti elemen di sekitarnya).

Isi kartu:
- Judul kecil, contoh: "Ulasan" (ikuti gaya heading
  `text-xs font-semibold text-gray-400 uppercase tracking-wider` yang
  dipakai di "Info Card" pada file yang sama).
- Bintang rating (gunakan icon `Star` dari `lucide-react`, sudah dipakai
  di project ini untuk kebutuhan serupa — misal di `ProductCard.tsx`).
- Angka rata-rata rating (`p.avgRating.toFixed(1)`), dan jumlah ulasan
  (`p.reviewCount`) dalam format yang jelas, contoh:
  `4.5 dari 12 ulasan` atau kalau kosong: `0.0 · Belum ada ulasan`.
- Kalau `reviewCount === 0`, rating tetap ditampilkan sebagai `0` / `0.0`
  (bukan dikosongkan/disembunyikan/strip).

Penempatan: taruh kartu ini di kolom kiri (`lg:w-[380px]`), tepat setelah
"Avatar Card" dan sebelum "Info Card" — atau setelah "Info Card", pilih
posisi yang paling rapi secara visual saat dikerjakan, tanpa mengubah
urutan/isi kartu lain yang sudah ada.

### 4.4 Contoh referensi visual (boleh dijadikan acuan pola, tidak disalin file-nya)
Pola kombinasi icon + angka rating besar + label sudah ada presedennya di
project ini, contoh singkat di `StatistikCard.tsx` (punya Petani):

```tsx
<StatTile
  icon={<Star size={18} />}
  value={profile.avgRating > 0 ? profile.avgRating.toFixed(1) : "-"}
  label="Rating"
/>
```

**Catatan penting**: pola di atas menampilkan `"-"` kalau rating 0. **Untuk
task ini, JANGAN ikuti fallback `"-"` tersebut** — sesuai requirement,
kalau belum ada rating, tetap tampilkan angka `"0"` (atau `"0.0"`), karena
itu instruksi eksplisit dari pemilik produk.

## 5. Acceptance Criteria
- [ ] Halaman `src/app/user/profile/page.tsx` menampilkan section/kartu
      "Ulasan" berisi rata-rata rating dan jumlah ulasan.
- [ ] Kalau user belum punya ulasan sama sekali, rating tampil sebagai
      `0` / `0.0` — bukan `-`, bukan kosong, bukan disembunyikan.
- [ ] Tidak ada file lain yang berubah selain
      `src/app/user/profile/page.tsx`.
- [ ] Tidak ada perubahan pada `actions/profile.ts`, `lib/types/market.ts`,
      atau file petani manapun.
- [ ] Semua fitur yang sudah ada di halaman ini (edit profil, ganti foto,
      ubah password) tetap berfungsi persis seperti sebelumnya.
- [ ] Tidak ada error TypeScript/ESLint baru.
- [ ] Style kartu baru konsisten (warna, radius, shadow, spacing) dengan
      kartu-kartu lain yang sudah ada di halaman yang sama.