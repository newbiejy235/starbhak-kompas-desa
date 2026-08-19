"use client";

import Link from "next/link";
import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import { formatImage } from "@/components/shared/States";

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
  commodityName: string;
  commodityPrice: string;
  commodityImage: string | null;
  commodityUnit: string;
}

interface ChatListProps {
  rooms: ChatRoomItem[];
  currentUserId: number;
  role: "pembeli" | "petani";
  basePath: string;
}

export default function ChatList({ rooms, currentUserId, role, basePath }: ChatListProps) {
  if (rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <MessageCircle size={28} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-1">Belum Ada Percakapan</h3>
        <p className="text-sm text-gray-500 max-w-xs">
          Mulai negosiasi dengan petani dari halaman produk untuk memulai chat.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {rooms.map((room) => {
        const otherName = role === "pembeli" ? room.farmerName : room.buyerName;
        const img = formatImage(room.commodityImage);

        return (
          <Link
            key={room.id}
            href={`${basePath}/${room.id}`}
            className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0 relative">
              {img ? (
                <Image src={img} alt={room.commodityName} fill sizes="56px" className="object-cover" unoptimized />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#025246] to-[#047857] flex items-center justify-center">
                  <span className="text-lg font-bold text-white">
                    {room.commodityName?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-bold text-gray-800 truncate">{otherName}</h4>
                <span className="text-[11px] text-gray-400 flex-shrink-0 ml-2">
                  {room.lastMessageAt ? formatDateTime(room.lastMessageAt) : formatDateTime(room.createdAt)}
                </span>
              </div>
              <p className="text-xs text-[#025246] font-medium mb-0.5">{room.commodityName}</p>
              <p className="text-xs text-gray-500 truncate">
                {room.lastMessage || "Belum ada pesan"}
              </p>
            </div>

            {room.status === "closed" && (
              <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                Deal
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
