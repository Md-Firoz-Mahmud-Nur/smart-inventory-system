import { prisma } from "@/lib/db";
import { verifyAuth } from "@/lib/middleware";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const restockSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1),
});

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const queueItem = await prisma.restockQueue.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!queueItem || queueItem.product.userId !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.restockQueue.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "Item Removed from Restock Queue",
        productId: queueItem.productId,
        details: `${queueItem.product.name} removed from restock queue`,
      },
    });

    return NextResponse.json({ message: "Item removed from queue" });
  } catch (error) {
    console.error("Remove from queue error:", error);
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
    const { productId, quantity } = restockSchema.parse(body);

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.userId !== user.id) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        stock: { increment: quantity },
        status: "Active",
      },
    });

    if (updatedProduct.stock >= updatedProduct.minimumStockThreshold) {
      await prisma.restockQueue.deleteMany({
        where: { productId },
      });
    }

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "Product Restocked",
        productId,
        details: `Added ${quantity} items to ${product.name}`,
      },
    });

    return NextResponse.json({
      message: "Product restocked successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Restock error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
