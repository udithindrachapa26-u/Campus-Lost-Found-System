import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";

export async function GET() {
  try {

    // Get logged-in user
    const cookieStore =
      await cookies();

    const userId =
      cookieStore.get("user_id")?.value;

    if (!userId) {
      return NextResponse.json(
        {
          message:
            "Please login first",
        },
        {
          status: 401,
        }
      );
    }

    const numericUserId =
      Number(userId);

    if (
      !Number.isInteger(numericUserId) ||
      numericUserId <= 0
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid user session",
        },
        {
          status: 401,
        }
      );
    }

    // Get only this user's items
    const [rows] =
      await pool.execute(
        `
        SELECT
          id,
          item_type,
          item_name,
          category,
          location,
          item_date,
          description,
          status,
          created_at
        FROM items
        WHERE user_id = ?
        ORDER BY created_at DESC
        `,
        [numericUserId]
      );

    return NextResponse.json(rows);

  } catch (error) {

    console.error(
      "My items error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to fetch your items",
      },
      {
        status: 500,
      }
    );
  }
}