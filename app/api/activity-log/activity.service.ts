/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/db";

export const activityService = {
  async getActivityLog(
    userId: string,
    filters?: { actionType?: string; limit?: number },
  ) {
    const limit = filters?.limit || 50;

    const logs = await prisma.activityLog.findMany({
      where: {
        userId,
        ...(filters?.actionType && { actionType: filters.actionType as any }),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return logs;
  },

  async getActivityLogByTarget(userId: string, targetId: string) {
    const logs = await prisma.activityLog.findMany({
      where: {
        userId,
        targetId,
      },
      orderBy: { createdAt: "desc" },
    });

    return logs;
  },

  async getActivityStats(userId: string) {
    const [totalOrders, totalProducts, recentActivity] = await Promise.all([
      prisma.order.count({
        where: { userId },
      }),
      prisma.product.count({
        where: { userId },
      }),
      prisma.activityLog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    return {
      totalOrders,
      totalProducts,
      recentActivity,
    };
  },
};
