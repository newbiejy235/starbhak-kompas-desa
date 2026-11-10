"use client";

import { neonAuthClient } from "./neon-client";
import { saveSession } from "./client";
import type { ClientUser } from "./client";

const OAUTH_SOURCE_KEY = "kd_oauth_source";
const OAUTH_ACTOR_KEY = "kd_oauth_actor";

/** Save which auth page initiated the OAuth flow */
export function setOAuthSource(source: string) {
  try { localStorage.setItem(OAUTH_SOURCE_KEY, source); } catch {}
}

/** Save which actor was selected during registration */
export function setOAuthActor(actor: string) {
  try { localStorage.setItem(OAUTH_ACTOR_KEY, actor); } catch {}
}

/** Get the registered actor if one was stored */
export function getOAuthActor(): string | null {
  try { return localStorage.getItem(OAUTH_ACTOR_KEY); } catch { return null; }
}

/** Get which auth page initiated the OAuth flow */
export function getOAuthSource(): string | null {
  try { return localStorage.getItem(OAUTH_SOURCE_KEY); } catch { return null; }
}

/** Clear all OAuth context data */
export function clearOAuthContext() {
  try { localStorage.removeItem(OAUTH_SOURCE_KEY); } catch {}
  try { localStorage.removeItem(OAUTH_ACTOR_KEY); } catch {}
}

export function getRoleRedirect(role: string): string {
  if (role === "admin") return "/admin";
  if (role === "petani") return "/petani/dashboard";
  return "/user/home";
}

/**
 * Check Neon Auth session after OAuth callback.
 * Returns the authenticated ClientUser or null.
 */
export async function checkNeonSession(): Promise<ClientUser | null> {
  try {
    const { data: session } = await neonAuthClient.getSession();
    if (session?.user?.id) {
      const clientUser: ClientUser = {
        id: Number(session.user.id),
        email: session.user.email || "",
        role: session.user.role || "pembeli",
        fullName: session.user.name || "",
        status: "pending",
        username: "",
      };
      saveSession(session.session?.token || "", clientUser);
      return clientUser;
    }
  } catch (err) {
    console.error("checkNeonSession error:", err instanceof Error ? err.message : err);
  }
  return null;
}

/**
 * Initiate OAuth social sign-in.
 * Save the source ("login" | "register") and optional actor before starting.
 */
export async function startOAuth(
  provider: "google" | "github",
  source: string,
  actor?: string,
) {
  setOAuthSource(source);
  if (actor) setOAuthActor(actor);
  try {
    await neonAuthClient.signIn.social({ provider });
  } catch (err) {
    throw new Error(
      `${provider === "google" ? "Google" : "GitHub"} sign-in failed: ${
        err instanceof Error ? err.message : String(err)
      }`,
    );
  }
}
