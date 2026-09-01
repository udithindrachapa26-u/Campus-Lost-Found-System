import { NextResponse } from "next/server";
import pool from "@/lib/db";

/*export async function GET() {
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
}*/

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const category = searchParams.get("category") || "";

    let query = `
      SELECT *
      FROM items
      WHERE 1 = 1
    `;

    const values: string[] = [];

    // Search
    if (search) {
      query += `
        AND (
          item_name LIKE ?
          OR category LIKE ?
          OR location LIKE ?
        )
      `;

      const searchValue = `%${search}%`;

      values.push(
        searchValue,
        searchValue,
        searchValue
      );
    }

    // Lost / Found filter
    if (type && (type === "Lost" || type === "Found")) {
      query += ` AND item_type = ?`;
      values.push(type);
    }

    // Category filter
    if (category) {
      query += ` AND category = ?`;
      values.push(category);
    }

    query += ` ORDER BY created_at DESC`;

    const [rows] = await pool.execute(query, values);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET items error:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch items",
      },
      {
        status: 500,
      }
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