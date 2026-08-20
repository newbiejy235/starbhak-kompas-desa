"use client";

import { getClientUser } from "@/lib/auth/client";
import { useFetch } from "@/lib/hooks";
import { getChatRoomsForUser } from "@/actions/chat";
import ChatList from "@/components/shared/chat/ChatList";
import { LoadingState } from "@/components/shared/States";
import { MessageCircle } from "lucide-react";

export default function UserChatPage() {
  const user = getClientUser();

  const { data: rooms, loading } = useFetch(
    async () => {
      if (!user) return [];
      return getChatRoomsForUser(user.id, "pembeli");
    },
    [user?.id],
  );

  if (loading) return <LoadingState />;

  const totalRooms = rooms?.length || 0;

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-[640px]">
        <div className="mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#025246] to-[#00AA5B] rounded-2xl flex items-center justify-center shadow-sm">
              <MessageCircle size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#111111]">Pesan</h1>
              <p className="text-xs text-gray-500">Percakapan dan negosiasi Anda</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden h-[calc(100vh-10rem)]">
          <ChatList
            rooms={rooms || []}
            currentUserId={user?.id || 0}
            role="pembeli"
            basePath="/user/chat"
          />
        </div>

        {totalRooms > 0 && (
          <p className="text-center text-[11px] text-gray-400 mt-3">
            {totalRooms} percakapan
          </p>
        )}
      </div>
    </div>
  );
}
