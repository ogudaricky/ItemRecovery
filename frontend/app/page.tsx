"use client";

import { FormEvent, useMemo, useState } from "react";

import { getApiBaseUrl } from "@/lib/api";
import { getCurrentUser, login, logout } from "@/lib/auth";
import type { User } from "@/types/auth";

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("Ready");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const baseUrl = useMemo(() => getApiBaseUrl(), []);

  async function handleCheckConnection() {
    setLoading(true);
    try {
      await getCurrentUser();
      setMessage("Backend reachable. Session is authenticated.");
    } catch (error) {
      const text = error instanceof Error ? error.message : "Unknown error";
      if (text.includes("403") || text.includes("401")) {
        setMessage("Backend reachable. Authentication required.");
      } else {
        setMessage(`Connection check failed: ${text}`);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      const loggedIn = await login({ username, password });
      setUser(loggedIn);
      setMessage(`Logged in as ${loggedIn.username}`);
      setPassword("");
    } catch (error) {
      const text = error instanceof Error ? error.message : "Unknown error";
      setMessage(`Login failed: ${text}`);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleFetchCurrentUser() {
    setLoading(true);
    try {
      const current = await getCurrentUser();
      setUser(current);
      setMessage(`Session valid for ${current.username}`);
    } catch (error) {
      const text = error instanceof Error ? error.message : "Unknown error";
      setMessage(`Could not fetch current user: ${text}`);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    setLoading(true);
    try {
      await logout();
      setUser(null);
      setMessage("Logged out.");
    } catch (error) {
      const text = error instanceof Error ? error.message : "Unknown error";
      setMessage(`Logout failed: ${text}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Frontend Backend Connection Check</h1>
        <p className="text-sm text-muted-foreground">Base URL: {baseUrl}</p>
      </header>

      <section className="rounded-lg border bg-card p-4">
        <h2 className="mb-3 text-base font-medium">Connection</h2>
        <button
          type="button"
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60"
          onClick={handleCheckConnection}
          disabled={loading}
        >
          Check backend reachability
        </button>
      </section>

      <section className="rounded-lg border bg-card p-4">
        <h2 className="mb-3 text-base font-medium">Session Login</h2>
        <form className="space-y-3" onSubmit={handleLogin}>
          <div className="space-y-1">
            <label className="text-sm" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm"
              autoComplete="username"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm"
              autoComplete="current-password"
              required
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60"
            disabled={loading}
          >
            Login
          </button>
        </form>
      </section>

      <section className="rounded-lg border bg-card p-4">
        <h2 className="mb-3 text-base font-medium">Authenticated actions</h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-md border px-3 py-2 text-sm disabled:opacity-60"
            onClick={handleFetchCurrentUser}
            disabled={loading}
          >
            Get current user
          </button>
          <button
            type="button"
            className="rounded-md border px-3 py-2 text-sm disabled:opacity-60"
            onClick={handleLogout}
            disabled={loading}
          >
            Logout
          </button>
        </div>
      </section>

      <section className="rounded-lg border bg-card p-4 text-sm">
        <p>
          <span className="font-medium">Status:</span> {message}
        </p>
        {user ? (
          <pre className="mt-3 overflow-auto rounded-md bg-muted p-3 text-xs">
            {JSON.stringify(user, null, 2)}
          </pre>
        ) : null}
      </section>
    </main>
  );
}
