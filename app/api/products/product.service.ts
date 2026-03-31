/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/db";
import { CreateProductInput, UpdateProductInput } from "@/lib/validators";

export const productService = {
  async createProduct(userId: string, input: CreateProductInput) {
    // Verify category exists and belongs to user
    const category = await prisma.category.findUnique({
      where: { id: input.categoryId },
    });

    if (!category || category.userId !== userId) {
      throw new Error("Category not found or unauthorized");
    }

    // Check if SKU already exists for this user
    const existingSku = await prisma.product.findFirst({
      where: {
        userId,
        sku: input.sku,
      },
    });

    if (existingSku) {
      throw new Error("SKU already exists");
    }

    const product = await prisma.product.create({
      data: {
        userId,
        name: input.name,
        description: input.description || "",
        price: input.price,
        stock: input.stock,
        categoryId: input.categoryId,
        sku: input.sku,
      },
      include: {
        category: { select: { id: true, name: true } },
      },
    });

    return product;
  },

  async getProducts(
    userId: string,
    filters?: { status?: string; categoryId?: string },
  ) {
    const products = await prisma.product.findMany({
      where: {
        userId,
        ...(filters?.status && { status: filters.status as any }),
        ...(filters?.categoryId && { categoryId: filters.categoryId }),
      },
      include: {
        category: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return products;
  },

  async getProductById(userId: string, productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: { select: { id: true, name: true } },
      },
    });

    if (!product || product.userId !== userId) {
      throw new Error("Product not found or unauthorized");
    }

    return product;
  },

  async updateProduct(
    userId: string,
    productId: string,
    input: UpdateProductInput,
  ) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.userId !== userId) {
      throw new Error("Product not found or unauthorized");
    }

    // If updating SKU, check uniqueness
    if (input.sku && input.sku !== product.sku) {
      const existingSku = await prisma.product.findFirst({
        where: {
          userId,
          sku: input.sku,
          id: { not: productId },
        },
      });

      if (existingSku) {
        throw new Error("SKU already exists");
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.description !== undefined && {
          description: input.description,
        }),
        ...(input.price && { price: input.price }),
        ...(input.stock !== undefined && { stock: input.stock }),
        ...(input.categoryId && { categoryId: input.categoryId }),
        ...(input.sku && { sku: input.sku }),
      },
      include: {
        category: { select: { id: true, name: true } },
      },
    });

    return updatedProduct;
  },

  async deleteProduct(userId: string, productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.userId !== userId) {
      throw new Error("Product not found or unauthorized");
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    return { success: true };
  },

  async checkStock(productId: string, quantity: number) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.stock < quantity) {
      throw new Error(
        `Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`,
      );
    }

    return product;
  },
};
