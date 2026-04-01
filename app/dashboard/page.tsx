"use client";

import { ActivityLog } from "@/components/dashboard/activity-log";
import { MetricsCard } from "@/components/dashboard/metrics-card";
import { apiClient } from "@/lib/api-client";
import gsap from "gsap";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import useSWR from "swr";

export default function DashboardPage() {
  const router = useRouter();
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Fetch orders
  const { data: ordersData, isLoading: ordersLoading } = useSWR(
    "/api/orders",
    () => apiClient.getOrders(),
    { revalidateOnFocus: false },
  );

  // Fetch products
  const { data: productsData, isLoading: productsLoading } = useSWR(
    "/api/products",
    () => apiClient.getProducts(),
    { revalidateOnFocus: false },
  );

  // Fetch restock queue
  const { data: restockData, isLoading: restockLoading } = useSWR(
    "/api/restock-queue",
    () => apiClient.getRestockQueue(),
    { revalidateOnFocus: false },
  );

  // Animation on mount
  useEffect(() => {
    if (containerRef.current) {
      gsap.from(containerRef.current.children, {
        opacity: 0,
        y: 20,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
      });
    }
  }, []);

  const orders = ordersData?.data || [];
  const products = productsData?.data || [];
  const restockItems = restockData?.data || [];

  // Calculate metrics
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (o: any) => o.status === "pending",
  ).length;
  const totalProducts = products.length;
  const lowStockProducts = products.filter((p: any) => p.stock < 10).length;

  return (
    <main className="min-h-screen bg-linear-to-br from-background to-(--secondary)/10 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s your inventory overview.
          </p>
        </div>

        <div
          ref={containerRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricsCard
            title="Total Orders"
            value={totalOrders}
            icon="📋"
            trend="View all orders"
            isLoading={ordersLoading}
          />
          <MetricsCard
            title="Pending Orders"
            value={pendingOrders}
            icon="⏳"
            trend={`${pendingOrders} awaiting confirmation`}
            isLoading={ordersLoading}
          />
          <MetricsCard
            title="Total Products"
            value={totalProducts}
            icon="📦"
            trend="Across all categories"
            isLoading={productsLoading}
          />
          <MetricsCard
            title="Low Stock Alert"
            value={lowStockProducts}
            icon="⚠️"
            trend="Products need restocking"
            isLoading={productsLoading}
          />
        </div>

        {/* Activity & Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Log */}
          <ActivityLog />

          {/* Restock Queue Preview */}
          <div className="space-y-6 col-span-1">
            <div className="bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-xl border border-white/20 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Restock Queue
              </h3>
              {restockLoading ? (
                <div className="space-y-3">
                  <div className="h-12 bg-muted rounded animate-pulse" />
                  <div className="h-12 bg-muted rounded animate-pulse" />
                </div>
              ) : restockItems.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No items in restock queue
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {restockItems.slice(0, 5).map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-(--muted)/80 transition-colors">
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Stock: {item.product.stock}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${
                          item.priority === "high"
                            ? "bg-red-500/20 text-red-600 dark:text-red-400"
                            : item.priority === "medium"
                              ? "bg-orange-500/20 text-orange-600 dark:text-orange-400"
                              : "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                        }`}>
                        {item.priority?.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
