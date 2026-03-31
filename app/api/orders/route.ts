/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/auth";
import { orderService } from "./order.service";
import { CreateOrderSchema } from "@/lib/validators";

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

    const orders = await orderService.getOrders(user.userId, {
      status: status || undefined,
    });

    return NextResponse.json(
      {
        success: true,
        data: orders,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("[Get Orders Error]", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch orders",
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
    const validatedData = CreateOrderSchema.parse(body);

    // Create order with transaction
    const order = await orderService.createOrder(user.userId, validatedData);

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully",
        data: order,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("[Create Order Error]", error);

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
        message: error.message || "Failed to create order",
      },
      { status: 400 },
    );
  }
}
