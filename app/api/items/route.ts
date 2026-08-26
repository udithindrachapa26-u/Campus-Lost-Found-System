import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM items ORDER BY created_at DESC"
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET error:", error);

    return NextResponse.json(
      { message: "Failed to fetch items" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      itemType,
      itemName,
      category,
      location,
      date,
      description,
    } = body;

    if (
      !itemType ||
      !itemName ||
      !category ||
      !location ||
      !date ||
      !description
    ) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const [result] = await pool.execute(
      `INSERT INTO items
      (item_type, item_name, category, location, item_date, description)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        itemType,
        itemName,
        category,
        location,
        date,
        description,
      ]
    );

    return NextResponse.json(
      {
        message: "Item reported successfully",
        result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST error:", error);

    return NextResponse.json(
      { message: "Failed to create item" },
      { status: 500 }
    );
  }
}