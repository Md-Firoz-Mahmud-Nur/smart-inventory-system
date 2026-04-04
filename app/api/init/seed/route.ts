import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: "demo@example.com" },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Demo user already exists" },
        { status: 400 },
      );
    }

    const demoPassword = await hashPassword("123456");

    const user = await prisma.user.create({
      data: {
        email: "demo@example.com",
        name: "Demo User",
        password: demoPassword,
      },
    });

    // 2. Create Categories
    const categories = await Promise.all([
      prisma.category.create({
        data: {
          name: "Electronics",
          userId: user.id,
        },
      }),
      prisma.category.create({
        data: {
          name: "Clothing",
          userId: user.id,
        },
      }),
    ]);

    // 3. Create Products
    const products = await Promise.all([
      prisma.product.create({
        data: {
          name: "iPhone 14",
          price: 999,
          stock: 10,
          categoryId: categories[0].id,
          userId: user.id,
        },
      }),
      prisma.product.create({
        data: {
          name: "T-Shirt",
          price: 20,
          stock: 50,
          categoryId: categories[1].id,
          userId: user.id,
        },
      }),
      prisma.product.create({
        data: {
          name: "Headphones",
          price: 100,
          stock: 5,
          categoryId: categories[0].id,
          userId: user.id,
        },
      }),
    ]);

    // 4. Create Order
    const order = await prisma.order.create({
      data: {
        customerName: "John Doe",
        status: "Pending",
        userId: user.id,
      },
    });

    // 5. Create Order Items
    await prisma.orderItem.createMany({
      data: [
        {
          orderId: order.id,
          productId: products[0].id,
          quantity: 1,
          price: products[0].price,
        },
        {
          orderId: order.id,
          productId: products[1].id,
          quantity: 2,
          price: products[1].price,
        },
      ],
    });

    // 6. Update Order Total
    const totalPrice = products[0].price * 1 + products[1].price * 2;

    await prisma.order.update({
      where: { id: order.id },
      data: { totalPrice },
    });

    // 7. Activity Logs
    await prisma.activityLog.createMany({
      data: [
        {
          userId: user.id,
          action: "User Created",
          details: "Demo user account created",
        },
        {
          userId: user.id,
          action: "Order Created",
          orderId: order.id,
          details: "Initial demo order created",
        },
      ],
    });

    return NextResponse.json({
      message: "Demo data created successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to create demo data" },
      { status: 500 },
    );
  }
}
