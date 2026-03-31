import { prisma } from "@/lib/db";
import { CreateCategoryInput, UpdateCategoryInput } from "@/lib/validators";

export const categoryService = {
  async createCategory(userId: string, input: CreateCategoryInput) {
    const category = await prisma.category.create({
      data: {
        userId,
        name: input.name,
        description: input.description || "",
      },
    });

    return category;
  },

  async getCategories(userId: string) {
    const categories = await prisma.category.findMany({
      where: { userId },
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return categories;
  },

  async getCategoryById(userId: string, categoryId: string) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: { select: { products: true } },
      },
    });

    if (!category || category.userId !== userId) {
      throw new Error("Category not found or unauthorized");
    }

    return category;
  },

  async updateCategory(
    userId: string,
    categoryId: string,
    input: UpdateCategoryInput,
  ) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category || category.userId !== userId) {
      throw new Error("Category not found or unauthorized");
    }

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.description !== undefined && {
          description: input.description,
        }),
      },
    });

    return updatedCategory;
  },

  async deleteCategory(userId: string, categoryId: string) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category || category.userId !== userId) {
      throw new Error("Category not found or unauthorized");
    }

    // Check if category has products
    const productCount = await prisma.product.count({
      where: { categoryId },
    });

    if (productCount > 0) {
      throw new Error("Cannot delete category with existing products");
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    return { success: true };
  },
};
