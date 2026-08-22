"use client";

import { getClientUser } from "@/lib/auth/client";
import { useFetch } from "@/lib/hooks";
import { getChatRoomsForUser } from "@/actions/chat";
import ChatList from "@/components/shared/chat/ChatList";
import { MessageCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

function ChatSkeleton() {
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-[640px]">
        <div className="bg-white rounded-card border border-gray-200/80 shadow-soft overflow-hidden h-[calc(100vh-10rem)] p-4 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PetaniChatPage() {
  const user = getClientUser();

  const { data: rooms, loading } = useFetch(
    async () => {
      if (!user) return [];
      return getChatRoomsForUser(user.id, "petani");
    },
    [user?.id],
  );

  if (loading) return <ChatSkeleton />;

  const totalRooms = rooms?.length || 0;

  return (
    <div className="flex justify-center animate-fade-up">
      <div className="w-full max-w-[640px]">
        <div className="mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-sm">
              <MessageCircle size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Pesan</h1>
              <p className="text-xs text-gray-500">Percakapan negosiasi dari pembeli</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-card border border-gray-200/80 shadow-soft overflow-hidden h-[calc(100vh-10rem)]">
          <ChatList
            rooms={rooms || []}
            currentUserId={user?.id || 0}
            role="petani"
            basePath="/petani/chat"
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
