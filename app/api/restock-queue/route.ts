/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/auth";
import { restockService } from "./restock.service";
import { CreateRestockSchema } from "@/lib/validators";

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
    const priority = searchParams.get("priority");

    const queue = await restockService.getRestockQueue(user.userId, {
      status: status || undefined,
      priority: priority || undefined,
    });

    return NextResponse.json(
      {
        success: true,
        data: queue,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("[Get Restock Queue Error]", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch restock queue",
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
    const validatedData = CreateRestockSchema.parse(body);

    // Add to restock queue
    const entry = await restockService.addToRestockQueue(
      user.userId,
      validatedData,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Added to restock queue",
        data: entry,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("[Add to Restock Queue Error]", error);

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
        message: error.message || "Failed to add to restock queue",
      },
      { status: 400 },
    );
  }
}
