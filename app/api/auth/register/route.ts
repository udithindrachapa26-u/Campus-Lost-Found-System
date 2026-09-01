import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import pool from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      name,
      email,
      password,
    } = body;

    // Check required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        {
          message: "Name, email and password are required",
        },
        {
          status: 400,
        }
      );
    }

    // Basic password validation
    if (password.length < 6) {
      return NextResponse.json(
        {
          message: "Password must contain at least 6 characters",
        },
        {
          status: 400,
        }
      );
    }

    // Check whether email already exists
    const [existingUsers] = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    const users = existingUsers as any[];

    if (users.length > 0) {
      return NextResponse.json(
        {
          message: "Email already registered",
        },
        {
          status: 409,
        }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // Insert user
    const [result] = await pool.execute(
      `
      INSERT INTO users
      (name, email, password)
      VALUES (?, ?, ?)
      `,
      [
        name,
        email,
        hashedPassword,
      ]
    );

    const insertResult = result as any;

    return NextResponse.json(
      {
        message: "Registration successful",
        userId: insertResult.insertId,
      },
      {
        status: 201,
      }
    );

  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json(
      {
        message: "Something went wrong during registration",
      },
      {
        status: 500,
      }
    );
  }
}