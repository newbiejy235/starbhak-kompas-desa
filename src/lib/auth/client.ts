export type ClientUser = {
  id: number;
  email: string;
  role: string;
  fullName: string;
  status: string;
  businessType?: string;
  username?: string;
};

const TOKEN_KEY = "kd_token";
const USER_KEY = "kd_user";

export function saveSession(token: string, user: ClientUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem("user_role", user.role);
}

export function getClientUser(): ClientUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ClientUser;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem("user_role");
}

export function getRoleRedirect(role: string): string {
  if (role === "admin") return "/admin/dashboard";
  if (role === "petani") return "/petani/dashboard";
  return "/user/home";
}

export function updateSessionRole(role: string) {
  if (typeof window === "undefined") return;
  const user = getClientUser();
  if (!user) return;
  user.role = role;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem("user_role", role);
}
