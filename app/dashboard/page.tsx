"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface DashboardData {
  metrics: {
    ordersToday: number;
    pendingOrders: number;
    completedOrders: number;
    revenueToday: number;
    lowStockCount: number;
  };
  productSummary: {
    id: string;
    name: string;
    stock: number;
    status: string;
    threshold: number;
    isLowStock: boolean;
  }[];
}

interface ActivityLog {
  id: string;
  details: string;
  createdAt: string;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, logsRes] = await Promise.all([
        fetch("/api/dashboard"),
        fetch("/api/activity-logs?limit=10"),
      ]);

      const statsData = await statsRes.json();
      const logsData = await logsRes.json();

      setData(statsData);
      setLogs(logsData);
    } catch (err) {
      setError("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Metrics Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Summary Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Activity Log Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Inventory Dashboard
        </h1>
        <p className="text-slate-500 mt-1">
          Overview of your store performance
        </p>
      </div>

      {/* 🔥 Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Orders Today</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {data?.metrics.ordersToday}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Orders</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-yellow-600">
            {data?.metrics.pendingOrders}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completed Orders</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-green-600">
            {data?.metrics.completedOrders}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Today</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-blue-600">
            ${data?.metrics.revenueToday}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-red-600">
            {data?.metrics.lowStockCount}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 📦 Product Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Product Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data?.productSummary.map((p) => (
                <div
                  key={p.id}
                  className="flex justify-between border-b pb-2 text-sm">
                  <span>{p.name}</span>

                  <span
                    className={
                      p.isLowStock ? "text-red-600" : "text-green-600"
                    }>
                    {p.stock === 0
                      ? "Out of Stock"
                      : p.isLowStock
                        ? `${p.stock} left (Low Stock)`
                        : `${p.stock} available`}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 📜 Activity Log */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="text-sm border-b pb-2">
                  <p>{log.details}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
