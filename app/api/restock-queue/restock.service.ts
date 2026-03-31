/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '@/lib/db';
import { CreateRestockInput } from '@/lib/validators';

export const restockService = {
  async getRestockQueue(userId: string, filters?: { status?: string; priority?: string }) {
    const queue = await prisma.restockQueue.findMany({
      where: {
        userId,
        ...(filters?.status && { status: filters.status as any }),
        ...(filters?.priority && { priority: filters.priority as any }),
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            stock: true,
            price: true,
          },
        },
      },
      orderBy: [
        {
          priority: {
            sort: 'desc',
            nulls: 'last',
          },
        },
        { createdAt: 'asc' },
      ],
    });

    return queue;
  },

  async addToRestockQueue(userId: string, input: CreateRestockInput) {
    // Verify product exists and belongs to user
    const product = await prisma.product.findUnique({
      where: { id: input.productId },
    });

    if (!product || product.userId !== userId) {
      throw new Error('Product not found or unauthorized');
    }

    // Upsert restock queue entry
    const entry = await prisma.restockQueue.upsert({
      where: {
        userId_productId: {
          userId,
          productId: input.productId,
        },
      },
      update: {
        status: 'pending',
        priority: input.priority || 'medium',
      },
      create: {
        userId,
        productId: input.productId,
        status: 'pending',
        priority: input.priority || 'medium',
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            stock: true,
            price: true,
          },
        },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        actionType: 'RESTOCK_QUEUED',
        targetId: input.productId,
        targetType: 'STOCK',
        metadata: {
          priority: input.priority || 'medium',
          currentStock: product.stock,
        },
      },
    });

    return entry;
  },

  async removeFromRestockQueue(userId: string, queueId: string) {
    const entry = await prisma.restockQueue.findUnique({
      where: { id: queueId },
    });

    if (!entry || entry.userId !== userId) {
      throw new Error('Queue entry not found or unauthorized');
    }

    await prisma.restockQueue.delete({
      where: { id: queueId },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        actionType: 'RESTOCK_REMOVED',
        targetId: entry.productId,
        targetType: 'STOCK',
        metadata: {
          queueId: queueId,
        },
      },
    });

    return { success: true };
  },

  async updateRestockStatus(userId: string, queueId: string, status: string) {
    const entry = await prisma.restockQueue.findUnique({
      where: { id: queueId },
    });

    if (!entry || entry.userId !== userId) {
      throw new Error('Queue entry not found or unauthorized');
    }

    const updated = await prisma.restockQueue.update({
      where: { id: queueId },
      data: {
        status: status as any,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            stock: true,
          },
        },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        actionType: 'STOCK_UPDATED',
        targetId: entry.productId,
        targetType: 'STOCK',
        metadata: {
          previousStatus: entry.status,
          newStatus: status,
        },
      },
    });

    return updated;
  },
};
