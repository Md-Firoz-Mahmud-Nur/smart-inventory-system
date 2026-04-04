import { prisma } from "@/lib/db";
import { verifyAuth } from "@/lib/middleware";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const productUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  categoryId: z.string().min(1).optional(),
  price: z.number().min(0).optional(),
  stock: z.number().int().min(0).optional(),
  minimumStockThreshold: z.number().int().min(0).optional(),
  status: z.enum(["Active", "Out of Stock"]).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true, restockQueue: true, orderItems: true },
    });

    if (!product || product.userId !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Get product error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const updates = productUpdateSchema.parse(body);

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product || product.userId !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // If categoryId is being updated, verify it belongs to user
    if (updates.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: updates.categoryId },
      });
      if (!category || category.userId !== user.id) {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 404 },
        );
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: updates,
      include: { category: true, restockQueue: true },
    });

    // Handle restock queue updates based on new stock
    if (updates.stock !== undefined) {
      const threshold =
        updates.minimumStockThreshold ?? product.minimumStockThreshold;
      const existingQueueItem = await prisma.restockQueue.findUnique({
        where: { productId: id },
      });

      if (updates.stock < threshold && !existingQueueItem) {
        const priority =
          updates.stock === 0
            ? "High"
            : updates.stock <= threshold / 2
              ? "Medium"
              : "Low";

        await prisma.restockQueue.create({
          data: { productId: id, priority },
        });

        // ✅ Activity Log
        await prisma.activityLog.create({
          data: {
            userId: user.id,
            action: "Added to Restock Queue",
            productId: id,
            details: `${product.name} added to restock queue (Priority: ${priority})`,
          },
        });
      } else if (updates.stock >= threshold && existingQueueItem) {
        // Remove from queue
        await prisma.restockQueue.delete({
          where: { productId: id },
        });
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 },
      );
    }
    console.error("Update product error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

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

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product || product.userId !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
