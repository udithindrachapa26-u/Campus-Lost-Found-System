import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";

// ======================================
// GET - Get items
// ======================================

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
          OR description LIKE ?
        )
      `;

      const searchValue = `%${search}%`;

      values.push(
        searchValue,
        searchValue,
        searchValue,
        searchValue
      );
    }

    // Lost / Found filter
    if (
      type === "Lost" ||
      type === "Found"
    ) {
      query += ` AND item_type = ?`;
      values.push(type);
    }

    // Category filter
    if (category) {
      query += ` AND category = ?`;
      values.push(category);
    }

    query += ` ORDER BY created_at DESC`;

    const [rows] = await pool.execute(
      query,
      values
    );

    return NextResponse.json(rows);

  } catch (error) {
    console.error(
      "GET items error:",
      error
    );

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


// ======================================
// POST - Create item
// ======================================

export async function POST(request: Request) {
  try {

    // -------------------------------
    // Get logged-in user
    // -------------------------------

    const cookieStore = await cookies();

    const userId =
      cookieStore.get("user_id")?.value;

    // User not logged in
    if (!userId) {
      return NextResponse.json(
        {
          message:
            "Please login before reporting an item",
        },
        {
          status: 401,
        }
      );
    }

    // Validate user ID
    const numericUserId =
      Number(userId);

    if (
      !Number.isInteger(numericUserId) ||
      numericUserId <= 0
    ) {
      return NextResponse.json(
        {
          message: "Invalid user session",
        },
        {
          status: 401,
        }
      );
    }

    // -------------------------------
    // Get form data
    // -------------------------------

    const body =
      await request.json();

    const {
      itemType,
      itemName,
      category,
      location,
      date,
      description,
    } = body;

    // -------------------------------
    // Validate fields
    // -------------------------------

    if (
      !itemType ||
      !itemName ||
      !category ||
      !location ||
      !date ||
      !description
    ) {
      return NextResponse.json(
        {
          message:
            "All fields are required",
        },
        {
          status: 400,
        }
      );
    }

    // Validate item type
    if (
      itemType !== "Lost" &&
      itemType !== "Found"
    ) {
      return NextResponse.json(
        {
          message:
            "Item type must be Lost or Found",
        },
        {
          status: 400,
        }
      );
    }

    // -------------------------------
    // Insert into database
    // -------------------------------

    const [result] =
      await pool.execute(
        `
        INSERT INTO items
        (
          user_id,
          item_type,
          item_name,
          category,
          location,
          item_date,
          description
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          numericUserId,
          itemType,
          itemName.trim(),
          category,
          location.trim(),
          date,
          description.trim(),
        ]
      );

    const insertResult =
      result as {
        insertId: number;
      };

    // -------------------------------
    // Response
    // -------------------------------

    return NextResponse.json(
      {
        message:
          "Item reported successfully",

        itemId:
          insertResult.insertId,
      },
      {
        status: 201,
      }
    );

  } catch (error) {

    console.error(
      "POST items error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to create item",
      },
      {
        status: 500,
      }
    );
  }
}