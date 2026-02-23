/**
 * GET /api/messages/conversations
 * Lists all conversation partners for the current user,
 * with the last message snippet and timestamp.
 * Computed on-the-fly from the messages table.
 */
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Find all distinct conversation partners and the latest message
    const conversations = await sql`
      WITH partners AS (
        SELECT DISTINCT
          CASE WHEN sender_id = ${user.id} THEN receiver_id ELSE sender_id END AS partner_id
        FROM messages
        WHERE sender_id = ${user.id} OR receiver_id = ${user.id}
      ),
      latest_messages AS (
        SELECT DISTINCT ON (p.partner_id)
          p.partner_id,
          m.id as message_id,
          m.body,
          m.created_at,
          m.sender_id
        FROM partners p
        JOIN messages m ON
          (m.sender_id = ${user.id} AND m.receiver_id = p.partner_id)
          OR (m.sender_id = p.partner_id AND m.receiver_id = ${user.id})
        ORDER BY p.partner_id, m.created_at DESC
      )
      SELECT
        lm.partner_id,
        lm.body as last_message,
        lm.created_at as last_message_at,
        lm.sender_id as last_message_sender_id,
        u.name as partner_name,
        u.avatar_url as partner_avatar,
        u.title as partner_title,
        u.department as partner_department
      FROM latest_messages lm
      JOIN users u ON u.id = lm.partner_id
      ORDER BY lm.created_at DESC
    `;

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Conversations error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
