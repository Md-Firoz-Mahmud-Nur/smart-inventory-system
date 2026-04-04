"use client";

import { DashboardNav } from "@/app/components/dashboard-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  status: string;
};

type Order = {
  id: string;
  customerName: string;
  totalPrice: number;
  status: string;
};

export default function OrdersPage() {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [customerName, setCustomerName] = useState("");
  const [items, setItems] = useState([{ productId: "", quantity: 1 }]);

  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // 🔹 Fetch products
  const fetchProducts = async () => {
    const res = await fetch("/api/products", {
      credentials: "include",
    });
    const data = await res.json();
    setProducts(data);
  };

  // 🔹 Fetch orders
  const fetchOrders = async () => {
    const query = statusFilter ? `?status=${statusFilter}` : "";

    const res = await fetch(`/api/orders${query}`, {
      credentials: "include",
    });

    const data = await res.json();
    setOrders(data);
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, [statusFilter]);

  // 🔹 Add item row
  const addItem = () => {
    setItems([...items, { productId: "", quantity: 1 }]);
  };

  // 🔹 Handle create order
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          customerName,
          items,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create order");
        return;
      }

      // reset
      setCustomerName("");
      setItems([{ productId: "", quantity: 1 }]);
      resetForm();
      setOpen(false);

      fetchOrders();
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const isOrderValid = () => {
    if (!customerName) return false;

    const seen = new Set();

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);

      if (!product) return false;

      // ❗ Inactive / unavailable product
      if (product.status === "Inactive") return false;

      // ❗ Out of stock
      if (product.status === "Out of Stock") return false;

      // ❗ Duplicate detection
      if (seen.has(item.productId)) return false;
      seen.add(item.productId);

      // ❗ Quantity validation
      if (item.quantity > product.stock) return false;
      if (item.quantity < 1) return false;
    }

    return true;
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems.length > 0 ? newItems : [{ productId: "", quantity: 1 }]);
  };

  const resetForm = () => {
    setCustomerName("");
    setItems([{ productId: "", quantity: 1 }]);
    setError("");
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <DashboardNav />

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Orders</h1>
              <p className="text-slate-600">Track and manage customer orders</p>
            </div>

            <Button onClick={() => setOpen(true)}>New Order</Button>
          </div>

          <select
            className="border rounded px-3 py-2"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
            }}>
            <option value="">All Orders</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Orders List */}
          <div className="bg-white rounded-lg border p-6">
            {orders.length === 0 ? (
              <p className="text-center text-slate-500">No orders found</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="font-semibold">{order.customerName}</p>
                        <p className="text-sm text-slate-500">#{order.id}</p>
                      </div>

                      <span className="text-sm px-2 py-1 rounded bg-slate-200">
                        {order.status}
                      </span>
                    </div>

                    <div className="text-sm text-slate-600 mb-2">
                      Total: ${order.totalPrice}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {/* Status Dropdown */}
                      <select
                        className="border rounded px-2 py-1 text-sm"
                        value={order.status}
                        onChange={async (e) => {
                          await fetch(`/api/orders/${order.id}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify({ status: e.target.value }),
                          });

                          fetchOrders();
                        }}>
                        {[
                          "Pending",
                          "Confirmed",
                          "Shipped",
                          "Delivered",
                          "Cancelled",
                        ].map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>

                      {/* Cancel */}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={async () => {
                          if (!confirm("Cancel this order?")) return;

                          await fetch(`/api/orders/${order.id}`, {
                            method: "DELETE",
                            credentials: "include",
                          });

                          fetchOrders();
                        }}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-lg p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Create Order</h2>

            <form onSubmit={handleCreate} className="space-y-4">
              {error && <div className="text-red-600 text-sm">{error}</div>}

              <Input
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />

              {/* Items */}
              {items.map((item, index) => {
                const selectedProduct = products.find(
                  (p) => p.id === item.productId,
                );

                return (
                  <div key={index} className="space-y-1">
                    <div className="flex gap-2">
                      {/* Product Select */}
                      <select
                        className="flex-1 border rounded p-2"
                        value={item.productId}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[index].productId = e.target.value;
                          setItems(newItems);
                        }}
                        required>
                        <option value="">Select Product</option>
                        {products.map((p) => {
                          const alreadySelected = items.some(
                            (i, iIndex) =>
                              i.productId === p.id && iIndex !== index,
                          );

                          return (
                            <option
                              key={p.id}
                              value={p.id}
                              disabled={
                                p.status === "Out of Stock" ||
                                p.status === "Inactive" ||
                                alreadySelected
                              }>
                              {p.name}
                              {p.status === "Out of Stock"
                                ? " (Out of Stock)"
                                : ""}
                              {p.status === "Inactive"
                                ? " (Inactive - unavailable)"
                                : ""}
                              {alreadySelected ? " (Already Added)" : ""}
                            </option>
                          );
                        })}
                      </select>

                      {/* Quantity */}
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[index].quantity = Number(e.target.value);
                          setItems(newItems);
                        }}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeItem(index)}>
                        ✕
                      </Button>
                    </div>

                    {/* 🔥 Stock Warning */}
                    {selectedProduct && (
                      <div className="text-xs space-y-1">
                        {/* ❗ Inactive */}
                        {selectedProduct.status === "Inactive" && (
                          <p className="text-red-600 font-medium">
                            This product is currently unavailable.
                          </p>
                        )}

                        {/* ❗ Out of Stock */}
                        {selectedProduct.status === "Out of Stock" && (
                          <p className="text-red-600 font-medium">
                            This product is currently unavailable.
                          </p>
                        )}

                        {/* ❗ Duplicate check */}
                        {items.filter((i) => i.productId === item.productId)
                          .length > 1 && (
                          <p className="text-red-500">
                            This product is already added to the order.
                          </p>
                        )}

                        {/* ❗ Stock warning */}
                        {selectedProduct.status === "Active" &&
                          item.quantity > selectedProduct.stock && (
                            <p className="text-red-500">
                              Only {selectedProduct.stock} items available in
                              stock
                            </p>
                          )}

                        {/* ✅ Available */}
                        {selectedProduct.status === "Active" &&
                          item.quantity <= selectedProduct.stock && (
                            <p className="text-slate-500">
                              Available: {selectedProduct.stock}
                            </p>
                          )}
                      </div>
                    )}
                  </div>
                );
              })}

              <Button type="button" onClick={addItem}>
                + Add Item
              </Button>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setOpen(false);
                  }}>
                  Cancel
                </Button>

                <Button type="submit" disabled={loading || !isOrderValid()}>
                  {loading ? "Creating..." : "Create Order"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
