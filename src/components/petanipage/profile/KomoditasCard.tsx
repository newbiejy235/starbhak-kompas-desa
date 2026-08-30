import { Leaf, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatImage } from "@/components/shared/States";
import { formatRupiah } from "@/lib/format";
import type { CommodityData } from "./types";

const cardCls = "rounded-2xl border border-gray-200/80 bg-white";

export default function KomoditasCard({
  commodities,
}: {
  commodities: CommodityData[];
}) {
  return (
    <div className={cardCls}>
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Leaf size={16} className="text-primary" />
            Komoditas Saya
          </h2>
          {commodities.length > 0 && (
            <Link
              href="/petani/commodities"
              className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1"
            >
              Lihat Semua
              <ExternalLink size={11} />
            </Link>
          )}
        </div>

        {commodities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-14 h-14 bg-primary/5 rounded-full flex items-center justify-center mb-3">
              <Leaf className="w-6 h-6 text-primary/40" />
            </div>
            <p className="text-sm font-medium text-gray-600">Belum Ada Komoditas</p>
            <p className="text-xs text-gray-400 mt-1 max-w-[240px]">
              Mulai tambahkan komoditas untuk menampilkan produk Anda kepada pembeli.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {commodities.slice(0, 4).map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-2 py-2.5 last:border-0"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 relative">
                    {(formatImage(c.image)) ? (
                      <Image
                        src={(formatImage(c.image)) || ""}
                        alt={c.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Leaf className="w-5 h-5 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{c.name}</p>
                    <p className="text-[11px] text-gray-400 truncate">{c.categoryName}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-primary">{formatRupiah(c.price)}</p>
                  <p className="text-[10px] text-gray-400">/{c.unit}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
