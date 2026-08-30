"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  MapPin,
  Package,
  Plus,
  Sprout,
  X,
  Leaf,
  Sparkles,
} from "lucide-react";
import { saveRegisterDraft, getRegisterDraft } from "@/lib/register";
import { daftarKota } from "@/constants/dataKota";
import Image from "next/image";

const slideshowImages = ["/images/login/ImageLogin.png", "/images/login/ImagePetani.png"];

export default function ProfilPetani() {
  const router = useRouter();
  const [komoditasList, setKomoditasList] = useState<string[]>([""]);
  const [lokasi, setLokasi] = useState("");
  const [estimasi, setEstimasi] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const draft = getRegisterDraft();
    if (!draft.fullName) {
      router.replace("/auth/register/petani");
      return;
    }
    if (draft.komoditas) {
      const items = draft.komoditas.split(",").map((s) => s.trim()).filter(Boolean);
      setKomoditasList(items.length > 0 ? items : [""]);
    }
    if (draft.lokasi) setLokasi(draft.lokasi);
    if (draft.estimasi) setEstimasi(draft.estimasi);
  }, [router]);

  const getKomoditasString = () => komoditasList.filter((k) => k.trim() !== "").join(", ");

  const saveDraftAndRedirect = (path: string, isBack = false) => {
    saveRegisterDraft({ komoditas: getKomoditasString(), lokasi, estimasi });
    if (isBack) router.back();
    else router.push(path);
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    saveDraftAndRedirect("/auth/register/petani/password");
  };

  const handleAddKomoditas = () => setKomoditasList([...komoditasList, ""]);
  const handleRemoveKomoditas = (i: number) => setKomoditasList(komoditasList.filter((_, index) => index !== i));
  const handleChangeKomoditas = (i: number, val: string) => {
    const newList = [...komoditasList];
    newList[i] = val;
    setKomoditasList(newList);
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((p) => (p + 1) % slideshowImages.length), 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let ctx: ReturnType<typeof gsap.context> | null = null;
    let cleanupMouseMove: ((e: MouseEvent) => void) | null = null;

    import("gsap").then(({ default: gsap }) => {
      ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

        tl.fromTo(".page-content", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 })
          .fromTo(".hero-main", { opacity: 0, scale: 0.94, y: 25 }, { opacity: 1, scale: 1, y: 0, duration: 1 }, "-=0.45")
          .fromTo(".floating-card", { opacity: 0, scale: 0.85, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.7, stagger: 0.12 }, "-=0.55")
          .fromTo(".form-item", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.65, stagger: 0.08 }, "-=0.55");

        gsap.to(".hero-main", { y: -8, duration: 3.5, repeat: -1, yoyo: true, ease: "sine.inOut" });
        gsap.to(".floating-card-1", { y: -10, duration: 3, repeat: -1, yoyo: true, ease: "sine.inOut" });
        gsap.to(".floating-card-2", { y: 8, duration: 3.8, repeat: -1, yoyo: true, ease: "sine.inOut" });
        gsap.to(".floating-card-3", { y: -6, duration: 4.2, repeat: -1, yoyo: true, ease: "sine.inOut" });
        gsap.to(".ambient-blob", { scale: 1.15, opacity: 0.65, duration: 4, repeat: -1, yoyo: true, stagger: 0.5, ease: "sine.inOut" });
      }, containerRef);

      cleanupMouseMove = (e: MouseEvent) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 18;
        const y = (e.clientY / window.innerHeight - 0.5) * 18;
        gsap.to(".parallax-element", { x, y, duration: 1.2, ease: "power2.out", overwrite: true });
      };
      window.addEventListener("mousemove", cleanupMouseMove);
    });

    return () => {
      ctx?.revert?.();
      if (cleanupMouseMove) window.removeEventListener("mousemove", cleanupMouseMove);
    };
  }, []);

  const filledCommodities = komoditasList.filter((item) => item.trim() !== "");
  const estimatedLabel = estimasi === "SKALA_KECIL" ? "Skala Kecil" : estimasi === "SKALA_MENENGAH" ? "Skala Menengah" : estimasi === "SKALA_BESAR" ? "Skala Besar" : "Belum dipilih";

  const filteredKota = daftarKota.filter((kota) =>
    kota.toLowerCase().includes(lokasi.toLowerCase())
  );

  const renderFormFields = (isMobile = false) => (
    <div className="flex flex-col gap-6">
      <div className="form-item">
        <div className="mb-2.5 flex items-end justify-between">
          <label className="text-[13px] font-bold text-neutral-800">Komoditas Utama</label>
          <span className="text-[10px] font-medium text-neutral-400">{filledCommodities.length} ditambahkan</span>
        </div>
        <div className="flex max-h-[150px] flex-col gap-2 overflow-y-auto pr-1">
          {komoditasList.map((komoditas, idx) => (
            <div key={idx} className="group flex items-center gap-2">
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-neutral-400 transition-colors group-focus-within:text-emerald-600">
                  <Sprout size={17} strokeWidth={2.2} />
                </div>
                <input
                  type="text"
                  value={komoditas}
                  onChange={(e) => handleChangeKomoditas(idx, e.target.value)}
                  placeholder={idx === 0 ? "Contoh: Padi, Jagung, Cabai..." : "Komoditas lainnya..."}
                  className="w-full rounded-[16px] border border-neutral-200 bg-white py-3.5 pl-11 pr-4 text-sm font-medium text-neutral-900 shadow-[0_2px_12px_rgba(0,0,0,0.03)] outline-none transition-all duration-200 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                  required={idx === 0}
                />
              </div>
              {komoditasList.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveKomoditas(idx)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-neutral-400 transition-all hover:bg-red-50 hover:text-red-500 active:scale-95"
                  title="Hapus komoditas"
                >
                  <X size={17} strokeWidth={2.4} />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={handleAddKomoditas}
          className="mt-2.5 ml-1 inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 transition-colors hover:text-emerald-800"
        >
          <Plus size={14} strokeWidth={3} /> Tambah komoditas
        </button>
      </div>

      <div className={`form-item ${showDropdown ? 'relative z-50' : 'relative z-10'}`}>
        <label htmlFor={isMobile ? "lokasi-mobile" : "lokasi"} className="mb-2.5 block text-[13px] font-bold text-neutral-800">
          Lokasi Lahan
        </label>
        <div className="relative group">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-neutral-400 transition-colors group-focus-within:text-emerald-600">
            <MapPin size={17} strokeWidth={2.2} />
          </div>
          <input
            id={isMobile ? "lokasi-mobile" : "lokasi"}
            type="text"
            value={lokasi}
            onChange={(e) => {
              setLokasi(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            placeholder="Ketik nama kota/kabupaten..."
            className="w-full rounded-[16px] border border-neutral-200 bg-white py-3.5 pl-11 pr-4 text-sm font-medium text-neutral-900 shadow-[0_2px_12px_rgba(0,0,0,0.03)] outline-none transition-all duration-200 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
            required
            autoComplete="off"
          />
        </div>
        {showDropdown && (
          <ul className="absolute z-50 top-[calc(100%+6px)] left-0 right-0 max-h-52 overflow-y-auto bg-white border border-neutral-200 rounded-2xl shadow-2xl divide-y divide-neutral-100 focus:outline-none">
            {filteredKota.length > 0 ? (
              filteredKota.map((kota) => (
                <li
                  key={kota}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setLokasi(kota);
                    setShowDropdown(false);
                  }}
                  className="px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-emerald-50 hover:text-emerald-800 cursor-pointer transition-colors"
                >
                  {kota}
                </li>
              ))
            ) : (
              <li className="px-4 py-3 text-sm text-neutral-400 text-center select-none">
                Kota tidak ditemukan
              </li>
            )}
          </ul>
        )}
        {!isMobile && <p className="mt-2 ml-1 text-[10px] font-medium text-neutral-400">Contoh: Kota Depok, Kabupaten Bogor</p>}
      </div>

      <div className="form-item">
        <label htmlFor={isMobile ? "estimasi-mobile" : "estimasi"} className="mb-2.5 block text-[13px] font-bold text-neutral-800">
          Estimasi Hasil Panen
        </label>
        <div className="relative group">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-neutral-400 transition-colors group-focus-within:text-emerald-600">
            <Package size={17} strokeWidth={2.2} />
          </div>
          <select
            id={isMobile ? "estimasi-mobile" : "estimasi"}
            value={estimasi}
            onChange={(e) => setEstimasi(e.target.value)}
            className="w-full cursor-pointer appearance-none rounded-[16px] border border-neutral-200 bg-white py-3.5 pl-11 pr-11 text-sm font-medium text-neutral-900 shadow-[0_2px_12px_rgba(0,0,0,0.03)] outline-none transition-all duration-200 hover:border-neutral-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
            required
          >
            <option value="" disabled>Pilih estimasi hasil panen</option>
            <option value="SKALA_KECIL">Skala Kecil — Di bawah 50 Kg</option>
            <option value="SKALA_MENENGAH">Skala Menengah — 50–500 Kg</option>
            <option value="SKALA_BESAR">Skala Besar — Di atas 500 Kg</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-neutral-400">
            <ArrowRight size={15} className="rotate-90" />
          </div>
        </div>
      </div>

      <div className="form-item flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => saveDraftAndRedirect("", true)}
          className="flex w-[38%] items-center justify-center rounded-[16px] border border-neutral-200 bg-white py-3.5 text-[13px] font-bold text-neutral-700 shadow-sm transition-all duration-200 hover:border-neutral-300 hover:bg-neutral-50 active:scale-[0.98]"
        >
          Kembali
        </button>
        <button
          type="submit"
          className="group flex flex-1 items-center justify-center gap-2 rounded-[16px] bg-[#075e50] py-3.5 text-[13px] font-extrabold text-white shadow-lg shadow-emerald-900/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#064d42] hover:shadow-xl active:translate-y-0 active:scale-[0.98]"
        >
          Berikutnya <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className="min-h-[100dvh] w-full overflow-x-hidden bg-[#f7f8f6] font-sans text-neutral-900">
      {/* DESKTOP LAYOUT */}
      <div className="hidden lg:flex min-h-[100dvh] w-full">
        <section className="relative min-h-[100dvh] w-[50%] lg:w-[52%] xl:w-[55%] overflow-hidden bg-[#063b30]">
          {slideshowImages.map((src, index) => (
            <div key={`${src}-${index}`} className={`absolute inset-0 transition-all duration-[1800ms] ease-out ${currentSlide === index ? "scale-100 opacity-100" : "scale-[1.08] opacity-0"}`}>
              <Image src={src} alt="" fill priority={index === 0} className="object-cover" />
            </div>
          ))}

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(16,185,129,0.15),transparent_35%),linear-gradient(145deg,rgba(2,44,34,0.96)_0%,rgba(3,61,49,0.82)_48%,rgba(2,44,34,0.96)_100%)]" />
          <div className="ambient-blob absolute -left-20 top-20 h-72 w-72 rounded-full bg-emerald-400/10 blur-[90px]" />
          <div className="ambient-blob absolute bottom-0 right-0 h-96 w-96 rounded-full bg-teal-300/10 blur-[110px]" />
          <div className="ambient-blob absolute left-[45%] top-[25%] h-40 w-40 rounded-full bg-lime-300/5 blur-[70px]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:url('data:image/svg+xml,%3Csvg viewBox=%220 0 180 180%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.35%22/%3E%3C/svg%3E')]" />

          <div className="page-content relative z-20 flex items-center justify-between px-8 py-8 xl:px-12">
            <Link href="/" className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.14]">
              <ArrowLeft size={16} className="transition-transform duration-300 group-hover:-translate-x-1" /> Beranda
            </Link>
            <div className="flex items-center gap-2.5 text-white">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur-xl">
                <Image src="/logo-kompas-desa/kompas_logo_icon.png" alt="Kompas'Desa" width={25} height={25} />
              </div>
              <span className="text-lg font-bold tracking-tight">Kompas&apos;Desa</span>
            </div>
          </div>

          <div className="absolute inset-x-0 top-[100px] bottom-[280px] z-10 flex items-center justify-center xl:bottom-[300px]">
            <div className="parallax-element absolute h-[400px] w-[400px] rounded-full border border-white/[0.06]" />
            <div className="parallax-element absolute h-[310px] w-[310px] rounded-full border border-white/[0.05]" />
            <div className="absolute h-64 w-64 rounded-full bg-emerald-400/10 blur-[80px]" />

            <div className="hero-main parallax-element relative flex h-[270px] w-[270px] items-center justify-center rounded-[44px] border border-white/10 bg-white/[0.07] shadow-2xl shadow-black/20 backdrop-blur-md">
              <div className="absolute inset-3 rounded-[36px] border border-white/[0.06]" />
              <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-emerald-300/20 to-transparent">
                <Leaf size={92} strokeWidth={1.1} className="text-emerald-200 drop-shadow-[0_0_30px_rgba(110,231,183,0.25)]" />
              </div>
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-100/50">Profile Petani</span>
              </div>
            </div>

            <div className="floating-card floating-card-1 absolute left-[8%] top-[10%] xl:left-[15%] w-[178px] rounded-2xl border border-white/10 bg-white/[0.10] p-4 shadow-xl backdrop-blur-xl">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/15">
                  <Sprout size={17} className="text-emerald-300" />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-white/40">KOMODITAS</p>
                  <p className="text-xs font-bold text-white">{filledCommodities.length > 0 ? filledCommodities[0] : "Belum diisi"}</p>
                </div>
              </div>
              {filledCommodities.length > 1 && <p className="text-[10px] font-medium text-emerald-200/60">+{filledCommodities.length - 1} komoditas lainnya</p>}
            </div>

            <div className="floating-card floating-card-2 absolute right-[8%] top-[16%] xl:right-[15%] w-[190px] rounded-2xl border border-white/10 bg-white/[0.10] p-4 shadow-xl backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-400/15">
                  <MapPin size={17} className="text-emerald-300" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium text-white/40">LOKASI LAHAN</p>
                  <p className="truncate text-xs font-bold text-white">{lokasi || "Belum diisi"}</p>
                </div>
              </div>
            </div>

            <div className="floating-card floating-card-3 absolute bottom-[6%] right-[10%] xl:right-[20%] rounded-2xl border border-white/10 bg-white/[0.10] px-4 py-3 shadow-xl backdrop-blur-xl">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/15">
                  <Package size={15} className="text-emerald-300" />
                </div>
                <div>
                  <p className="text-[9px] font-medium text-white/40">ESTIMASI PANEN</p>
                  <p className="text-[11px] font-bold text-white">{estimatedLabel}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="page-content absolute bottom-0 left-0 right-0 z-20 px-8 pb-10 xl:px-12 xl:pb-12">
            <div className="mb-7 max-w-[530px]">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/10 bg-emerald-300/[0.08] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-200">
                <Sparkles size={12} /> Selangkah lagi
              </div>
              <h1 className="max-w-[500px] text-4xl font-extrabold leading-[1.05] tracking-tight text-white xl:text-[46px]">
                Ceritakan sedikit<br />tentang <span className="text-emerald-300">pertanianmu.</span>
              </h1>
              <p className="mt-4 max-w-[450px] text-sm leading-6 text-emerald-50/60">
                Lengkapi informasi pertanianmu agar pembeli dapat menemukan hasil panen yang sesuai dengan kebutuhan mereka.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-300 text-[#063b30]">
                  <Check size={13} strokeWidth={3} />
                </div>
                <span className="text-[10px] font-bold text-white/80">Akun</span>
              </div>
              <div className="h-px w-10 bg-emerald-200/20" />
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#063b30] text-[10px] font-extrabold">2</div>
                <span className="text-[10px] font-bold text-white">Profil</span>
              </div>
              <div className="h-px w-10 bg-emerald-200/20" />
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/15 text-[10px] font-bold text-white/40">3</div>
                <span className="text-[10px] font-bold text-white/35">Password</span>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-1 min-h-[100dvh] items-center justify-center overflow-y-auto px-10 xl:px-20">
          <div className="w-full max-w-[470px] py-10">
            <div className="form-item mb-8">
              <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" /> Informasi usaha
              </div>
              <h2 className="text-[38px] font-extrabold leading-[1.05] tracking-tight text-neutral-950">Profile Petani</h2>
              <p className="mt-3 max-w-[390px] text-sm leading-6 text-neutral-500">
                Bantu pembeli mengenal komoditas, lokasi, dan kapasitas hasil panenmu.
              </p>
            </div>

            <form onSubmit={handleNext}>{renderFormFields(false)}</form>

            <p className="form-item mt-8 text-center text-[10px] font-medium text-neutral-400">
              © 2026 Kompas&apos;Desa. Hak Cipta Dilindungi.
            </p>
          </div>
        </section>
      </div>

      {/* MOBILE LAYOUT */}
      <div className="flex min-h-[100dvh] flex-col lg:hidden">
        <header className="flex items-center justify-between px-5 py-5">
          <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3.5 py-2 text-xs font-bold text-neutral-700 shadow-sm">
            <ArrowLeft size={14} /> Beranda
          </Link>
          <div className="flex items-center gap-2">
            <Image src="/logo-kompas-desa/kompas_logo_icon.png" alt="Kompas'Desa" width={24} height={24} />
            <span className="text-sm font-extrabold">Kompas&apos;Desa</span>
          </div>
        </header>

        <section className="relative mx-4 h-[250px] overflow-hidden rounded-[28px] bg-[#063b30]">
          {slideshowImages.map((src, index) => (
            <div key={`${src}-mobile-${index}`} className={`absolute inset-0 transition-all duration-1000 ${currentSlide === index ? "scale-100 opacity-100" : "scale-105 opacity-0"}`}>
              <Image src={src} alt="" fill className="object-cover opacity-25" />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-br from-[#022c22]/95 via-[#064e3b]/80 to-[#022c22]/95" />
          <div className="relative z-10 flex h-full flex-col justify-between p-6">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                <Sparkles size={11} /> Selangkah lagi
              </div>
              <h1 className="text-2xl font-extrabold leading-tight text-white">
                Lengkapi profile<br /><span className="text-emerald-300">pertanianmu.</span>
              </h1>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[9px] font-medium uppercase tracking-wider text-white/40">Profile Petani</p>
                <p className="mt-1 text-xs font-bold text-white/80">Informasi usaha</p>
              </div>
              <div className="flex gap-1.5">
                <span className="h-1.5 w-5 rounded-full bg-emerald-300" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
              </div>
            </div>
          </div>
        </section>

        <main className="flex-1 px-5 pb-8 pt-8">
          <div className="mx-auto w-full max-w-[520px]">
            <div className="mb-7">
              <h2 className="text-3xl font-extrabold tracking-tight text-neutral-950">Profie Petani</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-500">Lengkapi informasi tentang usaha pertanianmu.</p>
            </div>

            <form onSubmit={handleNext}>{renderFormFields(true)}</form>

            <p className="mt-8 text-center text-[10px] font-medium text-neutral-400">
              © 2026 Kompas&apos;Desa. Hak Cipta Dilindungi.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}