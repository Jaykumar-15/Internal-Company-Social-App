/**
 * GET /api/users/[id] - View a specific user's profile
 * Only returns public-facing fields. Respects show_email privacy setting.
 */
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const rows = await sql`
      SELECT id, name, department, title, skills, avatar_url, bio, show_email, email, last_seen_at, created_at
      FROM users WHERE id = ${userId}
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const member = {
      ...rows[0],
      email: rows[0].show_email ? rows[0].email : null,
    };

    return NextResponse.json({ member });
  } catch (error) {
    console.error("User detail error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
