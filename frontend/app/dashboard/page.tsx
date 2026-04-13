"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getCurrentUser, logout } from "@/lib/auth";
import { listFoundItems, listLostItems } from "@/lib/items";
import { TopNav } from "@/components/layout/top-nav";
import type { User } from "@/types/auth";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("Loading your dashboard...");
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [lostCount, setLostCount] = useState<number | null>(null);
  const [foundCount, setFoundCount] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;

    async function loadSession() {
      try {
        const current = await getCurrentUser();
        if (!alive) return;
        setUser(current);
        setMessage(`Welcome back, ${current.username}.`);
        const lost = await listLostItems();
        if (!alive) return;
        setLostCount(lost.length);
        const found = await listFoundItems();
        if (!alive) return;
        setFoundCount(found.length);
      } catch (error) {
        if (!alive) return;
        const text = error instanceof Error ? error.message : "Unknown error";
        setMessage(`Please sign in again. ${text}`);
        router.replace("/login");
      } finally {
        if (alive) setLoading(false);
      }
    }

    void loadSession();
    return () => {
      alive = false;
    };
  }, [router]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
      router.replace("/login");
    } catch (error) {
      const text = error instanceof Error ? error.message : "Unknown error";
      setMessage(`Could not sign out. ${text}`);
    } finally {
      setLoggingOut(false);
    }
  }

  if (loading) {
    return (
      <main className="relative min-h-screen overflow-hidden px-6 py-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_8%,_#8686AC22,_transparent_45%),radial-gradient(circle_at_90%_92%,_#2727571C,_transparent_48%)]" />
        <div className="relative mx-auto flex min-h-[80vh] w-full max-w-5xl items-center justify-center text-sm text-muted-foreground">
          {message}
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_8%,_#8686AC22,_transparent_45%),radial-gradient(circle_at_90%_92%,_#2727571C,_transparent_48%)]" />
      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-6">
      <TopNav />
      <header className="rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
        <button
          type="button"
          className="rounded-lg border border-border/80 bg-background/70 px-4 py-2 text-sm transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-60"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          Sign out
        </button>
        </div>
      </header>

      {user ? (
        <section className="rounded-2xl border border-border/70 bg-card/80 p-5 text-sm shadow-sm backdrop-blur-sm">
          <h2 className="mb-2 text-base font-medium">Your Account</h2>
          <p>Name: {user.username}</p>
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>
        </section>
      ) : null}

      <section className="rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur-sm">
        <h2 className="mb-2 text-base font-medium">Overview</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Lost reports: {lostCount ?? "Loading..."} | Found reports: {foundCount ?? "Loading..."}
        </p>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link className="rounded-lg border border-border/80 bg-background/70 px-3 py-2 transition-colors hover:border-primary/40 hover:text-primary" href="/report-lost">
            Report a lost item
          </Link>
          <Link className="rounded-lg border border-border/80 bg-background/70 px-3 py-2 transition-colors hover:border-primary/40 hover:text-primary" href="/report-found">
            Report a found item
          </Link>
        </div>
      </section>
      </div>
    </main>
  );
}
