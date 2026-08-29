"use client";

import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks";
import { useChatSSE } from "@/lib/hooks/useChatSSE";
import { addToCart } from "@/lib/cart";
import ChatRoomView from "@/components/shared/chat/ChatRoomView";
import { LoadingState } from "@/components/shared/States";
import { addOrders } from "@/actions/orders/orders.action";
import { getUsersOrder } from "@/actions/orders/orders.action";

export default function UserChatRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const userId = currentUser?.id ?? 0;
  const userFullName = currentUser?.fullName ?? "Anda";
  const rid = Number(roomId);

  const { room, messages, loading, sendMessage, editMessage, deleteMessage } =
    useChatSSE(rid, userId, userFullName);

  const handleAddToCart = (price: number, quantity: number) => {
    if (!room) return;

    addToCart(room.commodityId, quantity, price);
    // router.push("/user/orders");
    console.log("hello");
    console.log(userId, userFullName);

    // getUsersOrder(userId)
    addOrders(userId,room.commodityId, quantity, price)
    console.log("idUsers",userId);
    console.log("commodityId",room.commodityId);
    console.log("qty",quantity);
    console.log("harga",price);
    
    
  };

  if (loading) return <LoadingState />;
  if (!room)
    return (
      <div className="text-center py-20 text-gray-500">
        Chat tidak ditemukan.
      </div>
    );

  return (
    <ChatRoomView
      room={room}
      messages={messages}
      currentUserId={userId}
      currentRole="pembeli"
      onSendMessage={sendMessage}
      onAddToCart={handleAddToCart}
      onBack={() => router.push("/user/chat")}
      onEditMessage={editMessage}
      onDeleteMessage={deleteMessage}
    />
  );
}
