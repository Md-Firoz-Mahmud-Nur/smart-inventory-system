/* eslint-disable @typescript-eslint/no-explicit-any */
import { getUserFromToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { activityService } from "./activity.service";

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
    const actionType = searchParams.get("actionType");
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : undefined;
    const targetId = searchParams.get("targetId");

    let logs;
    if (targetId) {
      logs = await activityService.getActivityLogByTarget(
        user.userId,
        targetId,
      );
    } else {
      logs = await activityService.getActivityLog(user.userId, {
        actionType: actionType || undefined,
        limit,
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: logs,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("[Get Activity Log Error]", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch activity log",
      },
      { status: 500 },
    );
  }
}
