"use client";

import { useRouter } from "next/navigation";
import { getClientUser } from "@/lib/auth/client";
import { useFetch } from "@/lib/hooks";
import { getChatRoomsForUser } from "@/actions/chat";
import ChatList from "@/components/shared/chat/ChatList";
import { LoadingState } from "@/components/shared/States";

export default function UserChatPage() {
  const router = useRouter();
  const user = getClientUser();

  const { data: rooms, loading } = useFetch(
    async () => {
      if (!user) return [];
      return getChatRoomsForUser(user.id, "pembeli");
    },
    [user?.id],
  );

  if (loading) return <LoadingState />;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111111]">Pesan</h1>
        <p className="text-sm text-gray-500 mt-1">Percakapan dan negosiasi Anda</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <ChatList
          rooms={rooms || []}
          currentUserId={user?.id || 0}
          role="pembeli"
          basePath="/user/chat"
        />
      </div>
    </div>
  );
}
