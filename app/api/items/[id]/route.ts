import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

// GET - Single Item
export async function GET(
  request: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const itemId = Number(id);

    if (Number.isNaN(itemId) || itemId <= 0) {
      return NextResponse.json(
        { message: "Invalid item ID" },
        { status: 400 }
      );
    }

    const [rows] = await pool.execute(
      `
      SELECT
        items.id,
        items.user_id,
        items.item_type,
        items.item_name,
        items.category,
        items.location,
        items.item_date,
        items.description,
        items.image_url,
        items.status,
        items.created_at,

        users.name AS reporter_name,
        users.email AS reporter_email,
        users.phone AS reporter_phone

      FROM items
      LEFT JOIN users ON items.user_id = users.id
      WHERE items.id = ?
      `,
      [itemId]
    );

    const items = rows as any[];

    if (items.length === 0) {
      return NextResponse.json(
        { message: "Item not found" },
        { status: 404 }
      );
    }

    const item = items[0];

    const formattedItem = {
      ...item,
      item_date:
        item.item_date instanceof Date
          ? item.item_date.toISOString().split("T")[0]
          : String(item.item_date),
      created_at:
        item.created_at instanceof Date
          ? item.created_at.toISOString()
          : String(item.created_at),
    };

    return NextResponse.json(formattedItem);

  } catch (error) {
    console.error("GET item error:", error);
    return NextResponse.json(
      { message: "Failed to fetch item" },
      { status: 500 }
    );
  }
}

// PUT - Update item
export async function PUT(
  request: Request,
  { params }: RouteParams
) {
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
    const { id } = await params;
    const itemId = Number(id);

    if (Number.isNaN(itemId) || itemId <= 0) {
      return NextResponse.json(
        { message: "Invalid item ID" },
        { status: 400 }
      );
    }

    const [existingRows] = await pool.execute(
      "SELECT user_id FROM items WHERE id = ?",
      [itemId]
    );
    const existingItems = existingRows as any[];

    if (existingItems.length === 0) {
      return NextResponse.json(
        { message: "Item not found" },
        { status: 404 }
      );
    }

    if (existingItems[0].user_id !== numericUserId) {
      return NextResponse.json(
        { message: "You are not authorized to update this item" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { itemType, itemName, category, location, date, description, imageUrl, status } = body;

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

    const itemStatus = status === "Returned" ? "Returned" : "Active";

    await pool.execute(
      `
      UPDATE items
      SET item_type = ?,
          item_name = ?,
          category = ?,
          location = ?,
          item_date = ?,
          description = ?,
          image_url = ?,
          status = ?
      WHERE id = ? AND user_id = ?
      `,
      [
        itemType,
        itemName.trim(),
        category,
        location.trim(),
        date,
        description.trim(),
        imageUrl !== undefined ? imageUrl : null,
        itemStatus,
        itemId,
        numericUserId,
      ]
    );

    return NextResponse.json({
      message: "Item updated successfully",
    });

  } catch (error) {
    console.error("PUT item error:", error);
    return NextResponse.json(
      { message: "Failed to update item" },
      { status: 500 }
    );
  }
}

// DELETE - Delete item
export async function DELETE(
  request: Request,
  { params }: RouteParams
) {
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
    const { id } = await params;
    const itemId = Number(id);

    if (Number.isNaN(itemId) || itemId <= 0) {
      return NextResponse.json(
        { message: "Invalid item ID" },
        { status: 400 }
      );
    }

    const [existingRows] = await pool.execute(
      "SELECT user_id FROM items WHERE id = ?",
      [itemId]
    );
    const existingItems = existingRows as any[];

    if (existingItems.length === 0) {
      return NextResponse.json(
        { message: "Item not found" },
        { status: 404 }
      );
    }

    if (existingItems[0].user_id !== numericUserId) {
      return NextResponse.json(
        { message: "You are not authorized to delete this item" },
        { status: 403 }
      );
    }

    await pool.execute(
      "DELETE FROM items WHERE id = ? AND user_id = ?",
      [itemId, numericUserId]
    );

    return NextResponse.json({
      message: "Item deleted successfully",
    });

  } catch (error) {
    console.error("DELETE item error:", error);
    return NextResponse.json(
      { message: "Failed to delete item" },
      { status: 500 }
    );
  }
}
