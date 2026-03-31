/* eslint-disable @typescript-eslint/no-explicit-any */
import { getUserFromToken } from "@/lib/auth";
import { CreateProductSchema } from "@/lib/validators";
import { NextRequest, NextResponse } from "next/server";
import { productService } from "./product.service";

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const categoryId = searchParams.get("categoryId");

    const products = await productService.getProducts(user.userId, {
      status: status || undefined,
      categoryId: categoryId || undefined,
    });

    return NextResponse.json(
      {
        success: true,
        data: products,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("[Get Products Error]", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch products",
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
    const validatedData = CreateProductSchema.parse(body);

    // Create product
    const product = await productService.createProduct(
      user.userId,
      validatedData,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        data: product,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("[Create Product Error]", error);

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
        message: error.message || "Failed to create product",
      },
      { status: 400 },
    );
  }
}
