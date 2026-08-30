"use client";

import UserSidebar from "@/components/userpage/Sidebar";
import { HeaderSearch, HeaderActions } from "@/components/userpage/Header";
import DashboardShell from "@/components/shared/DashboardShell";
import { useAuth } from "@/lib/hooks";
import { useNegotiationNotification } from "@/lib/hooks/useNegotiationNotification";
import NegotiationNotificationPopup from "@/components/shared/chat/NegotiationNotificationPopup";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const userId = user?.id ?? 0;

  const { notification, dismiss, goToNegotiation } =
    useNegotiationNotification(userId, "/user");

  return (
    <DashboardShell
      role="pembeli"
      sidebar={<UserSidebar />}
      headerLabel="Panel Pembeli"
      headerLeft={<HeaderSearch />}
      headerRight={<HeaderActions />}
    >
      {children}
      {notification && (
        <NegotiationNotificationPopup
          notification={notification}
          onDismiss={dismiss}
          onAction={goToNegotiation}
        />
      )}
    </DashboardShell>
  );
}
