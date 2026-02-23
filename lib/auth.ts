/**
 * Authentication utilities for server-side session management.
 *
 * Architecture decision: Server-side sessions stored in PostgreSQL.
 * - Simpler than JWT for a homework project; sessions can be invalidated server-side.
 * - Session ID stored in httpOnly cookie to prevent XSS token theft.
 * - Sessions expire after 7 days.
 */
import { cookies } from "next/headers";
import { sql } from "./db";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "session_id";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/** Generate a cryptographically random session ID */
function generateSessionId(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Create a new session for a user and set the cookie */
export async function createSession(userId: number): Promise<void> {
  const sessionId = generateSessionId();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await sql`
    INSERT INTO sessions (id, user_id, expires_at)
    VALUES (${sessionId}, ${userId}, ${expiresAt.toISOString()})
  `;

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  });
}

/** Get the current authenticated user from session cookie, or null */
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const rows = await sql`
    SELECT u.id, u.email, u.name, u.department, u.title, u.skills,
           u.avatar_url, u.bio, u.show_email, u.created_at
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ${sessionId} AND s.expires_at > NOW()
  `;

  if (rows.length === 0) return null;

  // Update last_seen_at for "online status" feature (Feature B)
  await sql`UPDATE users SET last_seen_at = NOW() WHERE id = ${rows[0].id}`;

  return rows[0];
}

/** Require authentication - redirects to /login if not authenticated */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Destroy the current session */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (sessionId) {
    await sql`DELETE FROM sessions WHERE id = ${sessionId}`;
    cookieStore.delete(SESSION_COOKIE);
  }
}
