/**
 * POST /api/auth/login
 * Authenticates user with email + password, creates a session.
 */
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    // Find user by email
    const rows = await sql`
      SELECT id, password_hash FROM users WHERE email = ${email}
    `;

    if (rows.length === 0) {
      // Use generic message to prevent email enumeration
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Compare password with stored bcrypt hash
    const valid = await bcrypt.compare(password, rows[0].password_hash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    await createSession(rows[0].id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
