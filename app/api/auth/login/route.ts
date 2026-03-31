/* eslint-disable @typescript-eslint/no-explicit-any */
import { LoginSchema } from "@/lib/validators";
import { NextRequest, NextResponse } from "next/server";
import { authService } from "../auth.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = LoginSchema.parse(body);

    // Login user
    const user = await authService.login(validatedData);

    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        user,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("[Login Error]", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Login failed",
      },
      { status: 401 },
    );
  }
}
