"use client";

import React from "react";
import { DashboardNav } from "@/app/components/dashboard-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-50">
      <DashboardNav />
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-md:pt-16">{children}</div>
      </main>
    </div>
  );
}
