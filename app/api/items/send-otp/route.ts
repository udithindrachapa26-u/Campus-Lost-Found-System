import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { sendOtpEmail } from "@/lib/email";

async function ensurePendingTable() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS pending_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      item_type VARCHAR(20) NOT NULL,
      item_name VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      location VARCHAR(255) NOT NULL,
      item_date DATE NOT NULL,
      description TEXT NOT NULL,
      image_url VARCHAR(500) NULL,
      otp_code VARCHAR(6) NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  try {
    await pool.execute(`ALTER TABLE pending_items ADD COLUMN image_url VARCHAR(500) NULL AFTER description;`);
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
        { message: "Please login before reporting an item" },
        { status: 401 }
      );
    }

    const numericUserId = Number(userId);

    if (!Number.isInteger(numericUserId) || numericUserId <= 0) {
      return NextResponse.json(
        { message: "Invalid user session" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { itemType, itemName, category, location, date, description, imageUrl } = body;

    if (!itemType || !itemName || !category || !location || !date || !description) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    if (itemType !== "Lost" && itemType !== "Found") {
      return NextResponse.json(
        { message: "Item type must be Lost or Found" },
        { status: 400 }
      );
    }

    await ensurePendingTable();

    const [userRows] = await pool.execute(
      "SELECT email FROM users WHERE id = ?",
      [numericUserId]
    );
    const users = userRows as any[];

    if (users.length === 0) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const userEmail = users[0].email;
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    await pool.execute(
      "DELETE FROM pending_items WHERE user_id = ?",
      [numericUserId]
    );

    const [result] = await pool.execute(
      `
      INSERT INTO pending_items
      (user_id, item_type, item_name, category, location, item_date, description, image_url, otp_code, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))
      `,
      [
        numericUserId,
        itemType,
        itemName.trim(),
        category,
        location.trim(),
        date,
        description.trim(),
        imageUrl || null,
        otpCode,
      ]
    );

    const insertResult = result as { insertId: number };

    await sendOtpEmail(userEmail, otpCode, itemName.trim());

    return NextResponse.json(
      {
        message: "Verification OTP code sent to your email",
        pendingId: insertResult.insertId,
        userEmail,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("POST send-otp error:", error);
    return NextResponse.json(
      { message: "Failed to send verification code" },
      { status: 500 }
    );
  }
}
