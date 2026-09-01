import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import pool from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { email, password } = body;

    // Check required fields
    if (!email || !password) {
      return NextResponse.json(
        {
          message: "Email and password are required",
        },
        {
          status: 400,
        }
      );
    }

    // Find user by email
    const [rows] = await pool.execute(
      "SELECT id, name, email, password FROM users WHERE email = ?",
      [email]
    );

    const users = rows as any[];

    // User not found
    if (users.length === 0) {
      return NextResponse.json(
        {
          message: "Invalid email or password",
        },
        {
          status: 401,
        }
      );
    }

    const user = users[0];

    // Compare password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return NextResponse.json(
        {
          message: "Invalid email or password",
        },
        {
          status: 401,
        }
      );
    }

    // Create response
    const response = NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      {
        status: 200,
      }
    );

    // Create login cookie
    response.cookies.set("user_id", String(user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;

  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        message: "Something went wrong during login",
      },
      {
        status: 500,
      }
    );
  }
}