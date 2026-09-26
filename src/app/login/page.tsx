"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LockKeyhole, LogIn, Sparkles, UserRound } from "lucide-react";

function getSafeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
        cache: "no-store",
      });

      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok) {
        setError(data.error || "Invalid username or password.");
        return;
      }

      router.replace(getSafeNext(searchParams.get("next")));
      router.refresh();
    } catch {
      setError("Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f7f8] px-5 py-10">
      <section className="w-full max-w-md rounded-3xl border bg-white p-7 shadow-sm sm:p-9">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">
          <Sparkles className="h-5 w-5" />
        </div>

        <h1 className="mt-6 text-2xl font-bold tracking-tight">
          Hoichoi AI Content Studio
        </h1>

        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Sign in with the authorized account to open the command center.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Username</span>

            <div className="relative">
              <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                required
                className="w-full rounded-xl border bg-white py-3 pl-10 pr-3 text-sm outline-none transition focus:border-black"
                placeholder="Username"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium">Password</span>

            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                className="w-full rounded-xl border bg-white py-3 pl-10 pr-3 text-sm outline-none transition focus:border-black"
                placeholder="Password"
              />
            </div>
          </label>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogIn className="h-4 w-4" />
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#f7f7f8] px-5 py-10">
          <section className="w-full max-w-md rounded-3xl border bg-white p-7 shadow-sm sm:p-9">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">
              <Sparkles className="h-5 w-5" />
            </div>

            <h1 className="mt-6 text-2xl font-bold tracking-tight">
              Hoichoi AI Content Studio
            </h1>

            <p className="mt-2 text-sm text-zinc-500">Loading sign in...</p>
          </section>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
