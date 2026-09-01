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
      SELECT id, name, email, phone
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

// ======================================
// PATCH - Update current user profile
// ======================================

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;

    if (!userId) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { phone } = body;

    // Validate phone number (10 digits)
    const phoneRegex = /^[0-9]{10}$/;

    if (!phone || !phoneRegex.test(phone.trim())) {
      return NextResponse.json(
        { message: "Phone number must be exactly 10 digits" },
        { status: 400 }
      );
    }

    // Check phone not already taken by another user
    const [existing] = await pool.execute(
      "SELECT id FROM users WHERE phone = ? AND id != ?",
      [phone.trim(), userId]
    );

    if ((existing as any[]).length > 0) {
      return NextResponse.json(
        { message: "This phone number is already registered to another account" },
        { status: 409 }
      );
    }

    await pool.execute(
      "UPDATE users SET phone = ? WHERE id = ?",
      [phone.trim(), userId]
    );

    return NextResponse.json({
      message: "Contact number saved successfully",
    });

  } catch (error) {
    console.error("PATCH user error:", error);

    return NextResponse.json(
      { message: "Failed to update profile" },
      { status: 500 }
    );
  }
}
