"use client";

import { DashboardNav } from "@/app/components/dashboard-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

type Category = {
  id: string;
  name: string;
  _count?: {
    products: number;
  };
};

export default function CategoriesPage() {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/categories", {
        credentials: "include",
      });
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create category");
        return;
      }

      setName("");
      setOpen(false);
      fetchCategories();
    } catch (err) {
      setError("Something went wrong");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <DashboardNav />

      <main className="flex-1 overflow-auto">
        <div className="p-6 max-md:pt-16">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Categories</h1>
              <p className="text-slate-600 mt-1">
                Organize your products by category
              </p>
            </div>

            <Button onClick={() => setOpen(true)}>Add Category</Button>
          </div>

          {/* List */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center border p-4 rounded-lg">
                      <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : categories.length === 0 ? (
              <p className="text-slate-600 text-center">No categories found</p>
            ) : (
              <div className="space-y-3">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex justify-between items-center border p-4 rounded-lg">
                    <span className="font-medium">{cat.name}</span>
                    <span className="text-sm text-slate-500">
                      {cat._count?.products || 0} products
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Add Category</h2>

            <form onSubmit={handleCreate} className="space-y-4">
              {error && <div className="text-red-600 text-sm">{error}</div>}

              <Input
                placeholder="Category name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
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
