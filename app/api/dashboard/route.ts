import { prisma } from "@/lib/db";
import { verifyAuth } from "@/lib/middleware";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Total orders today
    const ordersToday = await prisma.order.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // Pending vs completed orders
    const pendingOrders = await prisma.order.count({
      where: {
        userId: user.id,
        status: "Pending",
      },
    });

    const completedOrders = await prisma.order.count({
      where: {
        userId: user.id,
        status: { in: ["Confirmed", "Shipped", "Delivered"] },
      },
    });

    // Revenue today
    const revenueToday = await prisma.order.aggregate({
      where: {
        userId: user.id,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      _sum: { totalPrice: true },
    });

    // Low stock items count
    const lowStockProducts = await prisma.product.findMany({
      where: {
        userId: user.id,
      },
      select: { stock: true, minimumStockThreshold: true },
    });

    const lowStockCount = lowStockProducts.filter(
      (p) => p.stock > 0 && p.stock < p.minimumStockThreshold
    ).length;

    // Product summary with status
    const products = await prisma.product.findMany({
      where: { userId: user.id },
      include: { category: true, restockQueue: true },
      orderBy: { stock: "asc" },
      take: 10,
    });

    const productSummary = products.map((p) => ({
      id: p.id,
      name: p.name,
      stock: p.stock,
      status: p.status,
      category: p.category.name,
      threshold: p.minimumStockThreshold,
      isLowStock: p.stock < p.minimumStockThreshold,
      inRestockQueue: !!p.restockQueue,
    }));

    // Recent orders
    const recentOrders = await prisma.order.findMany({
      where: { userId: user.id },
      include: { orderItems: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return NextResponse.json({
      metrics: {
        ordersToday,
        pendingOrders,
        completedOrders,
        revenueToday: revenueToday._sum.totalPrice || 0,
        lowStockCount,
      },
      productSummary,
      recentOrders,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
