/**
 * GET /api/messages/thread/[userId] - Fetch message thread between current user and userId
 * POST /api/messages/thread/[userId] - Send a message to userId
 *
 * Authorization: Only the two participants can access their thread.
 */
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { messageSchema } from "@/lib/validation";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { userId } = await params;
    const partnerId = parseInt(userId);
    if (isNaN(partnerId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Verify partner exists
    const partner = await sql`
      SELECT id, name, avatar_url, title, department FROM users WHERE id = ${partnerId}
    `;
    if (partner.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch messages between the two users, chronological
    const messages = await sql`
      SELECT id, sender_id, receiver_id, body, created_at
      FROM messages
      WHERE (sender_id = ${user.id} AND receiver_id = ${partnerId})
         OR (sender_id = ${partnerId} AND receiver_id = ${user.id})
      ORDER BY created_at ASC
    `;

    return NextResponse.json({ messages, partner: partner[0] });
  } catch (error) {
    console.error("Thread fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { userId } = await params;
    const partnerId = parseInt(userId);
    if (isNaN(partnerId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    if (partnerId === user.id) {
      return NextResponse.json(
        { error: "Cannot message yourself" },
        { status: 400 }
      );
    }

    // Verify partner exists
    const partner = await sql`SELECT id FROM users WHERE id = ${partnerId}`;
    if (partner.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = messageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const rows = await sql`
      INSERT INTO messages (sender_id, receiver_id, body)
      VALUES (${user.id}, ${partnerId}, ${parsed.data.body})
      RETURNING id, sender_id, receiver_id, body, created_at
    `;

    return NextResponse.json({ message: rows[0] });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
