"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, ShoppingCart, Check, MessageCircle } from "lucide-react";
import { formatRupiah } from "@/lib/format";

interface NegoChatbotProps {
  productId: number;
  productName: string;
  minPrice: number;
  maxPrice: number;
  unit: string;
  farmerName: string;
  onClose: () => void;
  onDeal: (price: number) => void;
}

interface ChatMessage {
  id: string;
  sender: "BOT" | "USER";
  content: string;
  timestamp: Date;
}

export default function NegoChatbot({
  productId,
  productName,
  minPrice,
  maxPrice,
  unit,
  farmerName,
  onClose,
  onDeal,
}: NegoChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "greeting",
      sender: "BOT",
      content: `Halo! Saya Asisten Nego untuk *${productName}*.\n\nHarga range: ${formatRupiah(minPrice)} - ${formatRupiah(maxPrice)} / ${unit}\n\nSilakan ajukan harga yang Anda inginkan. Petani ${farmerName} akan mempertimbangkannya.`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<"intro" | "waiting_offer" | "counter" | "deal" | "rejected">("waiting_offer");
  const [lastOffer, setLastOffer] = useState<number | null>(null);
  const [counterOffer, setCounterOffer] = useState<number | null>(null);
  const [dealPrice, setDealPrice] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const addMessage = (sender: "BOT" | "USER", content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        sender,
        content,
        timestamp: new Date(),
      },
    ]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const parsePrice = (text: string): number | null => {
    const cleaned = text.replace(/[^0-9]/g, "");
    const num = Number(cleaned);
    if (num > 0) return num;
    return null;
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    addMessage("USER", userMessage);
    setInput("");

    const offer = parsePrice(userMessage);
    if (!offer) {
      setTimeout(() => {
        addMessage("BOT", "Mohon masukkan nominal harga yang valid (contoh: 20000).");
      }, 500);
      return;
    }

    setLastOffer(offer);

    if (offer >= minPrice && offer <= maxPrice) {
      setTimeout(() => {
        addMessage(
          "BOT",
          `Setuju! Harga ${formatRupiah(offer)} / ${unit} sudah sesuai range. Mari konfirmasi untuk melanjutkan ke keranjang belanja.`
        );
        setDealPrice(offer);
        setPhase("deal");
      }, 800);
    } else if (offer < minPrice) {
      const newCounter = minPrice;
      setTimeout(() => {
        addMessage(
          "BOT",
          `Maaf, harga ${formatRupiah(offer)} masih di bawah range minimum. Petani ${farmerName} menawarkan ${formatRupiah(newCounter)} / ${unit}. Apakah Anda setuju?`
        );
        setCounterOffer(newCounter);
        setPhase("counter");
      }, 800);
    } else {
      const newCounter = maxPrice;
      setTimeout(() => {
        addMessage(
          "BOT",
          `Harga ${formatRupiah(offer)} di atas range. Kami terima di harga maximum ${formatRupiah(newCounter)} / ${unit}. Apakah Anda setuju?`
        );
        setCounterOffer(newCounter);
        setPhase("counter");
      }, 800);
    }
  };

  const handleAcceptCounter = () => {
    if (counterOffer !== null) {
      addMessage("USER", `Saya setuju di ${formatRupiah(counterOffer)}`);
      setDealPrice(counterOffer);
      setTimeout(() => {
        addMessage(
          "BOT",
          `Deal! Harga ${formatRupiah(counterOffer)} / ${unit} sudah disepakati. Silakan konfirmasi untuk menambahkan ke keranjang.`
        );
        setPhase("deal");
      }, 500);
    }
  };

  const handleRejectCounter = () => {
    addMessage("USER", "Saya tidak setuju");
    setTimeout(() => {
      addMessage(
        "BOT",
        "Baik, nego dibatalkan. Anda bisa ajukan harga lain atau langsung beli dengan harga yang tertera."
      );
      setPhase("waiting_offer");
      setCounterOffer(null);
    }, 500);
  };

  const handleConfirmDeal = () => {
    if (dealPrice !== null) {
      onDeal(dealPrice);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white w-full sm:max-w-md h-[85vh] sm:h-[600px] sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-[#025246] text-white shrink-0">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <MessageCircle size={20} />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-sm">Nego Harga</h2>
            <p className="text-xs text-white/70">{productName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "USER" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                  msg.sender === "USER"
                    ? "bg-[#025246] text-white rounded-br-md"
                    : "bg-gray-100 text-gray-800 rounded-bl-md"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {phase === "counter" && counterOffer !== null && (
            <div className="flex gap-2 justify-center">
              <button
                onClick={handleAcceptCounter}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-[#025246] text-white text-sm font-bold rounded-xl hover:bg-[#024036] transition-colors"
              >
                <Check size={16} />
                Setuju {formatRupiah(counterOffer)}
              </button>
              <button
                onClick={handleRejectCounter}
                className="px-4 py-2.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                Tidak
              </button>
            </div>
          )}

          {phase === "deal" && dealPrice !== null && (
            <div className="flex justify-center">
              <button
                onClick={handleConfirmDeal}
                className="flex items-center gap-2 px-6 py-3 bg-[#00AA5B] text-white text-sm font-bold rounded-xl hover:bg-[#009A4F] transition-colors shadow-lg"
              >
                <ShoppingCart size={18} />
                Masukkan ke Keranjang - {formatRupiah(dealPrice)}
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="shrink-0 border-t border-gray-100 px-4 py-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={
                phase === "waiting_offer"
                  ? "Ketik harga tawaran Anda..."
                  : phase === "counter"
                  ? "Ketik harga atau setuju..."
                  : "Negosiasi selesai"
              }
              disabled={phase === "deal" || phase === "rejected"}
              className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#025246] disabled:bg-gray-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || phase === "deal" || phase === "rejected"}
              className="w-12 h-12 bg-[#025246] text-white rounded-xl flex items-center justify-center hover:bg-[#024036] transition-colors disabled:opacity-40 shrink-0"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
