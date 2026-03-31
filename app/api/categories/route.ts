/* eslint-disable @typescript-eslint/no-explicit-any */
import { getUserFromToken } from "@/lib/auth";
import { CreateCategorySchema } from "@/lib/validators";
import { NextRequest, NextResponse } from "next/server";
import { categoryService } from "./category.service";

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const categories = await categoryService.getCategories(user.userId);

    return NextResponse.json(
      {
        success: true,
        data: categories,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("[Get Categories Error]", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch categories",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();

    // Validate input
    const validatedData = CreateCategorySchema.parse(body);

    // Create category
    const category = await categoryService.createCategory(
      user.userId,
      validatedData,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Category created successfully",
        data: category,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("[Create Category Error]", error);

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
        message: error.message || "Failed to create category",
      },
      { status: 400 },
    );
  }
}
