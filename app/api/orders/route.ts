import { prisma } from "@/lib/db";
import { verifyAuth } from "@/lib/middleware";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const orderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1),
});

const orderSchema = z.object({
  customerName: z.string().min(1),
  items: z.array(orderItemSchema).min(1),
});

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = { userId: user.id };
    if (status) where.status = status;

    const orders = await prisma.order.findMany({
      where,
      include: {
        orderItems: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { customerName, items } = orderSchema.parse(body);

    // Check for duplicate products
    const productIds = items.map((item) => item.productId);
    if (new Set(productIds).size !== productIds.length) {
      return NextResponse.json(
        { error: "Duplicate product entries in order" },
        { status: 400 },
      );
    }

    // Fetch all products with stock check
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, userId: user.id },
    });

    if (products.length !== items.length) {
      return NextResponse.json(
        { error: "One or more products not found" },
        { status: 404 },
      );
    }

    // Validate stock and inactive products
    const stockErrors: string[] = [];
    const inactiveProducts: string[] = [];

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) continue;

      if (product.status === "Out of Stock") {
        inactiveProducts.push(`${product.name} is currently unavailable.`);
      } else if (product.stock < item.quantity) {
        stockErrors.push(
          `Only ${product.stock} items available for ${product.name}.`,
        );
      }
    }

    if (stockErrors.length > 0 || inactiveProducts.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot create order",
          stockIssues: stockErrors,
          unavailableProducts: inactiveProducts,
        },
        { status: 400 },
      );
    }

    const order = await prisma.$transaction(async (tx) => {
      let totalPrice = 0;
      const orderItemsData = [];

      for (const item of items) {
        const product = products.find((p) => p.id === item.productId)!;
        const itemTotal = product.price * item.quantity;
        totalPrice += itemTotal;

        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
        });

        // Deduct stock atomically
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
          },
        });
      }

      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          customerName,
          totalPrice,
          orderItems: {
            createMany: { data: orderItemsData },
          },
        },
        include: { orderItems: { include: { product: true } } },
      });

      for (const item of items) {
        const updatedProduct = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!updatedProduct) continue;

        if (updatedProduct.stock === 0) {
          await tx.product.update({
            where: { id: item.productId },
            data: { status: "Out of Stock" },
          });
        }

        if (updatedProduct.stock < updatedProduct.minimumStockThreshold) {
          const existingQueue = await tx.restockQueue.findUnique({
            where: { productId: item.productId },
          });

          const priority =
            updatedProduct.stock === 0
              ? "High"
              : updatedProduct.stock <= updatedProduct.minimumStockThreshold / 2
                ? "Medium"
                : "Low";

          if (!existingQueue) {
            await tx.restockQueue.create({
              data: { productId: item.productId, priority },
            });

            await tx.activityLog.create({
              data: {
                userId: user.id,
                action: "Added to Restock Queue",
                productId: item.productId,
                orderId: newOrder.id,
                details: `${updatedProduct.name} added to restock queue from Order #${newOrder.id} (Priority: ${priority})`,
              },
            });
          } else if (existingQueue.priority !== priority) {
            await tx.restockQueue.update({
              where: { productId: item.productId },
              data: { priority },
            });

            await tx.activityLog.create({
              data: {
                userId: user.id,
                action: "Restock Priority Updated",
                productId: item.productId,
                orderId: newOrder.id,
                details: `${updatedProduct.name} priority updated to ${priority} (Order #${newOrder.id})`,
              },
            });
          }
        }
      }

      await tx.activityLog.create({
        data: {
          userId: user.id,
          action: "Order Created",
          orderId: newOrder.id,
          details: `Order #${newOrder.id} created for ${customerName}`,
        },
      });

      return newOrder;
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 },
      );
    }
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
