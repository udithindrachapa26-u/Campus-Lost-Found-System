import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUri = `${appUrl}/api/auth/google/callback`;

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  // ── Google denied access ─────────────────────────────────────────────────
  if (error) {
    return NextResponse.redirect(`${appUrl}/login?error=google_denied`);
  }

  if (!code) {
    return NextResponse.redirect(`${appUrl}/login?error=missing_code`);
  }

  try {
    // ── 1. Exchange code for tokens ────────────────────────────────────────
    const tokenResponse = await fetch(
      "https://oauth2.googleapis.com/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      }
    );

    if (!tokenResponse.ok) {
      console.error("Token exchange failed:", await tokenResponse.text());
      return NextResponse.redirect(`${appUrl}/login?error=token_exchange`);
    }

    const tokens = await tokenResponse.json();

    // ── 2. Fetch user info from Google ─────────────────────────────────────
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      }
    );

    if (!userInfoResponse.ok) {
      console.error("Userinfo fetch failed:", await userInfoResponse.text());
      return NextResponse.redirect(`${appUrl}/login?error=userinfo`);
    }

    const googleUser = await userInfoResponse.json();
    const { id: googleId, email, name } = googleUser;

    if (!email) {
      return NextResponse.redirect(`${appUrl}/login?error=no_email`);
    }

    // ── 3. Upsert user in database ─────────────────────────────────────────
    // Try to find existing user by google_id first, then by email
    const [byGoogleId] = await pool.execute(
      "SELECT id, name, email FROM users WHERE google_id = ?",
      [googleId]
    );
    let users = byGoogleId as any[];

    if (users.length === 0) {
      // Check by email (user may have registered with email/password before)
      const [byEmail] = await pool.execute(
        "SELECT id, name, email FROM users WHERE email = ?",
        [email.toLowerCase()]
      );
      users = byEmail as any[];

      if (users.length > 0) {
        // Link google_id to existing account
        await pool.execute(
          "UPDATE users SET google_id = ? WHERE id = ?",
          [googleId, users[0].id]
        );
      } else {
        // Create a brand-new Google-only user (no password)
        const [result] = await pool.execute(
          `INSERT INTO users (name, email, google_id, phone, password)
           VALUES (?, ?, ?, NULL, NULL)`,
          [name || email.split("@")[0], email.toLowerCase(), googleId]
        );
        const insertResult = result as any;

        // Fetch the newly created user
        const [newUser] = await pool.execute(
          "SELECT id, name, email FROM users WHERE id = ?",
          [insertResult.insertId]
        );
        users = newUser as any[];
      }
    }

    const user = users[0];

    // ── 4. Set session cookie (same pattern as email/password login) ───────
    const response = NextResponse.redirect(`${appUrl}/dashboard`);

    response.cookies.set("user_id", String(user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;

  } catch (err) {
    console.error("Google OAuth callback error:", err);
    return NextResponse.redirect(`${appUrl}/login?error=server`);
  }
}
