/**
 * GET /api/users - List members with search and pagination
 * PUT /api/users - Update current user's profile (aliased from /api/users/me)
 *
 * Search matches against name, department, or skills fields.
 * Pagination defaults to 20 per page.
 */
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { profileUpdateSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = 20;
    const offset = (page - 1) * limit;

    let rows;
    let countRows;

    if (query) {
      const pattern = `%${query}%`;
      rows = await sql`
        SELECT id, name, department, title, skills, avatar_url, bio, show_email, email, last_seen_at
        FROM users
        WHERE name ILIKE ${pattern}
           OR department ILIKE ${pattern}
           OR skills ILIKE ${pattern}
        ORDER BY name ASC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countRows = await sql`
        SELECT COUNT(*) as total FROM users
        WHERE name ILIKE ${pattern}
           OR department ILIKE ${pattern}
           OR skills ILIKE ${pattern}
      `;
    } else {
      rows = await sql`
        SELECT id, name, department, title, skills, avatar_url, bio, show_email, email, last_seen_at
        FROM users
        ORDER BY name ASC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countRows = await sql`SELECT COUNT(*) as total FROM users`;
    }

    // Respect privacy: hide email if show_email is false (Feature A)
    const members = rows.map((row) => ({
      ...row,
      email: row.show_email ? row.email : null,
    }));

    return NextResponse.json({
      members,
      total: parseInt(countRows[0].total),
      page,
      totalPages: Math.ceil(parseInt(countRows[0].total) / limit),
    });
  } catch (error) {
    console.error("Users list error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = profileUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, department, title, skills, bio, show_email } = parsed.data;

    const rows = await sql`
      UPDATE users
      SET
        name = COALESCE(${name ?? null}, name),
        department = COALESCE(${department ?? null}, department),
        title = COALESCE(${title ?? null}, title),
        skills = COALESCE(${skills ?? null}, skills),
        bio = COALESCE(${bio ?? null}, bio),
        show_email = COALESCE(${show_email ?? null}, show_email),
        updated_at = NOW()
      WHERE id = ${user.id}
      RETURNING id, name, department, title, skills, bio, show_email, email, avatar_url
    `;

    return NextResponse.json({ user: rows[0] });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
