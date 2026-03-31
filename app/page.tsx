"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { NeomorphButton } from "@/components/ui/neomorph-button";
import { getAuthToken } from "@/lib/auth";
import gsap from "gsap";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function Home() {
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const token = await getAuthToken();
      if (token) {
        router.push("/dashboard");
      }
    };

    checkAuth();

    // Animations
    if (heroRef.current) {
      gsap.from(heroRef.current.children, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
      });
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--secondary)]/5 to-[var(--background)] overflow-hidden">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center z-10">
          <div className="mb-8">
            <div className="inline-block">
              <span className="text-5xl">📦</span>
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--foreground)] mb-6 leading-tight">
            Smart Inventory &{" "}
            <span className="text-[var(--primary)]">Order Management</span>
          </h1>

          <p className="text-xl md:text-2xl text-[var(--muted-foreground)] mb-12 max-w-2xl mx-auto leading-relaxed">
            Streamline your inventory operations with real-time stock tracking,
            automated restock alerts, and seamless order management.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/auth/signup">
              <NeomorphButton
                variant="primary"
                size="lg"
                className="w-full sm:w-auto">
                Get Started Free
              </NeomorphButton>
            </Link>
            <Link href="/auth/login">
              <NeomorphButton
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto">
                Sign In
              </NeomorphButton>
            </Link>
          </div>

          <p className="text-[var(--muted-foreground)] text-sm">
            No credit card required • 14-day free trial
          </p>
        </div>

        {/* Gradient accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--secondary)]/5 rounded-full blur-3xl" />
      </section>

      {/* Features Section */}
      <section
        ref={featuresRef}
        className="relative py-20 md:py-32 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--foreground)] mb-6">
              Powerful Features
            </h2>
            <p className="text-xl text-[var(--muted-foreground)]">
              Everything you need to manage inventory efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "📊",
                title: "Real-time Analytics",
                description:
                  "Track inventory metrics and sales trends with interactive dashboards",
              },
              {
                icon: "⚠️",
                title: "Smart Alerts",
                description:
                  "Automatic low-stock notifications and restock queue management",
              },
              {
                icon: "🛒",
                title: "Order Management",
                description:
                  "Create, track, and manage orders with atomic stock deductions",
              },
              {
                icon: "📦",
                title: "Product Catalog",
                description:
                  "Organize products by categories with detailed stock information",
              },
              {
                icon: "🔐",
                title: "Secure & Fast",
                description:
                  "JWT authentication with secure cookie storage and optimized queries",
              },
              {
                icon: "📈",
                title: "Activity Logging",
                description:
                  "Comprehensive audit trails for all inventory operations",
              },
            ].map((feature, index) => (
              <GlassCard
                key={index}
                className="p-8 hover:scale-105 transition-transform duration-300">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-[var(--foreground)] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[var(--muted-foreground)] leading-relaxed">
                  {feature.description}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 md:py-32 px-4 md:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <GlassCard className="p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-6">
              Ready to optimize your inventory?
            </h2>
            <p className="text-lg text-[var(--muted-foreground)] mb-8">
              Join businesses managing thousands of products with our platform.
            </p>
            <Link href="/auth/signup">
              <NeomorphButton variant="primary" size="lg" className="w-full">
                Start Free Trial Today
              </NeomorphButton>
            </Link>
          </GlassCard>
        </div>
      </section>
    </main>
  );
}
