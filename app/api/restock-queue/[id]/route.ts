/* eslint-disable @typescript-eslint/no-explicit-any */
import { getUserFromToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { restockService } from "../restock.service";

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
    await restockService.removeFromRestockQueue(user.userId, id);

    return NextResponse.json(
      {
        success: true,
        message: "Removed from restock queue",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("[Remove from Queue Error]", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to remove from queue",
      },
      { status: error.message?.includes("unauthorized") ? 403 : 400 },
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
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, message: "Status is required" },
        { status: 400 },
      );
    }

    const updated = await restockService.updateRestockStatus(
      user.userId,
      id,
      status,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Restock status updated",
        data: updated,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("[Update Restock Status Error]", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update restock status",
      },
      { status: error.message?.includes("unauthorized") ? 403 : 400 },
    );
  }
}
