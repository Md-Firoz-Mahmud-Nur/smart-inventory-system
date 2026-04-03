import { prisma } from "@/lib/db";
import { verifyAuth } from "@/lib/middleware";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
});

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const categories = await prisma.category.findMany({
      where: { userId: user.id },
      include: { _count: { select: { products: true } } },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Get categories error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req);

    console.log("aa\aa");

    console.log(user);

    //  ✓ Compiled in 51ms
    // aaaa
    // {
    //   userId: 'cmnh9x49g000h9ohknbb3e3fn',
    //   iat: 1775122190,
    //   exp: 1775726990
    // }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name } = categorySchema.parse(body);

    const category = await prisma.category.create({
      data: {
        name,
        user: {
          connect: { id: user.id },
        },
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 },
      );
    }
    console.error("Create category error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
