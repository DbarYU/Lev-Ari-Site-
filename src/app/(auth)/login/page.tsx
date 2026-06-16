"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dumbbell, ShieldCheck, User } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type LoginMode = null | "admin" | "client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<LoginMode>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const body = mode === "admin"
        ? { email: "", password }
        : { email, password };

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Login failed");
        return;
      }

      if (data.user.role === "trainee") {
        router.push("/dashboard");
      } else {
        router.push("/admin/trainees");
      }
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg">
            <Dumbbell className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">FitCoach Portal</h1>
          <p className="mt-1 text-sm text-gray-500">Who are you signing in as?</p>
        </div>

        {/* Role selection */}
        {mode === null && (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setMode("admin")}
              className="flex flex-col items-center gap-3 rounded-2xl bg-white p-8 shadow-xl border-2 border-transparent hover:border-blue-500 transition-all"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                <ShieldCheck className="h-6 w-6 text-blue-600" />
              </div>
              <span className="font-semibold text-gray-900">Admin</span>
              <span className="text-xs text-gray-400 text-center">Coach / Trainer</span>
            </button>

            <button
              onClick={() => setMode("client")}
              className="flex flex-col items-center gap-3 rounded-2xl bg-white p-8 shadow-xl border-2 border-transparent hover:border-blue-500 transition-all"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <span className="font-semibold text-gray-900">Client</span>
              <span className="text-xs text-gray-400 text-center">Trainee</span>
            </button>
          </div>
        )}

        {/* Admin — password only */}
        {mode === "admin" && (
          <div className="rounded-2xl bg-white p-8 shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              <h2 className="font-semibold text-gray-900">Admin Sign In</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Admin Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                autoFocus
              />
              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 border border-red-200">
                  {error}
                </p>
              )}
              <Button type="submit" loading={loading} className="w-full" size="lg">
                Sign in as Admin
              </Button>
            </form>
            <button
              onClick={() => { setMode(null); setPassword(""); setError(""); }}
              className="mt-4 w-full text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              ← Back
            </button>
          </div>
        )}

        {/* Client — email + password */}
        {mode === "client" && (
          <div className="rounded-2xl bg-white p-8 shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <User className="h-5 w-5 text-green-600" />
              <h2 className="font-semibold text-gray-900">Client Sign In</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                autoFocus
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 border border-red-200">
                  {error}
                </p>
              )}
              <Button type="submit" loading={loading} className="w-full" size="lg">
                Sign in
              </Button>
            </form>
            <button
              onClick={() => { setMode(null); setEmail(""); setPassword(""); setError(""); }}
              className="mt-4 w-full text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              ← Back
            </button>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-gray-400">
          Client credentials are provided by your coach.
        </p>
      </div>
    </div>
  );
}
