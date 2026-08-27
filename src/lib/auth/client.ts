export type ClientUser = {
  id: number;
  email: string;
  role: string;
  fullName: string;
  status: string;
  businessType?: string;
  username?: string;
  fotoProfile?: string | null;
};

const TOKEN_KEY = "kd_token";
const USER_KEY = "kd_user";
const CHANNEL_NAME = "kd-auth";

let channel: BroadcastChannel | null = null;
function getChannel(): BroadcastChannel | null {
  if (typeof window === "undefined") return null;
  if (!channel) {
    try {
      channel = new BroadcastChannel(CHANNEL_NAME);
    } catch {
      return null;
    }
  }
  return channel;
}

export function saveSession(token: string, user: ClientUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem("user_role", user.role);
  document.cookie = `kd_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
  _cachedRaw = null;
  _cachedUser = null;
  getChannel()?.postMessage("update");
}

let _cachedRaw: string | null = null;
let _cachedUser: ClientUser | null = null;

export function getClientUser(): ClientUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) {
      _cachedRaw = null;
      _cachedUser = null;
      return null;
    }
    if (raw === _cachedRaw) return _cachedUser;
    _cachedRaw = raw;
    _cachedUser = JSON.parse(raw) as ClientUser;
    return _cachedUser;
  } catch {
    _cachedRaw = null;
    _cachedUser = null;
    return null;
  }
}

export function subscribeToUserChanges(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === USER_KEY) callback();
  };
  const onChannel = () => callback();
  window.addEventListener("storage", onStorage);
  getChannel()?.addEventListener("message", onChannel);
  return () => {
    window.removeEventListener("storage", onStorage);
    getChannel()?.removeEventListener("message", onChannel);
  };
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
  document.cookie = "kd_token=; path=/; max-age=0";
  _cachedRaw = null;
  _cachedUser = null;
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
  _cachedRaw = null;
  _cachedUser = null;
}
