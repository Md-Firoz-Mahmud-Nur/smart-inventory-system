"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { NeomorphButton } from "@/components/ui/neomorph-button";
import { TableRowSkeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api-client";
import gsap from "gsap";
import React, { useEffect, useState } from "react";
import useSWR from "swr";

interface RestockItem {
  id: string;
  productId: string;
  status: string;
  priority: string;
  product: {
    id: string;
    name: string;
    sku: string;
    stock: number;
    price: number;
  };
  createdAt: string;
}

const priorityColors: Record<string, string> = {
  high: "bg-red-500/20 text-red-600 dark:text-red-400",
  medium: "bg-orange-500/20 text-orange-600 dark:text-orange-400",
  low: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
};

export default function RestockQueuePage() {
  const [selectedPriority, setSelectedPriority] = useState<string>("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  const { data, isLoading, mutate } = useSWR(
    `/api/restock-queue${selectedPriority ? `?priority=${selectedPriority}` : ""}`,
    () =>
      apiClient.getRestockQueue({
        priority: selectedPriority || undefined,
      }),
    { revalidateOnFocus: false },
  );

  const items = data?.data || [];

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

  const handleRemove = async (id: string) => {
    try {
      await apiClient.removeFromRestockQueue(id);
      mutate();
    } catch (error) {
      console.error("Failed to remove from queue:", error);
    }
  };

  const handleMarkCompleted = async (id: string) => {
    try {
      await apiClient.updateRestockStatus(id, { status: "completed" });
      mutate();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-background to-(--secondary)/10 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Restock Queue
          </h1>
          <p className="text-muted-foreground mt-2">
            Products requiring restocking, prioritized by urgency
          </p>
        </div>

        {/* Filters */}
        <GlassCard className="p-4 mb-8">
          <div className="flex flex-wrap gap-2">
            <NeomorphButton
              variant={selectedPriority === "" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setSelectedPriority("")}>
              All
            </NeomorphButton>
            <NeomorphButton
              variant={selectedPriority === "high" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setSelectedPriority("high")}>
              High Priority
            </NeomorphButton>
            <NeomorphButton
              variant={selectedPriority === "medium" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setSelectedPriority("medium")}>
              Medium Priority
            </NeomorphButton>
            <NeomorphButton
              variant={selectedPriority === "low" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setSelectedPriority("low")}>
              Low Priority
            </NeomorphButton>
          </div>
        </GlassCard>

        {/* Restock Queue Table */}
        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-4 text-left font-semibold text-foreground">
                    Product Name
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-foreground">
                    SKU
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-foreground">
                    Current Stock
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-foreground">
                    Priority
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-foreground">
                    Added
                  </th>
                  <th className="px-6 py-4 text-right font-semibold text-foreground">
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
                ) : items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-muted-foreground">
                      {selectedPriority
                        ? `No ${selectedPriority} priority items`
                        : "Restock queue is empty!"}
                    </td>
                  </tr>
                ) : (
                  items.map((item: RestockItem) => (
                    <tr
                      key={item.id}
                      className="border-b border-border hover:bg-[var(--muted)]/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">
                        {item.product.name}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-muted-foreground">
                        {item.product.sku}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded font-semibold text-sm ${
                            item.product.stock === 0
                              ? "bg-red-500/20 text-red-600 dark:text-red-400"
                              : item.product.stock < 5
                                ? "bg-orange-500/20 text-orange-600 dark:text-orange-400"
                                : "bg-green-500/20 text-green-600 dark:text-green-400"
                          }`}>
                          {item.product.stock} units
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                            priorityColors[item.priority] || priorityColors.low
                          }`}>
                          {item.priority.charAt(0).toUpperCase() +
                            item.priority.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2 flex justify-end">
                        <NeomorphButton
                          variant="secondary"
                          size="sm"
                          onClick={() => handleMarkCompleted(item.id)}>
                          Completed
                        </NeomorphButton>
                        <NeomorphButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(item.id)}>
                          Remove
                        </NeomorphButton>
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
