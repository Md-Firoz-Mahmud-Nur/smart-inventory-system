import { prisma } from "@/lib/db";
import { verifyAuth } from "@/lib/middleware";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  categoryId: z.string().min(1, "Category is required"),
  price: z.number().min(0, "Price must be positive"),
  stock: z.number().int().min(0, "Stock must be non-negative"),
  minimumStockThreshold: z.number().int().min(0).default(5),
});

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const status = searchParams.get("status");

    const where: any = { userId: user.id };
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;

    const products = await prisma.product.findMany({
      where,
      include: { category: true, restockQueue: true },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Get products error:", error);
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
    const { name, categoryId, price, stock, minimumStockThreshold } =
      productSchema.parse(body);

    // Verify category belongs to user
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category || category.userId !== user.id) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    const product = await prisma.product.create({
      data: {
        userId: user.id,
        categoryId,
        name,
        price,
        stock,
        minimumStockThreshold,
        status: stock === 0 ? "Out of Stock" : "Active",
      },
      include: { category: true },
    });

    // Add to restock queue if below threshold
    if (product.stock < product.minimumStockThreshold) {
      const priority =
        product.stock === 0
          ? "High"
          : product.stock <= product.minimumStockThreshold / 2
            ? "Medium"
            : "Low";

      await prisma.restockQueue.create({
        data: {
          productId: product.id,
          priority,
        },
      });

      // ✅ Activity Log
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: "Added to Restock Queue",
          productId: product.id,
          details: `${product.name} added to restock queue (Priority: ${priority})`,
        },
      });
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 },
      );
    }
    console.error("Create product error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
