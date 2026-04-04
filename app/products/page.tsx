"use client";

import { DashboardNav } from "@/app/components/dashboard-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

type Category = {
  id: string;
  name: string;
};

export default function ProductsPage() {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    price: "",
    stock: "",
    minimumStockThreshold: "5",
  });

  const [error, setError] = useState("");

  type Product = {
    id: string;
    name: string;
    price: number;
    stock: number;
    category: { id: string; name: string };
    status: string;
  };

  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products", {
        credentials: "include",
      });
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch categories for dropdown
  const fetchCategories = async () => {
    const res = await fetch("/api/categories", {
      credentials: "include",
    });
    const data = await res.json();
    setCategories(data);
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  // Handle create product
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: form.name,
          categoryId: form.categoryId,
          price: Number(form.price),
          stock: Number(form.stock),
          minimumStockThreshold: Number(form.minimumStockThreshold),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create product");
        return;
      }

      await fetchProducts();

      // reset form
      setForm({
        name: "",
        categoryId: "",
        price: "",
        stock: "",
        minimumStockThreshold: "5",
      });

      setOpen(false);
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <DashboardNav />

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Products</h1>
              <p className="text-slate-600 mt-1">
                Manage your inventory products
              </p>
            </div>

            <Button onClick={() => setOpen(true)}>Add Product</Button>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            {products.length === 0 ? (
              <p className="text-slate-600 text-center">No products found</p>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex justify-between items-center border-b pb-2">
                    <div>
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-slate-500">
                        {product.category?.name}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold">${product.price}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          product.status === "Out of Stock"
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}>
                        Stock: {product.stock}
                      </span>
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
          <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Add Product</h2>

            <form onSubmit={handleCreate} className="space-y-4">
              {error && <div className="text-red-600 text-sm">{error}</div>}

              <Input
                placeholder="Product Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />

              {/* Category Dropdown */}
              <select
                className="w-full border rounded-md p-2"
                value={form.categoryId}
                onChange={(e) =>
                  setForm({ ...form, categoryId: e.target.value })
                }
                required>
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <Input
                type="number"
                placeholder="Price"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />

              <Input
                type="number"
                placeholder="Stock"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                required
              />

              <Input
                type="number"
                placeholder="Minimum Stock Threshold"
                value={form.minimumStockThreshold}
                onChange={(e) =>
                  setForm({
                    ...form,
                    minimumStockThreshold: e.target.value,
                  })
                }
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}>
                  Cancel
                </Button>

                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
