"use client";

import React, { useEffect } from "react";
import gsap from "gsap";
import useSWR from "swr";
import { apiClient } from "@/lib/api-client";
import { GlassCard } from "@/components/ui/glass-card";
import { NeomorphButton } from "@/components/ui/neomorph-button";
import { TableRowSkeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product: { name: string };
  }>;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
  confirmed: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
  shipped: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
  delivered: "bg-green-500/20 text-green-600 dark:text-green-400",
  cancelled: "bg-red-500/20 text-red-600 dark:text-red-400",
};

export default function OrdersPage() {
  const containerRef = React.useRef<HTMLDivElement>(null);

  const { data, isLoading } = useSWR(
    "/api/orders",
    () => apiClient.getOrders(),
    { revalidateOnFocus: false },
  );

  const orders = data?.data || [];

  useEffect(() => {
    if (containerRef.current && !isLoading) {
      gsap.from(containerRef.current.children, {
        opacity: 0,
        y: 10,
        duration: 0.3,
        stagger: 0.05,
        ease: "power2.out",
      });
    }
  }, [isLoading]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[var(--background)] to-[var(--secondary)]/10 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)]">
              Orders
            </h1>
            <p className="text-[var(--muted-foreground)] mt-2">
              Manage and track your orders
            </p>
          </div>
          <Link href="/orders/create">
            <NeomorphButton variant="primary" size="lg">
              + New Order
            </NeomorphButton>
          </Link>
        </div>

        {/* Orders Table */}
        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="px-6 py-4 text-left font-semibold text-[var(--foreground)]">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-[var(--foreground)]">
                    Items
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-[var(--foreground)]">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-[var(--foreground)]">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-[var(--foreground)]">
                    Date
                  </th>
                  <th className="px-6 py-4 text-right font-semibold text-[var(--foreground)]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody ref={containerRef}>
                {isLoading ? (
                  <>
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                  </>
                ) : orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-[var(--muted-foreground)]">
                      No orders yet
                    </td>
                  </tr>
                ) : (
                  orders.map((order: Order) => (
                    <tr
                      key={order.id}
                      className="border-b border-[var(--border)] hover:bg-[var(--muted)]/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-semibold text-[var(--foreground)]">
                          {order.id.slice(0, 8)}...
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">
                        {order.items.length} item
                        {order.items.length !== 1 ? "s" : ""}
                      </td>
                      <td className="px-6 py-4 font-semibold text-[var(--foreground)]">
                        ${order.totalAmount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full ${
                            statusColors[order.status] || statusColors.pending
                          }`}>
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/orders/${order.id}`}>
                          <NeomorphButton variant="ghost" size="sm">
                            View
                          </NeomorphButton>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </main>
  );
}
