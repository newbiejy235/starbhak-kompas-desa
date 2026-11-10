import type { ReactNode } from "react";

interface AuthProviderProps {
  authClient: any;
  navigate: (params: { to: string; replace?: boolean }) => void;
  Link: any;
  redirectTo: string;
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return <>{children}</>;
}