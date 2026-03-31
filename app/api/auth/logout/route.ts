/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { authService } from "../auth.service";

export async function POST(request: NextRequest) {
  try {
    await authService.logout();

    return NextResponse.json(
      {
        success: true,
        message: "Logged out successfully",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("[Logout Error]", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Logout failed",
      },
      { status: 400 },
    );
  }
}
