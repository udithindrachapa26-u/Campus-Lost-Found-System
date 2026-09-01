import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import pool from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      name,
      email,
      phone,
      password,
    } = body;


    // ==========================================
    // CHECK REQUIRED FIELDS
    // ==========================================

    if (
      !name ||
      !email ||
      !phone ||
      !password
    ) {
      return NextResponse.json(
        {
          message:
            "Name, email, phone and password are required",
        },
        {
          status: 400,
        }
      );
    }


    // ==========================================
    // CLEAN INPUT
    // ==========================================

    const cleanName = name.trim();
    const cleanEmail =
      email.trim().toLowerCase();
    const cleanPhone =
      phone.trim();


    // ==========================================
    // VALIDATE NAME
    // ==========================================

    if (cleanName.length < 2) {
      return NextResponse.json(
        {
          message:
            "Name must contain at least 2 characters",
        },
        {
          status: 400,
        }
      );
    }


    // ==========================================
    // VALIDATE EMAIL
    // ==========================================

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        {
          message:
            "Please enter a valid email address",
        },
        {
          status: 400,
        }
      );
    }


    // ==========================================
    // VALIDATE PHONE
    // ==========================================

    const phoneRegex =
      /^[0-9]{10}$/;

    if (!phoneRegex.test(cleanPhone)) {
      return NextResponse.json(
        {
          message:
            "Phone number must contain exactly 10 digits",
        },
        {
          status: 400,
        }
      );
    }


    // ==========================================
    // PASSWORD VALIDATION
    // ==========================================

    if (password.length < 6) {
      return NextResponse.json(
        {
          message:
            "Password must contain at least 6 characters",
        },
        {
          status: 400,
        }
      );
    }


    // ==========================================
    // CHECK EMAIL
    // ==========================================

    const [existingUsers] =
      await pool.execute(
        `
        SELECT id
        FROM users
        WHERE email = ?
        `,
        [cleanEmail]
      );

    const users =
      existingUsers as any[];


    if (users.length > 0) {
      return NextResponse.json(
        {
          message:
            "Email already registered",
        },
        {
          status: 409,
        }
      );
    }


    // ==========================================
    // CHECK PHONE
    // ==========================================

    const [existingPhones] =
      await pool.execute(
        `
        SELECT id
        FROM users
        WHERE phone = ?
        `,
        [cleanPhone]
      );

    const phones =
      existingPhones as any[];


    if (phones.length > 0) {
      return NextResponse.json(
        {
          message:
            "Phone number already registered",
        },
        {
          status: 409,
        }
      );
    }


    // ==========================================
    // HASH PASSWORD
    // ==========================================

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );


    // ==========================================
    // INSERT USER
    // ==========================================

    const [result] =
      await pool.execute(
        `
        INSERT INTO users
        (
          name,
          email,
          phone,
          password
        )
        VALUES (?, ?, ?, ?)
        `,
        [
          cleanName,
          cleanEmail,
          cleanPhone,
          hashedPassword,
        ]
      );


    const insertResult =
      result as any;


    // ==========================================
    // SUCCESS
    // ==========================================

    return NextResponse.json(
      {
        message:
          "Registration successful",

        userId:
          insertResult.insertId,
      },
      {
        status: 201,
      }
    );


  } catch (error) {

    console.error(
      "Registration error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Something went wrong during registration",
      },
      {
        status: 500,
      }
    );
  }
}