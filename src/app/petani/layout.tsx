"use client";

import PetaniSidebar from "@/components/petanipage/Sidebar";
import DashboardShell from "@/components/shared/DashboardShell";
import { useAuth } from "@/lib/hooks";
import { useNegotiationNotification } from "@/lib/hooks/useNegotiationNotification";
import NegotiationNotificationPopup from "@/components/shared/chat/NegotiationNotificationPopup";

export default function PetaniLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const userId = user?.id ?? 0;

  const { notification, dismiss, goToNegotiation } =
    useNegotiationNotification(userId, "/petani");

  return (
    <DashboardShell role="petani" sidebar={<PetaniSidebar />} headerLabel="Panel Petani">
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
