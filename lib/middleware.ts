import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./auth";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export async function verifyAuth(req: NextRequest): Promise<AuthUser | null> {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) return null;

    const decoded = verifyToken(token);

    if (!decoded) return null;

    return {
      id: decoded.userId, // ✅ map correctly
      email: decoded.email || "",
      name: decoded.name || "",
    };
  } catch (error) {
    console.error("Auth verification error:", error);
    return null;
  }
}

export function withAuth(
  handler: (req: NextRequest, context: any) => Promise<NextResponse>,
) {
  return async (req: NextRequest, context: any) => {
    try {
      const token = req.cookies.get("auth_token")?.value;

      if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }

      (context as any).userId = decoded.userId;
      return handler(req, context);
    } catch (error) {
      console.error("Auth middleware error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  };
}

export function getUserIdFromRequest(req: NextRequest): string | null {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  return decoded?.userId || null;
}
