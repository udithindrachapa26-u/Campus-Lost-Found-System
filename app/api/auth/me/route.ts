import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();

    const userId = cookieStore.get("user_id")?.value;

    if (!userId) {
      return NextResponse.json(
        {
          message: "Not authenticated",
        },
        {
          status: 401,
        }
      );
    }

    const [rows] = await pool.execute(
      `
      SELECT id, name, email
      FROM users
      WHERE id = ?
      `,
      [userId]
    );

    const users = rows as any[];

    if (users.length === 0) {
      return NextResponse.json(
        {
          message: "User not found",
        },
        {
          status: 401,
        }
      );
    }

    return NextResponse.json({
      user: users[0],
    });

  } catch (error) {
    console.error("Get current user error:", error);

    return NextResponse.json(
      {
        message: "Failed to get current user",
      },
      {
        status: 500,
      }
    );
  }
}