/**
 * POST /api/auth/signup
 * Creates a new user account with bcrypt-hashed password.
 * Enforces company email domain and optional invite code.
 */
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { signupSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password, name, inviteCode } = parsed.data;

    // Check invite code if configured
    const requiredCode = process.env.INVITE_CODE;
    if (requiredCode && inviteCode !== requiredCode) {
      return NextResponse.json(
        { error: "Invalid invite code" },
        { status: 403 }
      );
    }

    // Check if email already exists
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password with bcrypt (cost factor 12 for security)
    const passwordHash = await bcrypt.hash(password, 12);

    const rows = await sql`
      INSERT INTO users (email, password_hash, name)
      VALUES (${email}, ${passwordHash}, ${name})
      RETURNING id
    `;

    // Create session and set cookie
    await createSession(rows[0].id);

    return NextResponse.json({ success: true, userId: rows[0].id });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
