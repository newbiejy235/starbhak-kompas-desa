"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  MessageCircle,
  Search,
  Calendar,
  Filter,
  Clock,
  CheckCircle2,
  X,
} from "lucide-react";
import Avatar from "@/components/ui/Avatar";

interface ChatRoomItem {
  id: number;
  buyerId: number;
  farmerId: number;
  commodityId: number;
  status: string;
  lastMessage: string | null;
  lastMessageAt: Date | null;
  createdAt: Date;
  buyerName: string;
  farmerName: string;
  buyerFotoProfile?: string | null;
  farmerFotoProfile?: string | null;
  commodityName: string;
  commodityPrice: string;
  commodityImage: string | null;
  commodityUnit: string;
  hasDeal?: boolean;
}

interface ChatListProps {
  rooms: ChatRoomItem[];
  currentUserId: number;
  role: "pembeli" | "petani";
  basePath: string;
}

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function getRelativeTime(date: Date | null): string {
  if (!date) return "";
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Baru saja";
  if (diffMin < 60) return `${diffMin} mnt lalu`;
  if (diffHour < 24) return `${diffHour} jam lalu`;
  if (diffDay === 1) return "Kemarin";
  if (diffDay < 7) return `${diffDay} hari lalu`;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export default function ChatList({ rooms, currentUserId, role, basePath }: ChatListProps) {
  const [search, setSearch] = useState("");
  const [filterMonth, setFilterMonth] = useState<string>("");
  const [filterYear, setFilterYear] = useState<string>("");
  const [showFilter, setShowFilter] = useState(false);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    rooms.forEach((r) => {
      const d = new Date(r.createdAt);
      if (!isNaN(d.getTime())) years.add(d.getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [rooms]);

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const otherName = role === "pembeli" ? room.farmerName : room.buyerName;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        otherName.toLowerCase().includes(q) ||
        room.commodityName.toLowerCase().includes(q) ||
        (room.lastMessage || "").toLowerCase().includes(q);

      const d = new Date(room.lastMessageAt || room.createdAt);
      const matchMonth = !filterMonth || d.getMonth() + 1 === Number(filterMonth);
      const matchYear = !filterYear || d.getFullYear() === Number(filterYear);

      return matchSearch && matchMonth && matchYear;
    });
  }, [rooms, search, filterMonth, filterYear, role]);

  const activeCount = rooms.filter((r) => r.status === "active").length;
  const dealCount = rooms.filter((r) => r.status === "closed").length;

  const clearFilter = () => {
    setFilterMonth("");
    setFilterYear("");
  };

  const hasFilter = filterMonth || filterYear;

  if (rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-[#025246]/10 to-[#00AA5B]/10 rounded-3xl flex items-center justify-center mb-5">
          <MessageCircle size={36} className="text-[#025246]" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Belum Ada Percakapan</h3>
        <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
          Mulai negosiasi dengan petani dari halaman produk untuk memulai percakapan.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 px-5 py-4 border-b border-gray-100 bg-white rounded-t-3xl">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1.5 bg-[#025246]/5 rounded-full px-3 py-1.5">
            <div className="w-2 h-2 bg-[#00AA5B] rounded-full animate-pulse" />
            <span className="text-xs font-medium text-[#025246]">{activeCount} Aktif</span>
          </div>
          {dealCount > 0 && (
            <div className="flex items-center gap-1.5 bg-green-50 rounded-full px-3 py-1.5">
              <CheckCircle2 size={12} className="text-green-600" />
              <span className="text-xs font-medium text-green-700">{dealCount} Deal</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau produk..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#025246] focus:bg-white transition-colors"
            />
          </div>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
              hasFilter
                ? "bg-[#025246] text-white border-[#025246]"
                : "bg-white text-gray-600 border-gray-200 hover:border-[#025246] hover:text-[#025246]"
            }`}
          >
            <Filter size={15} />
            Filter
          </button>
        </div>

        {showFilter && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <Calendar size={14} className="text-gray-400" />
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#025246]"
            >
              <option value="">Semua Bulan</option>
              {MONTHS.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#025246]"
            >
              <option value="">Semua Tahun</option>
              {availableYears.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            {hasFilter && (
              <button
                onClick={clearFilter}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium"
              >
                <X size={12} />
                Reset
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Search size={32} className="text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">Tidak ada percakapan yang cocok</p>
          </div>
        ) : (
          filteredRooms.map((room) => {
            const otherName = role === "pembeli" ? room.farmerName : room.buyerName;
            const otherFoto = role === "pembeli" ? room.farmerFotoProfile : room.buyerFotoProfile;
            const isActive = room.status === "active";
            const isDeal = room.hasDeal === true;
            const timeLabel = getRelativeTime(room.lastMessageAt || room.createdAt);

            return (
              <Link
                key={room.id}
                href={`${basePath}/${room.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/80 active:bg-gray-100 transition-all border-b border-gray-100 last:border-0 group"
              >
                <div className="relative flex-shrink-0">
                  <Avatar src={otherFoto} name={otherName} size="md" />
                  {isActive && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#00AA5B] rounded-full border-2 border-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <h4 className="text-sm font-bold text-gray-800 truncate group-hover:text-[#025246] transition-colors">
                        {otherName}
                      </h4>
                      {isDeal && (
                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
                          DEAL
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                      <Clock size={10} className="text-gray-400" />
                      <span className="text-[11px] text-gray-400">{timeLabel}</span>
                    </div>
                  </div>
                  <p className="text-xs text-[#025246] font-semibold mb-0.5 truncate">{room.commodityName}</p>
                  <p className="text-[11px] text-gray-500 truncate">
                    {room.lastMessage || "Mulai percakapan..."}
                  </p>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
