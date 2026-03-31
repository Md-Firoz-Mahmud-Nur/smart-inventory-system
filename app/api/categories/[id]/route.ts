/* eslint-disable @typescript-eslint/no-explicit-any */
import { getUserFromToken } from "@/lib/auth";
import { UpdateCategorySchema } from "@/lib/validators";
import { NextRequest, NextResponse } from "next/server";
import { categoryService } from "../category.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getUserFromToken();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;
    const category = await categoryService.getCategoryById(user.userId, id);

    return NextResponse.json(
      {
        success: true,
        data: category,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("[Get Category Error]", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Category not found",
      },
      { status: error.message?.includes("unauthorized") ? 403 : 404 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getUserFromToken();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validatedData = UpdateCategorySchema.parse(body);

    // Update category
    const category = await categoryService.updateCategory(
      user.userId,
      id,
      validatedData,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Category updated successfully",
        data: category,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("[Update Category Error]", error);

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
        message: error.message || "Failed to update category",
      },
      { status: error.message?.includes("unauthorized") ? 403 : 400 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getUserFromToken();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;
    await categoryService.deleteCategory(user.userId, id);

    return NextResponse.json(
      {
        success: true,
        message: "Category deleted successfully",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("[Delete Category Error]", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to delete category",
      },
      { status: error.message?.includes("unauthorized") ? 403 : 400 },
    );
  }
}
