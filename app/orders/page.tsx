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
  orderItems: {
    quantity: number;
    price: number;
    product: {
      name: string;
    };
  }[];
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

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const fetchProducts = async () => {
    const res = await fetch("/api/products", {
      credentials: "include",
    });
    const data = await res.json();
    setProducts(data);
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);

    const query = statusFilter ? `?status=${statusFilter}` : "";

    const res = await fetch(`/api/orders${query}`, {
      credentials: "include",
    });

    const data = await res.json();
    setOrders(data);

    setLoadingOrders(false);
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, [statusFilter]);

  const addItem = () => {
    setItems([...items, { productId: "", quantity: 1 }]);
  };

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

  const getNextStatuses = (current: string) => {
    switch (current) {
      case "Pending":
        return ["Pending", "Confirmed", "Cancelled"];
      case "Confirmed":
        return ["Confirmed", "Shipped"];
      case "Shipped":
        return ["Shipped", "Delivered"];
      default:
        return [current];
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-gray-200 text-gray-700";
      case "Confirmed":
        return "bg-blue-100 text-blue-700";
      case "Shipped":
        return "bg-yellow-100 text-yellow-700";
      case "Delivered":
        return "bg-green-100 text-green-700";
      case "Cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-200";
    }
  };

  const isOrderValid = () => {
    if (!customerName) return false;

    const seen = new Set();

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);

      if (!product) return false;

      if (product.status === "Inactive") return false;

      if (product.status === "Out of Stock") return false;

      if (seen.has(item.productId)) return false;
      seen.add(item.productId);

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
        <div className="p-6 max-md:pt-16">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Orders</h1>
              <p className="text-slate-600">Track and manage customer orders</p>
            </div>

            <Button onClick={() => setOpen(true)}>New Order</Button>
          </div>

          <select
            className="border rounded px-3 py-2 mb-4 bg-white"
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
          <div className=" rounded-lg ">
            {loadingOrders ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="border p-4 rounded-lg bg-white space-y-3">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
                        <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
                      </div>

                      <div className="h-6 w-20 bg-slate-200 rounded animate-pulse" />
                    </div>

                    {/* Items */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <div className="h-3 w-40 bg-slate-200 rounded animate-pulse" />
                        <div className="h-3 w-12 bg-slate-200 rounded animate-pulse" />
                      </div>
                      <div className="flex justify-between">
                        <div className="h-3 w-36 bg-slate-200 rounded animate-pulse" />
                        <div className="h-3 w-12 bg-slate-200 rounded animate-pulse" />
                      </div>

                      <div className="border-t pt-2 flex justify-between">
                        <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
                        <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <div className="h-8 w-28 bg-slate-200 rounded animate-pulse" />
                      <div className="h-8 w-20 bg-slate-200 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <p className="text-center text-slate-500">No orders found</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border p-4 rounded-lg bg-white">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="font-semibold">{order.customerName}</p>
                        <p className="text-sm text-slate-500">#{order.id}</p>
                      </div>

                      <span
                        className={`text-sm px-2 py-1 rounded flex items-center gap-2 ${getStatusColor(order.status)}`}>
                        {updatingId === order.id && (
                          <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
                        )}
                        {order.status}
                      </span>
                    </div>

                    <div className="text-sm text-slate-700 space-y-1 mt-2">
                      {order.orderItems.map((item, i) => (
                        <div key={i} className="flex justify-between">
                          <span>
                            {item.product.name} × {item.quantity}
                          </span>
                          <span>${item.price * item.quantity}</span>
                        </div>
                      ))}

                      {/* Divider */}
                      <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                        <span>Total</span>
                        <span>${order.totalPrice}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <select
                        className="border rounded px-2 py-1 text-sm"
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={async (e) => {
                          const newStatus = e.target.value;
                          setUpdatingId(order.id);

                          await fetch(`/api/orders/${order.id}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify({ status: newStatus }),
                          });

                          setOrders((prev) =>
                            prev.map((o) =>
                              o.id === order.id
                                ? { ...o, status: newStatus }
                                : o,
                            ),
                          );

                          setUpdatingId(null);
                        }}>
                        {getNextStatuses(order.status).map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>

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
                        {selectedProduct.status === "Inactive" && (
                          <p className="text-red-600 font-medium">
                            This product is currently unavailable.
                          </p>
                        )}

                        {selectedProduct.status === "Out of Stock" && (
                          <p className="text-red-600 font-medium">
                            This product is currently unavailable.
                          </p>
                        )}

                        {items.filter((i) => i.productId === item.productId)
                          .length > 1 && (
                          <p className="text-red-500">
                            This product is already added to the order.
                          </p>
                        )}

                        {selectedProduct.status === "Active" &&
                          item.quantity > selectedProduct.stock && (
                            <p className="text-red-500">
                              Only {selectedProduct.stock} items available in
                              stock
                            </p>
                          )}

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
