import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";

async function ensureItemsImageColumn() {
  try {
    await pool.execute(`ALTER TABLE items ADD COLUMN image_url VARCHAR(500) NULL AFTER description;`);
  } catch (e) {
    // Column already exists
  }
}

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

    await ensureItemsImageColumn();

    const [rows] = await pool.execute(
      `
      SELECT id, user_id, item_type, item_name, category, location, item_date, description, image_url,
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

    if (pendingItem.is_expired) {
      await pool.execute("DELETE FROM pending_items WHERE id = ?", [pendingId]);
      return NextResponse.json(
        { message: "Verification code has expired. Please request a new code." },
        { status: 400 }
      );
    }

    const [result] = await pool.execute(
      `
      INSERT INTO items
      (user_id, item_type, item_name, category, location, item_date, description, image_url, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Active')
      `,
      [
        numericUserId,
        pendingItem.item_type,
        pendingItem.item_name,
        pendingItem.category,
        pendingItem.location,
        pendingItem.item_date,
        pendingItem.description,
        pendingItem.image_url || null,
      ]
    );

    const insertResult = result as { insertId: number };

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
