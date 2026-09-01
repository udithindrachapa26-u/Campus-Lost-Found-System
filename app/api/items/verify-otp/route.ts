import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;

    if (!userId) {
      return NextResponse.json(
        { message: "Please login first" },
        { status: 401 }
      );
    }

    const numericUserId = Number(userId);

    const body = await request.json();
    const { pendingId, otpCode } = body;

    if (!pendingId || !otpCode) {
      return NextResponse.json(
        { message: "Pending ID and OTP code are required" },
        { status: 400 }
      );
    }

    const cleanOtp = String(otpCode).trim();

    // Fetch pending item matching ID, user_id and otp_code
    const [rows] = await pool.execute(
      `
      SELECT id, user_id, item_type, item_name, category, location, item_date, description,
             (expires_at < NOW()) AS is_expired
      FROM pending_items
      WHERE id = ? AND user_id = ? AND otp_code = ?
      `,
      [pendingId, numericUserId, cleanOtp]
    );

    const pendingItems = rows as any[];

    if (pendingItems.length === 0) {
      return NextResponse.json(
        { message: "Invalid verification code. Please check and try again." },
        { status: 400 }
      );
    }

    const pendingItem = pendingItems[0];

    // Check expiration using MySQL's evaluation
    if (pendingItem.is_expired) {
      // Clean up expired pending item
      await pool.execute("DELETE FROM pending_items WHERE id = ?", [pendingId]);

      return NextResponse.json(
        { message: "Verification code has expired. Please request a new code." },
        { status: 400 }
      );
    }

    // OTP is valid! Insert into actual items table
    const [result] = await pool.execute(
      `
      INSERT INTO items
      (user_id, item_type, item_name, category, location, item_date, description, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'Active')
      `,
      [
        numericUserId,
        pendingItem.item_type,
        pendingItem.item_name,
        pendingItem.category,
        pendingItem.location,
        pendingItem.item_date,
        pendingItem.description,
      ]
    );

    const insertResult = result as { insertId: number };

    // Delete pending record
    await pool.execute("DELETE FROM pending_items WHERE id = ?", [pendingId]);

    return NextResponse.json(
      {
        message: "Item verified and posted successfully!",
        itemId: insertResult.insertId,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("POST verify-otp error:", error);
    return NextResponse.json(
      { message: "Failed to verify OTP code" },
      { status: 500 }
    );
  }
}
