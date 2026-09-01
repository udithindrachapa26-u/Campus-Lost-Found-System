import { NextResponse } from "next/server";
import pool from "@/lib/db";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    const itemId = Number(id);

    if (
      Number.isNaN(itemId) ||
      itemId <= 0
    ) {
      return NextResponse.json(
        {
          message: "Invalid item ID",
        },
        {
          status: 400,
        }
      );
    }

    // Get item and reporter details
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
        items.status,
        items.created_at,

        users.name AS reporter_name,
        users.email AS reporter_email,
        users.phone AS reporter_phone

      FROM items

      LEFT JOIN users
        ON items.user_id = users.id

      WHERE items.id = ?
      `,
      [itemId]
    );

    const items = rows as any[];

    if (items.length === 0) {
      return NextResponse.json(
        {
          message: "Item not found",
        },
        {
          status: 404,
        }
      );
    }

    const item = items[0];

    // Convert MySQL Date objects to strings
    const formattedItem = {
      ...item,

      item_date:
        item.item_date instanceof Date
          ? item.item_date
              .toISOString()
              .split("T")[0]
          : String(item.item_date),

      created_at:
        item.created_at instanceof Date
          ? item.created_at.toISOString()
          : String(item.created_at),
    };

    return NextResponse.json(
      formattedItem
    );

  } catch (error) {
    console.error(
      "GET item error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to fetch item",
      },
      {
        status: 500,
      }
    );
  }
}