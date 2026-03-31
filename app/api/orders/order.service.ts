/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/db";
import { CreateOrderInput, UpdateOrderStatusInput } from "@/lib/validators";

export const orderService = {
  async createOrder(userId: string, input: CreateOrderInput) {
    // Use transaction to prevent race conditions
    const result = await prisma.$transaction(
      async (tx: any) => {
        // 1. Fetch all products with stock check
        const products = await Promise.all(
          input.items.map(async (item) => {
            const product = await tx.product.findUnique({
              where: { id: item.productId },
            });

            if (!product) {
              throw new Error(`Product ${item.productId} not found`);
            }

            if (product.userId !== userId) {
              throw new Error("Unauthorized access to product");
            }

            return product;
          }),
        );

        // 2. Verify stock availability for all items
        const stockCheck = input.items.map((item, index) => {
          const product = products[index];
          if (product.stock < item.quantity) {
            throw new Error(
              `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
            );
          }
          return { product, item };
        });

        // 3. Create order
        const order = await tx.order.create({
          data: {
            userId,
            status: "pending",
            totalAmount: input.items.reduce((sum, item, index) => {
              return sum + products[index].price * item.quantity;
            }, 0),
          },
        });

        // 4. Create order items and deduct stock
        const orderItems = await Promise.all(
          input.items.map(async (item, index) => {
            const product = products[index];

            // Deduct stock atomically
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: { decrement: item.quantity },
              },
            });

            // Create order item
            return tx.orderItem.create({
              data: {
                orderId: order.id,
                productId: item.productId,
                quantity: item.quantity,
                price: product.price,
              },
            });
          }),
        );

        // 5. Create restock queue entries if stock is low
        await Promise.all(
          input.items.map(async (item, index) => {
            const product = products[index];
            const newStock = product.stock - item.quantity;

            if (newStock < 10) {
              // Threshold is 10
              await tx.restockQueue.upsert({
                where: {
                  userId_productId: {
                    userId,
                    productId: item.productId,
                  },
                },
                update: {
                  status: "pending",
                  priority:
                    newStock === 0 ? "high" : newStock < 5 ? "medium" : "low",
                },
                create: {
                  userId,
                  productId: item.productId,
                  status: "pending",
                  priority:
                    newStock === 0 ? "high" : newStock < 5 ? "medium" : "low",
                },
              });
            }
          }),
        );

        // 6. Log activity
        await tx.activityLog.create({
          data: {
            userId,
            actionType: "ORDER_CREATED",
            targetId: order.id,
            targetType: "ORDER",
            metadata: {
              items: input.items,
              totalAmount: order.totalAmount,
            },
          },
        });

        return order;
      },
      {
        timeout: 10000, // 10 second timeout
      },
    );

    return result;
  },

  async getOrders(userId: string, filters?: { status?: string }) {
    const orders = await prisma.order.findMany({
      where: {
        userId,
        ...(filters?.status && { status: filters.status as any }),
      },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, price: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return orders;
  },

  async getOrderById(userId: string, orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, price: true, sku: true },
            },
          },
        },
      },
    });

    if (!order || order.userId !== userId) {
      throw new Error("Order not found or unauthorized");
    }

    return order;
  },

  async updateOrderStatus(
    userId: string,
    orderId: string,
    input: UpdateOrderStatusInput,
  ) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.userId !== userId) {
      throw new Error("Order not found or unauthorized");
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: input.status,
      },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, price: true } },
          },
        },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        actionType: "ORDER_CONFIRMED",
        targetId: orderId,
        targetType: "ORDER",
        metadata: {
          previousStatus: order.status,
          newStatus: input.status,
        },
      },
    });

    return updatedOrder;
  },

  async cancelOrder(userId: string, orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order || order.userId !== userId) {
      throw new Error("Order not found or unauthorized");
    }

    if (order.status !== "pending") {
      throw new Error("Can only cancel pending orders");
    }

    // Use transaction to restore stock
    const result = await prisma.$transaction(async (tx: any) => {
      // Restore stock for each item
      await Promise.all(
        order.items.map((item: any) =>
          tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { increment: item.quantity },
            },
          }),
        ),
      );

      // Update order status
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: "cancelled" },
      });

      // Log activity
      await tx.activityLog.create({
        data: {
          userId,
          actionType: "ORDER_CANCELLED",
          targetId: orderId,
          targetType: "ORDER",
          metadata: {
            cancelledItems: order.items,
          },
        },
      });

      return updatedOrder;
    });

    return result;
  },
};
