"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  Send,
  ArrowLeft,
  Package,
  Check,
  X,
  ShoppingCart,
  MapPin,
  Tag,
  Handshake,
  RotateCcw,
} from "lucide-react";
import { formatRupiah, formatNumber } from "@/lib/format";
import { formatImage } from "@/components/shared/States";

interface ChatRoomData {
  id: number;
  buyerId: number;
  farmerId: number;
  commodityId: number;
  status: string;
  commodityName: string;
  commodityPrice: string;
  commodityMinPrice: string | null;
  commodityMaxPrice: string | null;
  commodityStock: string;
  commodityUnit: string;
  commodityImage: string | null;
  commodityDescription: string | null;
  commodityStatus: string;
  buyerName: string;
  buyerFoto: string | null;
  farmerName: string;
  farmerFoto: string | null;
  farmerAddress: string | null;
}

interface ChatMessageData {
  id: number;
  roomId: number;
  senderId: number;
  type: string;
  content: string;
  offerPrice: string | null;
  offerQuantity: string | null;
  isRead: boolean;
  createdAt: Date;
  senderName: string;
  senderFoto: string | null;
}

interface ChatRoomViewProps {
  room: ChatRoomData;
  messages: ChatMessageData[];
  currentUserId: number;
  currentRole: "pembeli" | "petani";
  onSendMessage: (content: string, type?: string, offerPrice?: number, offerQuantity?: number) => Promise<void>;
  onAddToCart: (price: number, quantity: number) => void;
  onBack: () => void;
}

export default function ChatRoomView({
  room,
  messages,
  currentUserId,
  currentRole,
  onSendMessage,
  onAddToCart,
  onBack,
}: ChatRoomViewProps) {
  const [input, setInput] = useState("");
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerPrice, setOfferPrice] = useState("");
  const [offerQty, setOfferQty] = useState("1");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const img = formatImage(room.commodityImage);
  const minPrice = room.commodityMinPrice ? Number(room.commodityMinPrice) : null;
  const maxPrice = room.commodityMaxPrice ? Number(room.commodityMaxPrice) : null;
  const hasPriceRange = minPrice !== null && maxPrice !== null && minPrice !== maxPrice;
  const stock = Number(room.commodityStock);
  const isRoomClosed = room.status === "closed";
  const isFarmer = currentRole === "petani";

  const latestPendingOffer = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if ((msg.type === "offer" || msg.type === "counter_offer") && msg.senderId !== currentUserId) {
        return msg;
      }
    }
    return null;
  }, [messages, currentUserId]);

  const latestAcceptedOffer = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.type === "accept" && msg.senderId === currentUserId) {
        const prev = messages[i - 1];
        if (prev && (prev.type === "offer" || prev.type === "counter_offer")) {
          return prev;
        }
      }
    }
    return null;
  }, [messages, currentUserId]);

  const myLatestOffer = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if ((msg.type === "offer" || msg.type === "counter_offer") && msg.senderId === currentUserId) {
        return msg;
      }
    }
    return null;
  }, [messages, currentUserId]);

  const hasAcceptedDeal = useMemo(() => {
    return messages.some((msg) => msg.type === "accept" && msg.senderId === currentUserId);
  }, [messages, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    await onSendMessage(text);
  };

  const handleSendOffer = async (type: "offer" | "counter_offer" = "offer") => {
    const price = parseFloat(offerPrice);
    const qty = parseFloat(offerQty);
    if (isNaN(price) || price <= 0 || isNaN(qty) || qty <= 0) return;

    const label = type === "counter_offer" ? "Counter penawaran" : "Ajukan penawaran";
    const offerText = `${label}: ${formatRupiah(price)} / ${room.commodityUnit} × ${formatNumber(qty)} ${room.commodityUnit}`;
    await onSendMessage(offerText, type, price, qty);
    setShowOfferForm(false);
    setOfferPrice("");
    setOfferQty("1");
  };

  const handleAcceptOffer = async (msg: ChatMessageData) => {
    const acceptText = `Setuju! Saya terima penawaran ${formatRupiah(msg.offerPrice)} / ${room.commodityUnit} × ${formatNumber(msg.offerQuantity)} ${room.commodityUnit}`;
    await onSendMessage(acceptText, "accept");
  };

  const handleRejectOffer = async () => {
    await onSendMessage("Penawaran tidak disetujui. Silakan ajukan harga lain.", "reject");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)]">
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 shrink-0">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-gray-800 truncate">
            {isFarmer ? room.buyerName : room.farmerName}
          </h3>
          <p className="text-xs text-gray-500 truncate">{room.commodityName}</p>
        </div>
        {isRoomClosed && (
          <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
            Deal Tercapai
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto bg-[#F6F6F6]">
        <div className="px-4 pt-4 pb-3">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <div className="flex gap-3">
              <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 relative">
                {img ? (
                  <Image src={img} alt={room.commodityName} fill sizes="80px" className="object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#025246] to-[#047857] flex items-center justify-center">
                    <Package size={24} className="text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-gray-800 truncate">{room.commodityName}</h4>
                {hasPriceRange ? (
                  <p className="text-sm font-bold text-[#025246]">
                    {formatRupiah(minPrice)} - {formatRupiah(maxPrice)}
                    <span className="text-xs font-medium text-gray-500"> / {room.commodityUnit}</span>
                  </p>
                ) : (
                  <p className="text-sm font-bold text-[#025246]">
                    {formatRupiah(room.commodityPrice)}
                    <span className="text-xs font-medium text-gray-500"> / {room.commodityUnit}</span>
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] text-gray-500 flex items-center gap-1">
                    <Tag size={10} /> Stok: {formatNumber(room.commodityStock)} {room.commodityUnit}
                  </span>
                  <span className="text-[11px] text-gray-500 flex items-center gap-1">
                    <MapPin size={10} /> {room.farmerAddress || "Lokasi tidak diketahui"}
                  </span>
                </div>
              </div>
            </div>
            {room.commodityDescription && (
              <p className="text-xs text-gray-500 mt-3 leading-relaxed line-clamp-2">{room.commodityDescription}</p>
            )}
          </div>
        </div>

        {latestPendingOffer && !isRoomClosed && (
          <div className="sticky top-0 z-10 px-4 pb-3">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <Handshake size={16} className="text-amber-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-800">Penawaran Terbaru</h4>
                <p className="text-[11px] text-amber-600">
                  dari {latestPendingOffer.senderName}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-3 mb-3 border border-amber-100">
              <div className="flex items-center gap-2 mb-1">
                <Tag size={14} className="text-amber-600" />
                <span className="text-xs font-bold text-amber-800">
                  {latestPendingOffer.type === "counter_offer" ? "Counter Penawaran" : "Ajukan Harga"}
                </span>
              </div>
              <p className="text-lg font-extrabold text-[#025246]">
                {formatRupiah(latestPendingOffer.offerPrice)}
                <span className="text-xs font-medium text-gray-500"> / {room.commodityUnit}</span>
              </p>
              {latestPendingOffer.offerQuantity && (
                <p className="text-xs text-gray-500 mt-0.5">
                  Jumlah: {formatNumber(latestPendingOffer.offerQuantity)} {room.commodityUnit}
                  {latestPendingOffer.offerPrice && latestPendingOffer.offerQuantity && (
                    <span className="ml-2 font-bold text-[#025246]">
                      Total: {formatRupiah(Number(latestPendingOffer.offerPrice) * Number(latestPendingOffer.offerQuantity))}
                    </span>
                  )}
                </p>
              )}
            </div>

            {isFarmer ? (
              <div className="flex gap-2">
                <button
                  onClick={() => handleAcceptOffer(latestPendingOffer)}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#025246] text-white text-sm font-bold py-2.5 rounded-xl hover:bg-[#024036] transition-colors"
                >
                  <Check size={16} />
                  Setuju
                </button>
                <button
                  onClick={() => {
                    setOfferPrice("");
                    setOfferQty("1");
                    setShowOfferForm(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-white border border-amber-300 text-amber-700 text-sm font-bold py-2.5 rounded-xl hover:bg-amber-50 transition-colors"
                >
                  <RotateCcw size={16} />
                  Ajukan Lain
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                {isRoomClosed && hasAcceptedDeal && (
                  <button
                    onClick={() => {
                      if (latestAcceptedOffer?.offerPrice && latestAcceptedOffer?.offerQuantity) {
                        onAddToCart(Number(latestAcceptedOffer.offerPrice), Number(latestAcceptedOffer.offerQuantity));
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#00AA5B] text-white text-sm font-bold py-2.5 rounded-xl hover:bg-[#009A4F] transition-colors"
                  >
                    <ShoppingCart size={16} />
                    Tambah ke Keranjang
                  </button>
                )}
                {!isRoomClosed && (
                  <>
                    <button
                      onClick={() => handleAcceptOffer(latestPendingOffer)}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#025246] text-white text-sm font-bold py-2.5 rounded-xl hover:bg-[#024036] transition-colors"
                    >
                      <Check size={16} />
                      Setuju
                    </button>
                    <button
                      onClick={() => {
                        setOfferPrice("");
                        setOfferQty("1");
                        setShowOfferForm(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 bg-white border border-amber-300 text-amber-700 text-sm font-bold py-2.5 rounded-xl hover:bg-amber-50 transition-colors"
                    >
                      <RotateCcw size={16} />
                      Ajukan Lain
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
          </div>
        )}

        {isRoomClosed && hasAcceptedDeal && !latestPendingOffer && (
          <div className="sticky top-0 z-10 px-4 pb-3">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Handshake size={16} className="text-green-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-green-800">Deal Tercapai!</h4>
                <p className="text-[11px] text-green-600">Harga dan jumlah sudah disepakati</p>
              </div>
            </div>
            {latestAcceptedOffer && (
              <div className="bg-white rounded-xl p-3 mb-3 border border-green-100">
                <p className="text-lg font-extrabold text-[#025246]">
                  {formatRupiah(latestAcceptedOffer.offerPrice)}
                  <span className="text-xs font-medium text-gray-500"> / {room.commodityUnit}</span>
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Jumlah: {formatNumber(latestAcceptedOffer.offerQuantity)} {room.commodityUnit}
                  <span className="ml-2 font-bold text-[#025246]">
                    Total: {formatRupiah(Number(latestAcceptedOffer.offerPrice) * Number(latestAcceptedOffer.offerQuantity))}
                  </span>
                </p>
              </div>
            )}
            {!isFarmer && (
              <button
                onClick={() => {
                  if (latestAcceptedOffer?.offerPrice && latestAcceptedOffer?.offerQuantity) {
                    onAddToCart(Number(latestAcceptedOffer.offerPrice), Number(latestAcceptedOffer.offerQuantity));
                  }
                }}
                className="w-full flex items-center justify-center gap-2 bg-[#00AA5B] text-white text-sm font-bold py-3 rounded-xl hover:bg-[#009A4F] transition-colors"
              >
                <ShoppingCart size={18} />
                Tambahkan ke Keranjang
              </button>
            )}
          </div>
          </div>
        )}

        <div className="px-4 space-y-3">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          const isSystem = msg.type === "system";
          const isOffer = msg.type === "offer" || msg.type === "counter_offer";
          const isAccept = msg.type === "accept";
          const isReject = msg.type === "reject";

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center">
                <div className="text-[11px] text-gray-400 bg-white/80 px-3 py-1 rounded-full">
                  {msg.content}
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  isMe
                    ? "bg-[#025246] text-white rounded-br-md"
                    : "bg-white text-gray-800 rounded-bl-md border border-gray-100 shadow-sm"
                }`}
              >
                {!isMe && (
                  <p className={`text-[11px] font-bold mb-1 ${isMe ? "text-white/70" : "text-[#025246]"}`}>
                    {msg.senderName}
                  </p>
                )}
                {isOffer && (
                  <div className={`mb-1 p-2 rounded-lg ${isMe ? "bg-white/10" : "bg-gray-50"}`}>
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <Tag size={12} />
                      {msg.type === "counter_offer" ? "Counter Penawaran" : "Ajukan Harga"}
                    </div>
                    {msg.offerPrice && (
                      <p className="text-xs mt-1">
                        {formatRupiah(msg.offerPrice)} / {room.commodityUnit}
                        {msg.offerQuantity && ` × ${formatNumber(msg.offerQuantity)} ${room.commodityUnit}`}
                      </p>
                    )}
                  </div>
                )}
                {isAccept && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-green-400">
                    <Check size={14} />
                    Menerima penawaran
                  </div>
                )}
                {isReject && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-red-400">
                    <X size={14} />
                    Menolak penawaran
                  </div>
                )}
                <p className="whitespace-pre-line">{msg.content}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="shrink-0 bg-white border-t border-gray-200 px-4 py-3">
        {showOfferForm && (
          <div className="bg-gray-50 rounded-2xl p-4 mb-3 border border-gray-200">
            <h4 className="text-sm font-bold text-gray-800 mb-3">
              {myLatestOffer ? "Ajukan Penawaran Lain" : "Ajukan Penawaran"}
            </h4>
            {hasPriceRange && (
              <p className="text-xs text-gray-500 mb-3">
                Range harga: {formatRupiah(minPrice)} - {formatRupiah(maxPrice)} / {room.commodityUnit}
              </p>
            )}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Harga per {room.commodityUnit}</label>
                <input
                  type="number"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  placeholder="Masukkan harga"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[#025246]"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Jumlah ({room.commodityUnit})</label>
                <input
                  type="number"
                  value={offerQty}
                  onChange={(e) => setOfferQty(e.target.value)}
                  min="1"
                  max={stock}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[#025246]"
                />
              </div>
            </div>
            {offerPrice && offerQty && (
              <p className="text-sm font-bold text-[#025246] mb-3">
                Total: {formatRupiah(parseFloat(offerPrice) * parseFloat(offerQty || "1"))}
              </p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => handleSendOffer(myLatestOffer ? "counter_offer" : "offer")}
                disabled={!offerPrice || parseFloat(offerPrice) <= 0}
                className="flex-1 bg-[#025246] text-white text-sm font-bold py-2.5 rounded-xl hover:bg-[#024036] transition-colors disabled:opacity-40"
              >
                {myLatestOffer ? "Kirim Counter" : "Kirim Penawaran"}
              </button>
              <button
                onClick={() => setShowOfferForm(false)}
                className="px-4 py-2.5 bg-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-300 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        )}

        {!isRoomClosed ? (
          <div className="flex gap-2">
            {!showOfferForm && hasPriceRange && (
              <button
                onClick={() => {
                  setOfferPrice("");
                  setOfferQty("1");
                  setShowOfferForm(true);
                }}
                className="px-4 py-3 bg-[#00AA5B] text-white text-sm font-bold rounded-xl hover:bg-[#009A4F] transition-colors flex items-center gap-1.5 shrink-0"
              >
                <Tag size={16} />
                Nego
              </button>
            )}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ketik pesan..."
              className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#025246]"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="w-12 h-12 bg-[#025246] text-white rounded-xl flex items-center justify-center hover:bg-[#024036] transition-colors disabled:opacity-40 shrink-0"
            >
              <Send size={18} />
            </button>
          </div>
        ) : (
          <div className="text-center py-3 text-sm text-gray-500">
            Percakapan ini sudah ditutup. Deal telah tercapai.
          </div>
        )}
      </div>
    </div>
  );
}
