/**
 * Auth Helper Functions for NeedTools
 * Uses Appwrite Account SDK (client-side only — static export compatible)
 */

import { account, OAuthProvider, ID_GEN } from "./appwrite";
import type { Models } from "appwrite";

// ─── Google OAuth ───────────────────────────────────────────
export async function loginWithGoogle() {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://needtools.app";
  account.createOAuth2Session(
    OAuthProvider.Google,
    `${origin}/dashboard`,  // success redirect
    `${origin}`,            // failure redirect
  );
}

// ─── Email/Password Login ───────────────────────────────────
export async function loginWithEmail(email: string, password: string) {
  return account.createEmailPasswordSession(email, password);
}

// ─── Email/Password Registration ────────────────────────────
export async function registerWithEmail(name: string, email: string, password: string) {
  await account.create(ID_GEN.unique(), email, password, name);
  return loginWithEmail(email, password);
}

// ─── Get Current User ───────────────────────────────────────
export async function getCurrentUser(): Promise<Models.User<Models.Preferences> | null> {
  try {
    return await account.get();
  } catch {
    return null;
  }
}

// ─── Logout ─────────────────────────────────────────────────
export async function logout() {
  try {
    await account.deleteSession("current");
  } catch {
    // Session may already be expired
  }
}

// ─── User Display Helpers ───────────────────────────────────
export function getUserInitials(name?: string): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
}
