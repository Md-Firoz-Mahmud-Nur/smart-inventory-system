/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/auth";
import { orderService } from "../order.service";
import { UpdateOrderStatusSchema } from "@/lib/validators";

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
    const order = await orderService.getOrderById(user.userId, id);

    return NextResponse.json(
      {
        success: true,
        data: order,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("[Get Order Error]", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Order not found",
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
    const validatedData = UpdateOrderStatusSchema.parse(body);

    // Update order status
    const order = await orderService.updateOrderStatus(
      user.userId,
      id,
      validatedData,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Order status updated successfully",
        data: order,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("[Update Order Error]", error);

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
        message: error.message || "Failed to update order",
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
    const order = await orderService.cancelOrder(user.userId, id);

    return NextResponse.json(
      {
        success: true,
        message: "Order cancelled successfully",
        data: order,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("[Cancel Order Error]", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to cancel order",
      },
      { status: error.message?.includes("unauthorized") ? 403 : 400 },
    );
  }
}
