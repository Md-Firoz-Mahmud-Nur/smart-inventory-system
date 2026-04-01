"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { NeomorphButton } from "@/components/ui/neomorph-button";
import { ProductSkeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api-client";
import gsap from "gsap";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import useSWR from "swr";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  sku: string;
  category: { id: string; name: string };
  status: string;
  createdAt: string;
}

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  const { data, isLoading, mutate } = useSWR(
    "/api/products",
    () => apiClient.getProducts(),
    { revalidateOnFocus: false },
  );

  const { data: categoriesData } = useSWR(
    "/api/categories",
    () => apiClient.getCategories(),
    { revalidateOnFocus: false },
  );

  const products = data?.data || [];
  const categories = categoriesData?.data || [];

  // Filter products
  const filteredProducts = products.filter(
    (p: Product) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Animation on mount
  useEffect(() => {
    if (containerRef.current && !isLoading) {
      gsap.from(containerRef.current.children, {
        opacity: 0,
        y: 20,
        duration: 0.4,
        stagger: 0.05,
        ease: "power2.out",
      });
    }
  }, [isLoading, filteredProducts.length]);

  return (
    <main className="min-h-screen bg-linear-to-br from-background to-(--secondary)/10 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Products
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your product catalog and inventory
            </p>
          </div>
          <Link href="/products/create">
            <NeomorphButton variant="primary" size="lg">
              + Add Product
            </NeomorphButton>
          </Link>
        </div>

        {/* Search & Filters */}
        <GlassCard className="p-4 mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </GlassCard>

        {/* Products Grid */}
        <div
          ref={containerRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <>
              <ProductSkeleton />
              <ProductSkeleton />
              <ProductSkeleton />
            </>
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full">
              <GlassCard className="p-12 text-center">
                <p className="text-muted-foreground text-lg mb-4">
                  No products found
                </p>
                <Link href="/products/create">
                  <NeomorphButton variant="primary">
                    Create your first product
                  </NeomorphButton>
                </Link>
              </GlassCard>
            </div>
          ) : (
            filteredProducts.map((product: Product) => (
              <GlassCard
                key={product.id}
                className="overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer group">
                <div className="p-6">
                  <div className="mb-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${
                          product.stock > 10
                            ? "bg-green-500/20 text-green-600 dark:text-green-400"
                            : product.stock > 0
                              ? "bg-orange-500/20 text-orange-600 dark:text-orange-400"
                              : "bg-red-500/20 text-red-600 dark:text-red-400"
                        }`}>
                        {product.stock > 0
                          ? `${product.stock} in stock`
                          : "Out of stock"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      SKU: {product.sku}
                    </p>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {product.description || "No description"}
                  </p>

                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Category
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {product.category?.name || "Uncategorized"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">
                        Price
                      </p>
                      <p className="text-lg font-bold text-primary">
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/products/${product.id}`} className="flex-1">
                      <NeomorphButton
                        variant="secondary"
                        size="sm"
                        className="w-full">
                        View
                      </NeomorphButton>
                    </Link>
                    <Link
                      href={`/products/${product.id}/edit`}
                      className="flex-1">
                      <NeomorphButton
                        variant="ghost"
                        size="sm"
                        className="w-full">
                        Edit
                      </NeomorphButton>
                    </Link>
                  </div>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
