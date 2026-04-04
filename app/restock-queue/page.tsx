"use client";

import { DashboardNav } from "@/app/components/dashboard-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

type QueueItem = {
  id: string;
  priority: string;
  product: {
    id: string;
    name: string;
    stock: number;
    minimumStockThreshold: number;
    category: {
      name: string;
    };
  };
};

export default function RestockQueuePage() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState("");

  // 🔥 Modal states
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<QueueItem | null>(null);
  const [quantity, setQuantity] = useState(1);

  // 🔹 Fetch queue
  const fetchQueue = async () => {
    const query = priorityFilter ? `?priority=${priorityFilter}` : "";

    const res = await fetch(`/api/restock-queue${query}`, {
      credentials: "include",
    });

    const data = await res.json();
    setQueue(data);
  };

  useEffect(() => {
    fetchQueue();
  }, [priorityFilter]);

  // 🔹 Remove item
  const handleRemove = async (id: string) => {
    const confirmDelete = confirm("Remove from restock queue?");
    if (!confirmDelete) return;

    setLoading(true);

    await fetch(`/api/restock-queue/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    fetchQueue();
    setLoading(false);
  };

  // 🔹 Open restock modal
  const openRestock = (item: QueueItem) => {
    setSelectedItem(item);
    setQuantity(1);
    setOpen(true);
  };

  // 🔹 Handle restock
  const handleRestock = async () => {
    if (!selectedItem) return;

    setLoading(true);

    await fetch(`/api/restock-queue/${selectedItem.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        productId: selectedItem.product.id,
        quantity,
      }),
    });

    setOpen(false);
    setSelectedItem(null);
    setQuantity(1);

    fetchQueue();
    setLoading(false);
  };

  // 🎨 Priority badge
  const getPriorityColor = (priority: string) => {
    if (priority === "High") return "bg-red-100 text-red-700";
    if (priority === "Medium") return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <DashboardNav />

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Restock Queue</h1>
              <p className="text-slate-600">
                Monitor and manage low stock items
              </p>
            </div>

            {/* Filter */}
            <select
              className="border rounded px-3 py-2"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="">All</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* List */}
          <div className="bg-white rounded-lg border p-6">
            {queue.length === 0 ? (
              <p className="text-center text-slate-500">
                No items in restock queue 🎉
              </p>
            ) : (
              <div className="space-y-4">
                {[...queue]
                  .sort((a, b) => a.product.stock - b.product.stock)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center border-b pb-3">
                      <div>
                        <p className="font-semibold">{item.product.name}</p>
                        <p className="text-sm text-slate-500">
                          Category: {item.product.category.name}
                        </p>
                        <p className="text-sm text-red-500">
                          Only {item.product.stock} items available in stock
                        </p>
                        <p className="text-sm text-slate-500">
                          Min: {item.product.minimumStockThreshold}
                        </p>
                      </div>

                      <div className="flex flex-col items-center gap-3">
                        <span
                          className={`px-2 py-1 text-xs rounded ${getPriorityColor(
                            item.priority,
                          )}`}>
                          {item.priority}
                        </span>

                        {/* 🔥 Restock Button */}
                        <Button size="sm" onClick={() => openRestock(item)}>
                          Restock
                        </Button>

                        {/* Remove */}
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={loading}
                          onClick={() => handleRemove(item.id)}>
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 🔥 RESTOCK MODAL */}
      {open && selectedItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Restock Product</h2>

            <p className="font-medium">{selectedItem.product.name}</p>

            <p className="text-sm text-slate-500 mb-4">
              Current Stock: {selectedItem.product.stock}
            </p>

            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />

            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  setSelectedItem(null);
                  setQuantity(1);
                }}>
                Cancel
              </Button>

              <Button onClick={handleRestock} disabled={loading}>
                {loading ? "Updating..." : "Confirm Restock"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
