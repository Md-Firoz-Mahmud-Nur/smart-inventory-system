"use server";

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRY = "7d";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export async function generateToken(
  userId: string,
  email: string,
): Promise<string> {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function setAuthCookie(
  userId: string,
  email: string,
): Promise<void> {
  const cookieStore = await cookies();
  const token = await generateToken(userId, email);

  cookieStore.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("auth-token");
}

export async function getAuthToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token");
    return token?.value || null;
  } catch (error) {
    return null;
  }
}

export async function getUserFromToken(): Promise<JWTPayload | null> {
  try {
    const token = await getAuthToken();
    if (!token) return null;

    return await verifyToken(token);
  } catch (error) {
    return null;
  }
}
