import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";

const SESSION_COOKIE = "hoichoi_session";
const SESSION_DURATION_MS = 12 * 60 * 60 * 1000;

function base64Url(value: string) {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret)
    .update(payload)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function safeEqualText(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);

  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  try {
    const { username, password } = (await request.json()) as {
      username?: string;
      password?: string;
    };

    const configuredUsername = process.env.ADMIN_USERNAME;
    const configuredPassword = process.env.ADMIN_PASSWORD;
    const secret = process.env.AUTH_SECRET;

    if (!configuredUsername || !configuredPassword || !secret) {
      return NextResponse.json(
        { error: "Authentication is not configured on the server." },
        { status: 500 },
      );
    }

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !safeEqualText(username, configuredUsername) ||
      !safeEqualText(password, configuredPassword)
    ) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 },
      );
    }

    const payload = base64Url(
      JSON.stringify({
        username: configuredUsername,
        exp: Date.now() + SESSION_DURATION_MS,
      }),
    );

    const token = `${payload}.${sign(payload, secret)}`;

    const response = NextResponse.json({ ok: true });

    response.cookies.set({
      name: SESSION_COOKIE,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DURATION_MS / 1000,
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Invalid login request." },
      { status: 400 },
    );
  }
}
