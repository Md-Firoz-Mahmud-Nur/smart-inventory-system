/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/auth";
import { productService } from "../product.service";
import { UpdateProductSchema } from "@/lib/validators";

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
    const product = await productService.getProductById(user.userId, id);

    return NextResponse.json(
      {
        success: true,
        data: product,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("[Get Product Error]", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Product not found",
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
    const validatedData = UpdateProductSchema.parse(body);

    // Update product
    const product = await productService.updateProduct(
      user.userId,
      id,
      validatedData,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Product updated successfully",
        data: product,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("[Update Product Error]", error);

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
        message: error.message || "Failed to update product",
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
    await productService.deleteProduct(user.userId, id);

    return NextResponse.json(
      {
        success: true,
        message: "Product deleted successfully",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("[Delete Product Error]", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to delete product",
      },
      { status: error.message?.includes("unauthorized") ? 403 : 400 },
    );
  }
}
