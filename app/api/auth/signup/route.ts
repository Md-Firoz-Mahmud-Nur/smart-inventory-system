/* eslint-disable @typescript-eslint/no-explicit-any */
import { SignupSchema } from "@/lib/validators";
import { NextRequest, NextResponse } from "next/server";
import { authService } from "../auth.service";

export async function POST(request: NextRequest) {
  try {

    console.log(request);

    const body = await request.json();

    console.log(body);

    // Validate input
    const validatedData = SignupSchema.parse(body);

    // Sign up user
    const user = await authService.signup(validatedData);

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        user,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("[Signup Error]", error);

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
        message: error.message || "Signup failed",
      },
      { status: 400 },
    );
  }
}
