"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import {
  Send,
  ArrowLeft,
  Package,
  Check,
  CheckCheck,
  X,
  ShoppingCart,
  MapPin,
  Tag,
  Handshake,
  ChevronDown,
  ChevronUp,
  Loader2,
  Pencil,
  Trash2,
  MoreVertical,
  AlertTriangle,
  Reply,
} from "lucide-react";
import { formatRupiah, formatNumber } from "@/lib/format";
import { formatImage } from "@/components/shared/States";
import Avatar from "@/components/ui/Avatar";

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
  pendingOffer: {
    id: number;
    price: string;
    quantity: string;
    unit: string;
    status: string;
    createdAt: Date;
  } | null;
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
  isEdited: boolean;
  isDeleted: boolean;
  replyToId: number | null;
  createdAt: Date;
  senderName: string;
  senderFoto: string | null;
}

interface ChatRoomViewProps {
  room: ChatRoomData;
  messages: ChatMessageData[];
  currentUserId: number;
  currentRole: "pembeli" | "petani";
  onSendMessage: (content: string, type?: string, offerPrice?: number, offerQuantity?: number, replyToId?: number) => Promise<void>;
  onAddToCart: (price: number, quantity: number) => void;
  onBack: () => void;
  onEditMessage?: (messageId: number, newContent: string) => Promise<{ success: boolean; error?: string }>;
  onDeleteMessage?: (messageId: number) => Promise<{ success: boolean; error?: string }>;
}

function formatTime(date: Date) {
  const d = new Date(date);
  return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(date: Date) {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Hari ini";
  if (d.toDateString() === yesterday.toDateString()) return "Kemarin";
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function shouldShowDate(messages: ChatMessageData[], index: number) {
  if (index === 0) return true;
  const prev = new Date(messages[index - 1].createdAt);
  const curr = new Date(messages[index].createdAt);
  return prev.toDateString() !== curr.toDateString();
}

export default function ChatRoomView({
  room,
  messages,
  currentUserId,
  currentRole,
  onSendMessage,
  onAddToCart,
  onBack,
  onEditMessage,
  onDeleteMessage,
}: ChatRoomViewProps) {
  const [input, setInput] = useState("");
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerPrice, setOfferPrice] = useState("");
  const [offerQty, setOfferQty] = useState("1");
  const [submittingDeal, setSubmittingDeal] = useState(false);
  const [showProductInfo, setShowProductInfo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; msg: ChatMessageData } | null>(null);
  const [editingMsg, setEditingMsg] = useState<ChatMessageData | null>(null);
  const [editContent, setEditContent] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<ChatMessageData | null>(null);
  const [replyTo, setReplyTo] = useState<ChatMessageData | null>(null);

  const img = formatImage(room.commodityImage);
  const minPrice = room.commodityMinPrice ? Number(room.commodityMinPrice) : null;
  const maxPrice = room.commodityMaxPrice ? Number(room.commodityMaxPrice) : null;
  const hasPriceRange = minPrice !== null && maxPrice !== null && minPrice !== maxPrice;
  const stock = Number(room.commodityStock);
  const isFarmer = currentRole === "petani";

  const pendingOffer = room.pendingOffer;
  const hasPendingOffer = pendingOffer !== null;
  const isPendingBuyer = hasPendingOffer && pendingOffer.status === "pending" && currentUserId === room.buyerId;
  const isPendingFarmer = hasPendingOffer && pendingOffer.status === "pending" && currentUserId === room.farmerId;

  const latestAcceptedOffer = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.type === "accept") {
        if (msg.offerPrice && msg.offerQuantity) return msg;
        const prev = messages[i - 1];
        if (prev && prev.type === "offer") return prev;
      }
    }
    return null;
  }, [messages]);

  const hasAcceptedDeal = useMemo(() => messages.some((m) => m.type === "accept"), [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close context menu on outside click
  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    document.addEventListener("click", close);
    document.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("scroll", close, true);
    };
  }, [contextMenu]);

  const handleContextMenu = useCallback((e: React.MouseEvent, msg: ChatMessageData) => {
    e.preventDefault();
    e.stopPropagation();
    const menuWidth = 170;
    const menuHeight = 132;
    let x = e.clientX;
    let y = e.clientY;
    if (x + menuWidth > window.innerWidth) x = window.innerWidth - menuWidth - 8;
    if (y + menuHeight > window.innerHeight) y = window.innerHeight - menuHeight - 8;
    setContextMenu({ x, y, msg });
  }, []);

  const handleEdit = useCallback(() => {
    if (!contextMenu) return;
    setEditingMsg(contextMenu.msg);
    setEditContent(contextMenu.msg.content);
    setContextMenu(null);
  }, [contextMenu]);

  const handleDelete = useCallback(() => {
    if (!contextMenu) return;
    setDeleteConfirm(contextMenu.msg);
    setContextMenu(null);
  }, [contextMenu]);

  const handleReply = useCallback(() => {
    if (!contextMenu) return;
    setReplyTo(contextMenu.msg);
    setContextMenu(null);
    setTimeout(() => {
      const inputEl = document.getElementById("chat-input") as HTMLInputElement | null;
      inputEl?.focus();
    }, 50);
  }, [contextMenu]);

  const handleSaveEdit = async () => {
    if (!editingMsg || !editContent.trim() || !onEditMessage) return;
    const res = await onEditMessage(editingMsg.id, editContent.trim());
    if (res.success) {
      setEditingMsg(null);
      setEditContent("");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm || !onDeleteMessage) return;
    await onDeleteMessage(deleteConfirm.id);
    setDeleteConfirm(null);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    const replyId = replyTo?.id && replyTo.id > 0 ? replyTo.id : undefined;
    setReplyTo(null);
    await onSendMessage(text, "text", undefined, undefined, replyId);
  };

  const handleSendOffer = async () => {
    const price = parseFloat(offerPrice);
    const qty = parseFloat(offerQty);
    if (isNaN(price) || price <= 0 || isNaN(qty) || qty <= 0) return;
    const offerText = `Penawaran: ${formatRupiah(price)} / ${room.commodityUnit} x ${formatNumber(qty)} ${room.commodityUnit}`;
    const replyId = replyTo?.id && replyTo.id > 0 ? replyTo.id : undefined;
    setReplyTo(null);
    await onSendMessage(offerText, "offer", price, qty, replyId);
    setShowOfferForm(false);
    setOfferPrice("");
    setOfferQty("1");
  };

  const handleAcceptOffer = async () => {
    if (!pendingOffer || submittingDeal) return;
    setSubmittingDeal(true);
    try {
      const price = Number(pendingOffer.price);
      const qty = Number(pendingOffer.quantity);
      const acceptText = `Deal! ${formatRupiah(price)} / ${room.commodityUnit} x ${formatNumber(qty)} ${room.commodityUnit} = ${formatRupiah(price * qty)}`;
      await onSendMessage(acceptText, "accept", price, qty);
    } finally {
      setSubmittingDeal(false);
    }
  };

  const handleRejectOffer = async () => {
    if (!pendingOffer || submittingDeal) return;
    setSubmittingDeal(true);
    try {
      await onSendMessage("Penawaran ditolak", "reject");
    } finally {
      setSubmittingDeal(false);
    }
  };

  const getReplyMessage = (replyToId: number | null): ChatMessageData | undefined => {
    if (!replyToId || replyToId < 0) return undefined;
    return messages.find((m) => m.id === replyToId);
  };

  const renderMessage = (msg: ChatMessageData, isMe: boolean) => {
    const isSystem = msg.type === "system";
    const isOffer = msg.type === "offer" || msg.type === "counter_offer";
    const isAccept = msg.type === "accept";
    const isReject = msg.type === "reject";
    const isEditing = editingMsg?.id === msg.id;
    const canInteract = isMe && !isSystem && !msg.isDeleted && onEditMessage;
    const canReply = !isSystem && !msg.isDeleted;

    if (isSystem) {
      return (
        <div className="flex justify-center my-2">
          <span className="text-[11px] text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
            {msg.content}
          </span>
        </div>
      );
    }

    const replyMsg = getReplyMessage(msg.replyToId);

    return (
      <div
        className={`flex ${isMe ? "justify-end" : "justify-start"} mb-2 group`}
        onContextMenu={(e) => (canInteract || canReply) && handleContextMenu(e, msg)}
      >
        <div className={`flex items-end gap-2 max-w-[80%] ${isMe ? "flex-row-reverse" : ""}`}>
          {!isMe && (
            <Avatar src={msg.senderFoto} name={msg.senderName} size="xs" className="mb-5" />
          )}
          <div className={`max-w-full`}>
            {!isMe && (
              <p className="text-[11px] font-semibold text-primary mb-0.5 ml-3">{msg.senderName}</p>
            )}
          <div
            className={`relative px-3.5 py-2.5 text-[13px] leading-relaxed ${isMe
              ? "bg-primary text-white rounded-2xl rounded-br-sm"
              : "bg-white text-gray-800 rounded-2xl rounded-bl-sm border border-gray-100 shadow-sm"
              } ${msg.isDeleted ? "opacity-60 italic" : ""}`}
          >
            {/* Reply quote */}
            {replyMsg && !msg.isDeleted && (
              <div
                className={`mb-2 pl-2 border-l-2 ${isMe ? "border-white/40 bg-white/10" : "border-[#025246] bg-gray-50"
                  } rounded-r-md py-1 px-2 cursor-pointer hover:opacity-80 transition-opacity`}
                onClick={() => {
                  const el = document.getElementById(`msg-${replyMsg.id}`);
                  el?.scrollIntoView({ behavior: "smooth", block: "center" });
                  el?.classList.add("ring-2", "ring-[#00AA5B]", "ring-offset-1");
                  setTimeout(() => el?.classList.remove("ring-2", "ring-[#00AA5B]", "ring-offset-1"), 1500);
                }}
              >
                <p className={`text-[10px] font-bold ${isMe ? "text-white/80" : "text-primary"}`}>
                  {replyMsg.senderId === currentUserId ? "Anda" : replyMsg.senderName}
                </p>
                <p className={`text-[11px] truncate ${isMe ? "text-white/70" : "text-gray-500"} max-w-[200px]`}>
                  {replyMsg.isDeleted ? "Pesan telah dihapus" : replyMsg.content}
                </p>
              </div>
            )}

            {isOffer && (
              <div className={`mb-2 p-2.5 rounded-xl ${isMe ? "bg-white/15" : "bg-gray-50 border border-gray-100"}`}>
                <div className={`flex items-center gap-1.5 text-xs font-bold ${isMe ? "text-white/90" : "text-primary"}`}>
                  <Tag size={12} />
                  {msg.type === "counter_offer" ? "Counter" : "Penawaran"}
                </div>
                {msg.offerPrice && (
                  <p className={`text-sm font-bold mt-1 ${isMe ? "text-white" : "text-primary"}`}>
                    {formatRupiah(msg.offerPrice)}
                    <span className={`text-[11px] font-normal ${isMe ? "text-white/60" : "text-gray-500"}`}>
                      {" "}per {room.commodityUnit}
                    </span>
                    {msg.offerQuantity && (
                      <span className={`text-[11px] font-normal ${isMe ? "text-white/60" : "text-gray-500"}`}>
                        {" "}&bull; {formatNumber(msg.offerQuantity)} {room.commodityUnit}
                      </span>
                    )}
                  </p>
                )}
              </div>
            )}
            {isAccept && (
              <div className={`flex items-center gap-1.5 text-xs font-bold mb-1 ${isMe ? "text-green-300" : "text-green-600"}`}>
                <Check size={14} /> Deal disetujui
              </div>
            )}
            {isReject && (
              <div className={`flex items-center gap-1.5 text-xs font-bold mb-1 ${isMe ? "text-red-300" : "text-red-500"}`}>
                <X size={14} /> Penawaran ditolak
              </div>
            )}

            {isEditing ? (
              <div className="min-w-[200px]">
                <input
                  id="edit-input"
                  type="text"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveEdit();
                    if (e.key === "Escape") { setEditingMsg(null); setEditContent(""); }
                  }}
                  autoFocus
                  className="w-full bg-white/20 text-white placeholder-white/50 rounded-lg px-3 py-1.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-white/40"
                  placeholder="Edit pesan..."
                />
                <div className="flex gap-1.5 mt-1.5">
                  <button onClick={handleSaveEdit} className="text-[10px] font-bold bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-md transition-colors">
                    Simpan
                  </button>
                  <button onClick={() => { setEditingMsg(null); setEditContent(""); }} className="text-[10px] font-bold bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-md transition-colors">
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="whitespace-pre-line">{msg.content}</p>
                {msg.isEdited && !msg.isDeleted && (
                  <span className={`text-[9px] italic ${isMe ? "text-white/40" : "text-gray-400"}`}>diedit</span>
                )}
                <div className={`flex items-center justify-end gap-1 mt-1.5 ${isMe ? "text-white/50" : "text-gray-400"}`}>
                  <span className="text-[10px]">{formatTime(msg.createdAt)}</span>
                  {isMe && (
                    msg.id < 0 ? (
                      <Loader2 size={11} className="animate-spin" />
                    ) : msg.isRead ? (
                      <CheckCheck size={13} className="text-[#53BDEB]" />
                    ) : (
                      <CheckCheck size={13} />
                    )
                  )}
                </div>
              </>
            )}

            {(canInteract || canReply) && !isEditing && (
              <button
                id={`msg-${msg.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleContextMenu(e as unknown as React.MouseEvent, msg);
                }}
                className={`absolute top-1/2 -translate-y-1/2 ${isMe ? "-left-8" : "-right-8"} opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-black/5`}
              >
                <MoreVertical size={14} className="text-gray-400" />
              </button>
            )}
          </div>
        </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[100dvh] lg:h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-primary text-white shrink-0 shadow-md">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <Avatar
          src={isFarmer ? room.buyerFoto : room.farmerFoto}
          name={isFarmer ? room.buyerName : room.farmerName}
          size="sm"
          className="ring-2 ring-white/20"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold truncate">
            {isFarmer ? room.buyerName : room.farmerName}
          </h3>
          <p className="text-[11px] text-white/60 truncate">{room.commodityName}</p>
        </div>
        {hasAcceptedDeal && (
          <span className="text-[10px] bg-green-400 text-white px-2.5 py-1 rounded-full font-bold tracking-wide">
            DEAL
          </span>
        )}
      </div>

      {/* Product Info Toggle */}
      <button
        onClick={() => setShowProductInfo(!showProductInfo)}
        className="flex items-center justify-center gap-2 py-2.5 bg-white border-b border-gray-200 text-primary text-xs font-semibold shrink-0 hover:bg-gray-50 transition-colors"
      >
        <div className="w-5 h-5 bg-primary rounded flex items-center justify-center">
          <Package size={12} className="text-white" />
        </div>
        {room.commodityName}
        <span className="text-gray-400 font-normal">-</span>
        <span className="font-bold">{hasPriceRange ? `${formatRupiah(minPrice)}-${formatRupiah(maxPrice)}` : formatRupiah(room.commodityPrice)}</span>
        <span className="text-gray-400 font-normal text-[11px]">/{room.commodityUnit}</span>
        {showProductInfo ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
      </button>

      {showProductInfo && (
        <div className="bg-white border-b border-gray-200 px-4 py-3 shrink-0">
          <div className="flex gap-3">
            <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 relative border border-gray-200">
              {img ? (
                <Image src={img} alt={room.commodityName} fill sizes="64px" className="object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                  <Package size={20} className="text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500">Stok: <span className="font-semibold text-gray-700">{formatNumber(room.commodityStock)}</span> {room.commodityUnit}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <MapPin size={10} className="text-primary" /> {room.farmerAddress || "Lokasi tidak diketahui"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pending Offer Banner */}
      {hasPendingOffer && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-200 px-4 py-3 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <Handshake size={16} className="text-amber-600" />
              </div>
              <div>
                <p className="text-[11px] text-amber-600 font-medium">
                  {isPendingFarmer ? "Penawaran dari pembeli" : "Penawaran Anda"}
                </p>
                <p className="text-sm font-extrabold text-primary">
                  {formatRupiah(pendingOffer.price)}
                  {pendingOffer.quantity && (
                    <span className="text-[11px] font-normal text-gray-500">
                      {" "}x {formatNumber(pendingOffer.quantity)} {pendingOffer.unit}
                    </span>
                  )}
                </p>
                {isPendingBuyer && (
                  <p className="text-[11px] text-gray-500 mt-0.5">Menunggu respon petani...</p>
                )}
              </div>
            </div>
            {isPendingFarmer && (
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={handleAcceptOffer}
                  disabled={submittingDeal}
                  className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-dark shadow-sm disabled:opacity-40 transition-colors duration-150"
                >
                  {submittingDeal ? "Proses..." : "Terima"}
                </button>
                <button
                  onClick={handleRejectOffer}
                  disabled={submittingDeal}
                  className="px-3 py-1.5 bg-white border border-red-200 text-red-600 text-xs font-bold rounded-lg hover:bg-red-50 disabled:opacity-40"
                >
                  Tolak
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Deal Banner */}
      {hasAcceptedDeal && !hasPendingOffer && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 px-4 py-3 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Handshake size={16} className="text-green-600" />
              </div>
              <div>
                <p className="text-[11px] text-green-600 font-medium">Deal Tercapai!</p>
                {latestAcceptedOffer && (
                  <p className="text-sm font-extrabold text-primary">
                    {formatRupiah(latestAcceptedOffer.offerPrice)}
                    <span className="text-[11px] font-normal text-gray-500">
                      {" "}x {formatNumber(latestAcceptedOffer.offerQuantity)} {room.commodityUnit} = {" "}
                      {formatRupiah(Number(latestAcceptedOffer.offerPrice) * Number(latestAcceptedOffer.offerQuantity))}
                    </span>
                  </p>
                )}
              </div>
            </div>
            {!isFarmer && latestAcceptedOffer?.offerPrice && latestAcceptedOffer?.offerQuantity && (
              <button
                onClick={() => onAddToCart(Number(latestAcceptedOffer.offerPrice), Number(latestAcceptedOffer.offerQuantity))}
                className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-dark flex items-center gap-1.5 shadow-sm shrink-0 transition-colors duration-150"
              >
                <ShoppingCart size={14} /> Keranjang
              </button>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {messages.map((msg, i) => {
          const isMe = msg.senderId === currentUserId;
          const showDate = shouldShowDate(messages, i);
          return (
            <div key={msg.id} id={`msg-wrap-${msg.id}`}>
              {showDate && (
                <div className="flex justify-center my-4">
                  <span className="text-[11px] text-gray-500 bg-white px-3 py-1 rounded-lg shadow-sm border border-gray-100 font-medium">
                    {formatDate(msg.createdAt)}
                  </span>
                </div>
              )}
              {renderMessage(msg, isMe)}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 bg-white border-t border-gray-200 px-3 py-3">
        {/* Reply preview */}
        {replyTo && (
          <div className="bg-gray-50 rounded-xl p-2.5 mb-2 border-l-2 border-primary flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-primary">
                Membalas {replyTo.senderId === currentUserId ? "Anda" : replyTo.senderName}
              </p>
              <p className="text-[11px] text-gray-500 truncate">
                {replyTo.isDeleted ? "Pesan telah dihapus" : replyTo.content}
              </p>
            </div>
            <button
              onClick={() => setReplyTo(null)}
              className="p-1 hover:bg-gray-200 rounded-lg transition-colors shrink-0"
            >
              <X size={14} className="text-gray-400" />
            </button>
          </div>
        )}

        {showOfferForm && (
          <div className="bg-gray-50 rounded-xl p-3 mb-2.5 border border-gray-200">
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-bold text-gray-800">Ajukan Penawaran</h4>
              <button onClick={() => setShowOfferForm(false)} className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
                <X size={14} className="text-gray-400" />
              </button>
            </div>
            {hasPriceRange && (
              <p className="text-[11px] text-gray-500 mb-2">
                Range: {formatRupiah(minPrice)} - {formatRupiah(maxPrice)} / {room.commodityUnit}
              </p>
            )}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <input
                type="number"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                placeholder="Harga"
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-colors duration-200"
              />
              <input
                type="number"
                value={offerQty}
                onChange={(e) => setOfferQty(e.target.value)}
                min="1"
                max={stock}
                placeholder={`Qty (${room.commodityUnit})`}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-colors duration-200"
              />
            </div>
            {offerPrice && offerQty && (
              <p className="text-xs font-bold text-primary mb-2">
                Total: {formatRupiah(parseFloat(offerPrice) * parseFloat(offerQty || "1"))}
              </p>
            )}
            <button
              onClick={handleSendOffer}
              disabled={!offerPrice || parseFloat(offerPrice) <= 0 || hasPendingOffer}
              className="w-full bg-primary text-white text-xs font-bold py-2 rounded-lg hover:bg-primary-dark disabled:opacity-40 transition-colors duration-150"
            >
              Kirim Penawaran
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          {!showOfferForm && hasPriceRange && !hasPendingOffer && (
            <button
              onClick={() => { setOfferPrice(""); setOfferQty("1"); setShowOfferForm(true); }}
              className="px-3 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark flex items-center gap-1.5 shrink-0 shadow-sm transition-colors duration-150"
            >
              <Tag size={14} /> Nego
            </button>
          )}
          <div className="flex-1 relative">
            <input
              id="chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ketik pesan..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15 transition-all duration-200"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary-dark disabled:opacity-40 shrink-0 shadow-sm transition-colors duration-150"
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden min-w-[170px] py-1"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          {canReplyFor(contextMenu.msg) && (
            <button
              onClick={handleReply}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Reply size={15} className="text-primary" />
              Balas Pesan
            </button>
          )}
          {onEditMessage && contextMenu.msg.senderId === currentUserId && contextMenu.msg.type === "text" && !contextMenu.msg.isDeleted && (
            <button
              onClick={handleEdit}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Pencil size={15} className="text-primary" />
              Edit Pesan
            </button>
          )}
          {onDeleteMessage && contextMenu.msg.senderId === currentUserId && !contextMenu.msg.isDeleted && (
            <button
              onClick={handleDelete}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={15} />
              Hapus Pesan
            </button>
          )}
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="px-5 py-4 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertTriangle size={24} className="text-red-500" />
              </div>
              <h3 className="font-bold text-sm text-gray-800">Hapus Pesan?</h3>
              <p className="text-xs text-gray-500 mt-1">Pesan yang dihapus tidak bisa dikembalikan.</p>
              <p className="text-xs text-gray-400 mt-2 line-clamp-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                &ldquo;{deleteConfirm.content}&rdquo;
              </p>
            </div>
            <div className="flex border-t border-gray-100">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-3 text-sm font-bold text-red-600 hover:bg-red-50 border-l border-gray-100 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function canReplyFor(msg: ChatMessageData): boolean {
  return msg.type !== "system" && !msg.isDeleted;
}
