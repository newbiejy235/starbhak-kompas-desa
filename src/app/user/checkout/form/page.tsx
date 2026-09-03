"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, MapPin, User, Phone, FileText, Package } from "lucide-react";
import { getCommodityById } from "@/actions/commodity";
import { createOrder } from "@/actions/order";
import { getClientUser } from "@/lib/auth/client";
import { formatRupiah, formatWeight } from "@/lib/format";
import { formatImage } from "@/components/shared/States";
import Image from "next/image";
import { useFetch } from "@/lib/hooks";
import { Skeleton } from "@/components/ui/Skeleton";
import { toast } from "sonner";

interface AddressForm {
  recipientName: string;
  recipientPhone: string;
  addressStreet: string;
  addressProvince: string;
  addressCity: string;
  addressDistrict: string;
  addressPostalCode: string;
  addressNotes: string;
  deliveryMethod: "pickup" | "expedition";
}

function CheckoutFormSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full rounded-2xl" />
      <Skeleton className="h-96 w-full rounded-2xl" />
    </div>
  );
}

const PROVINCES = [
  "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Jambi",
  "Sumatera Selatan", "Bengkulu", "Lampung", "Kep. Bangka Belitung",
  "Kep. Riau", "DKI Jakarta", "Jawa Barat", "Jawa Tengah", "DI Yogyakarta",
  "Jawa Timur", "Banten", "Bali", "NTB", "NTT", "Kalimantan Barat",
  "Kalimantan Tengah", "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara",
  "Sulawesi Utara", "Sulawesi Tengah", "Sulawesi Selatan", "Sulawesi Tenggara",
  "Gorontalo", "Sulawesi Barat", "Maluku", "Maluku Utara",
  "Papua", "Papua Barat", "Papua Selatan", "Papua Tengah",
  "Papua Pegunungan", "Papua Barat Daya",
];

export default function CheckoutFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = getClientUser();

  const commodityId = Number(searchParams.get("commodityId"));
  const quantity = Number(searchParams.get("quantity")) || 1;
  const negotiatedPrice = searchParams.get("negotiatedPrice")
    ? Number(searchParams.get("negotiatedPrice"))
    : undefined;

  const { data: product, loading } = useFetch(
    () => (commodityId ? getCommodityById(commodityId) : Promise.resolve(null)),
    [commodityId],
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<AddressForm>({
    recipientName: user ? (user as unknown as { fullName?: string }).fullName ?? "" : "",
    recipientPhone: user ? (user as unknown as { noTelp?: string }).noTelp ?? "" : "",
    addressStreet: "",
    addressProvince: "",
    addressCity: "",
    addressDistrict: "",
    addressPostalCode: "",
    addressNotes: "",
    deliveryMethod: "pickup",
  });

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
    }
  }, [user, router]);

  if (loading) return <CheckoutFormSkeleton />;

  if (!product || !commodityId) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-2xl border border-gray-200/80 bg-white p-12 text-center text-gray-500 shadow-soft">
          Komoditas tidak ditemukan.
        </div>
      </div>
    );
  }

  const unitPrice = negotiatedPrice ?? Number(product.price);
  const subtotal = unitPrice * quantity;
  const deliveryFee = form.deliveryMethod === "expedition" ? 25000 : 0;
  const serviceFee = Math.round(subtotal * 0.025 * 100) / 100;
  const totalPrice = subtotal + serviceFee + deliveryFee;

  const productImage =
    formatImage(product.image as string | null) ??
    formatImage((product.images as string[] | null)?.[0] ?? null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = (): string | null => {
    if (!form.recipientName.trim()) return "Nama penerima wajib diisi";
    if (!form.recipientPhone.trim()) return "Nomor telepon wajib diisi";
    if (!/^[0-9]+$/.test(form.recipientPhone.replace(/\s/g, ""))) {
      return "Nomor telepon harus berupa angka";
    }
    if (form.deliveryMethod === "expedition") {
      if (!form.addressStreet.trim()) return "Alamat lengkap wajib diisi";
      if (!form.addressProvince) return "Provinsi wajib dipilih";
      if (!form.addressCity) return "Kota/Kabupaten wajib dipilih";
      if (!form.addressDistrict) return "Kecamatan wajib dipilih";
      if (!form.addressPostalCode.trim()) return "Kode pos wajib diisi";
      if (!/^[0-9]{5}$/.test(form.addressPostalCode.trim())) {
        return "Kode pos harus 5 digit angka";
      }
    }
    return null;
  };

  const handleSubmit = async () => {
    if (!user) return;
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      const fullAddress =
        form.deliveryMethod === "expedition"
          ? [
              form.addressStreet,
              form.addressDistrict,
              form.addressCity,
              form.addressProvince,
              form.addressPostalCode,
            ]
              .filter(Boolean)
              .join(", ")
          : "";

      const fd = new FormData();
      fd.set("commodityId", String(commodityId));
      fd.set("quantity", String(quantity));
      fd.set("deliveryMethod", form.deliveryMethod);
      fd.set("deliveryAddress", fullAddress);
      fd.set("recipientName", form.recipientName.trim());
      fd.set("recipientPhone", form.recipientPhone.trim());
      fd.set("addressStreet", form.addressStreet.trim());
      fd.set("addressProvince", form.addressProvince);
      fd.set("addressCity", form.addressCity);
      fd.set("addressDistrict", form.addressDistrict);
      fd.set("addressPostalCode", form.addressPostalCode.trim());
      fd.set("addressNotes", form.addressNotes.trim());

      const result = await createOrder(user.id, fd);
      if (result.success && result.orderId) {
        toast.success("Pesanan berhasil dibuat!");
        router.push(`/user/checkout/${result.orderId}`);
      } else {
        setError(result.message || "Gagal membuat pesanan. Silakan coba lagi.");
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 animate-fade-up">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-6"
        >
          <ChevronLeft size={16} /> Kembali
        </button>

        <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">
          Checkout
        </h1>

        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-soft p-6 mb-6">
          <h2 className="text-sm font-bold tracking-wide text-gray-900 mb-4 uppercase">
            Ringkasan Pesanan
          </h2>
          <div className="flex gap-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-100">
              {productImage ? (
                <Image
                  src={productImage}
                  alt={product.name}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-300">
                  <Package size={24} />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-gray-900 truncate">{product.name}</h3>
              <p className="mt-0.5 text-sm text-gray-500">
                {formatWeight(String(quantity), product.unit)} × {formatRupiah(unitPrice)}
              </p>
              <p className="mt-2 text-sm font-semibold text-primary">
                {formatRupiah(subtotal)}
              </p>
            </div>
          </div>

          <dl className="mt-4 space-y-2 border-t border-gray-100 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Subtotal</dt>
              <dd className="font-medium text-gray-900">{formatRupiah(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Biaya Layanan (2.5%)</dt>
              <dd className="font-medium text-gray-900">{formatRupiah(serviceFee)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Ongkos Kirim</dt>
              <dd className="font-medium text-gray-900">
                {form.deliveryMethod === "expedition"
                  ? formatRupiah(deliveryFee)
                  : "Gratis (Pick Up)"}
              </dd>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-3">
              <dt className="font-bold text-gray-900">Total</dt>
              <dd className="text-xl font-extrabold text-primary">
                {formatRupiah(totalPrice)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-soft p-6">
          <h2 className="text-sm font-bold tracking-wide text-gray-900 mb-4 uppercase">
            Alamat Pengiriman
          </h2>

          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Metode Penerimaan *
            </label>
            <select
              name="deliveryMethod"
              value={form.deliveryMethod}
              onChange={handleChange}
              className={inputCls}
            >
              <option value="pickup">Pick Up (Ambil di Lokasi Petani)</option>
              <option value="expedition">Ekspedisi (Kirim ke Alamat)</option>
            </select>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                <User size={12} className="inline mr-1" />
                Nama Penerima *
              </label>
              <input
                name="recipientName"
                value={form.recipientName}
                onChange={handleChange}
                placeholder="Nama lengkap penerima"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                <Phone size={12} className="inline mr-1" />
                Nomor Telepon *
              </label>
              <input
                name="recipientPhone"
                value={form.recipientPhone}
                onChange={handleChange}
                placeholder="08xxxxxxxxxx"
                className={inputCls}
              />
            </div>

            {form.deliveryMethod === "expedition" && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    <MapPin size={12} className="inline mr-1" />
                    Alamat Lengkap *
                  </label>
                  <textarea
                    name="addressStreet"
                    value={form.addressStreet}
                    onChange={handleChange}
                    placeholder="Nama jalan, nomor rumah, RT/RW"
                    rows={2}
                    className={inputCls}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Provinsi *
                    </label>
                    <select
                      name="addressProvince"
                      value={form.addressProvince}
                      onChange={handleChange}
                      className={inputCls}
                    >
                      <option value="">Pilih provinsi</option>
                      {PROVINCES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Kota/Kabupaten *
                    </label>
                    <input
                      name="addressCity"
                      value={form.addressCity}
                      onChange={handleChange}
                      placeholder="Kota/Kabupaten"
                      className={inputCls}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Kecamatan *
                    </label>
                    <input
                      name="addressDistrict"
                      value={form.addressDistrict}
                      onChange={handleChange}
                      placeholder="Kecamatan"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Kode Pos *
                    </label>
                    <input
                      name="addressPostalCode"
                      value={form.addressPostalCode}
                      onChange={handleChange}
                      placeholder="12345"
                      maxLength={5}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    <FileText size={12} className="inline mr-1" />
                    Catatan / Informasi Tambahan (Opsional)
                  </label>
                  <textarea
                    name="addressNotes"
                    value={form.addressNotes}
                    onChange={handleChange}
                    placeholder="Patokan lokasi, instruksi khusus pengiriman, dll."
                    rows={2}
                    className={inputCls}
                  />
                </div>
              </>
            )}
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-500 text-center animate-shake">{error}</p>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button
              onClick={() => router.back()}
              className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:border-primary hover:text-primary transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white hover:bg-primary-dark active:scale-[0.98] transition-all duration-200 shadow-md hover:shadow-lift disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Memproses..." : "Buat Pesanan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
