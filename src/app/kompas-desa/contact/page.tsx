"use client";

import Link from "next/link";
import {
  ArrowRight,
  Mail,
  MapPin,
  MessageCircle,
  Send,
  AtSign
} from "lucide-react";

const kebutuhanOptions = [
  { value: "petani", label: "Saya seorang petani" },
  { value: "pembeli", label: "Saya seorang pembeli" },
  { value: "mitra", label: "Ingin menjadi mitra" },
  { value: "lainnya", label: "Pertanyaan lainnya" },
];

const contactItems = [
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "+62 888-8888-8888",
    href: "https://wa.me/62888888888",
  },
  {
    icon: Mail,
    label: "Email",
    value: "kompasdesa@gmail.com",
    href: "mailto:kompasdesa@gmail.com",
  },
  {
    icon: AtSign,
    label: "Instagram",
    value: "@kompasdesa.id",
  },
];

export default function KontakPage() {
  return (
    <main className="min-h-screen bg-white text-[#1f1f1f]">
      <section className="px-5 pb-14 pt-24 md:px-8 md:pb-16 md:pt-28 lg:px-12">
        <div className="mx-auto grid max-w-5xl items-end gap-8 md:grid-cols-[1fr_0.55fr]">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#D8E5E0] bg-[#F5F9F7] px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#025246]" />

              <span className="text-xs font-medium text-[#025246]">
                Hubungi KompasDesa
              </span>
            </div>

            <h1 className="max-w-2xl text-4xl font-semibold leading-[1.08] tracking-[-0.03em] text-[#1f1f1f] sm:text-[44px] md:text-[48px]">
              Mari terhubung dengan{" "}
              <span className="text-[#025246]">KompasDesa.</span>
            </h1>
          </div>

          <div className="pb-1">
            <p className="text-sm leading-6 text-[#75938f] sm:text-base">
              Punya pertanyaan, ingin menjadi mitra, atau membutuhkan informasi
              tentang Kompas Desa? Sampaikan kebutuhanmu kepada tim kami.
            </p>
          </div>
        </div>
      </section>

      {/* CONTACT METHODS */}
      <section className="px-5 pb-14 md:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl border-y border-[#E5E9E7]">
          <div className="grid md:grid-cols-3">
            {contactItems.map((item, index) => {
              const Icon = item.icon;

              const content = (
                <>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E4F1EB] text-[#025246]">
                    <Icon size={17} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-[#75938f]">
                      {item.label}
                    </p>

                    <p className="mt-0.5 truncate text-sm font-medium text-[#1f1f1f]">
                      {item.value}
                    </p>
                  </div>

                  {item.href && (
                    <ArrowRight
                      size={14}
                      className="ml-auto text-[#9AA9A4] transition-transform group-hover:translate-x-1 group-hover:text-[#025246]"
                    />
                  )}
                </>
              );

              return item.href ? (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex items-center gap-3 px-1 py-5 transition hover:bg-[#F8FAF9] md:px-5 ${index !== 0 ? "md:border-l md:border-[#E5E9E7]" : ""
                    }`}
                >
                  {content}
                </a>
              ) : (
                <div
                  key={item.label}
                  className={`flex items-center gap-3 px-1 py-5 md:px-5 ${index !== 0 ? "md:border-l md:border-[#E5E9E7]" : ""
                    }`}
                >
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FORM AREA */}
      <section
        id="kirim-pesan"
        className="px-5 pb-16 md:px-8 lg:px-12"
      >
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.7fr_1.3fr]">
          {/* LEFT CONTENT */}
          <div className="pt-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#025246]">
              Kirim Pesan
            </p>

            <h2 className="mt-3 max-w-sm text-2xl font-semibold leading-tight tracking-tight text-[#1f1f1f] sm:text-3xl">
              Ceritakan kebutuhanmu kepada kami.
            </h2>

            <p className="mt-3 max-w-sm text-sm leading-6 text-[#75938f]">
              Isi formulir di samping untuk menyampaikan pertanyaan,
              kebutuhan, atau peluang kerja sama dengan Kompas Desa.
            </p>

            <div className="mt-7 border-l-2 border-[#E4F1EB] pl-4">
              <p className="text-xs leading-5 text-[#75938f]">
                Kami berusaha memberikan respons secepat mungkin untuk setiap
                pertanyaan dan kebutuhan yang masuk.
              </p>
            </div>

            <a
              href="https://wa.me/6285167348039"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#025246] transition hover:text-[#013F37]"
            >
              Hubungi melalui WhatsApp
              <ArrowRight size={15} />
            </a>
          </div>

          {/* FORM */}
          <div className="rounded-2xl border border-[#E1E7E4] bg-[#FCFDFC] p-6 md:p-7">
            <form
              className="space-y-4"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="nama"
                    className="mb-1.5 block text-xs font-medium text-[#374151]"
                  >
                    Nama
                  </label>

                  <input
                    id="nama"
                    type="text"
                    placeholder="Nama lengkap"
                    className="h-11 w-full rounded-lg border border-[#DDE5E2] bg-white px-3 text-sm text-[#1f1f1f] outline-none transition placeholder:text-[#9EAEA8] focus:border-[#025246] focus:ring-2 focus:ring-[#025246]/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-xs font-medium text-[#374151]"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    className="h-11 w-full rounded-lg border border-[#DDE5E2] bg-white px-3 text-sm text-[#1f1f1f] outline-none transition placeholder:text-[#9EAEA8] focus:border-[#025246] focus:ring-2 focus:ring-[#025246]/10"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="whatsapp"
                    className="mb-1.5 block text-xs font-medium text-[#374151]"
                  >
                    Nomor WhatsApp
                  </label>

                  <input
                    id="whatsapp"
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    className="h-11 w-full rounded-lg border border-[#DDE5E2] bg-white px-3 text-sm text-[#1f1f1f] outline-none transition placeholder:text-[#9EAEA8] focus:border-[#025246] focus:ring-2 focus:ring-[#025246]/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="subjek"
                    className="mb-1.5 block text-xs font-medium text-[#374151]"
                  >
                    Kebutuhan
                  </label>
                  <select
                    id="subjek"
                    defaultValue=""
                    className="h-11 w-full rounded-lg border border-[#DDE5E2] bg-white px-3 text-sm text-[#1f1f1f] outline-none transition focus:border-[#025246] focus:ring-2 focus:ring-[#025246]/10"
                  >
                    <option value="" disabled>
                      Pilih kebutuhan
                    </option>

                    {kebutuhanOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="pesan"
                  className="mb-1.5 block text-xs font-medium text-[#374151]"
                >
                  Pesan
                </label>

                <textarea
                  id="pesan"
                  rows={6}
                  placeholder="Tuliskan pertanyaan atau kebutuhanmu..."
                  className="w-full resize-none rounded-lg border border-[#DDE5E2] bg-white p-3 text-sm text-[#1f1f1f] outline-none transition placeholder:text-[#9EAEA8] focus:border-[#025246] focus:ring-2 focus:ring-[#025246]/10"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#025246] px-5 text-sm font-semibold text-white transition hover:bg-[#013F37]"
                >
                  <Send size={15} />
                  Kirim Pesan
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 pb-12 md:px-8 lg:px-12">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-5 rounded-2xl bg-[#E4F1EB] px-6 py-7 sm:flex-row md:px-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#025246]">
              GABUNG SEKARANG
            </p>

            <h2 className="mt-1 text-lg font-semibold text-[#1f1f1f] sm:text-xl">
              Segera Daftar dan Mulai Terhubung dengan Komoditas Lokal.
            </h2>
          </div>

          <Link
            href="/auth/register"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#025246] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#013F37]"
          >
            Bergabung Sekarang
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </main>
  );
}