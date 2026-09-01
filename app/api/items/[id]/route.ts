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

    if (Number.isNaN(itemId)) {
      return NextResponse.json(
        { message: "Invalid item ID" },
        { status: 400 }
      );
    }

    const [rows] = await pool.execute(
      "SELECT * FROM items WHERE id = ?",
      [itemId]
    );

    const items = rows as any[];

    if (items.length === 0) {
      return NextResponse.json(
        { message: "Item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(items[0]);
  } catch (error) {
    console.error("GET item error:", error);

    return NextResponse.json(
      { message: "Failed to fetch item" },
      { status: 500 }
    );
  }
}