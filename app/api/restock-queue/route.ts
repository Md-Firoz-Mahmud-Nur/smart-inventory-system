import { prisma } from "@/lib/db";
import { verifyAuth } from "@/lib/middleware";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const priority = searchParams.get("priority");

    const where: any = {
      product: { userId: user.id },
    };
    if (priority) where.priority = priority;

    const queue = await prisma.restockQueue.findMany({
      where,
      include: { product: { include: { category: true } } },
      orderBy: [
        { priority: "asc" }, // High priority first
        { product: { stock: "asc" } }, // Lowest stock first
      ],
    });

    return NextResponse.json(queue);
  } catch (error) {
    console.error("Get restock queue error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
