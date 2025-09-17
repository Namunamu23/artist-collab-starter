"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

export default function SignIn() {
  const router = useRouter();
  const search = useSearchParams();

  // Honor ?next= if it's a safe, same-origin path. Otherwise default to /projects
  const next = useMemo(() => {
    const raw = search?.get("next") ?? "";
    return raw && raw.startsWith("/") ? raw : "/projects";
  }, [search]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = useCallback(async () => {
    if (loading) return;
    setErr(null);

    const e = email.trim();
    if (!e) return setErr("Email is required.");
    if (!password) return setErr("Password is required.");

    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email: e,
        password,
      });

      if (error) {
        // Supabase often uses status 400 + "invalid credentials" message
        const msg = error.message.toLowerCase();
        if ((error as any)?.status === 400 || msg.includes("invalid")) {
          setErr("Wrong email or password.");
        } else {
          setErr(error.message);
        }
        return;
      }

      router.push(next);
    } catch (e: any) {
      setErr(e?.message ?? "Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [email, password, loading, next, router]);

  const canSubmit = email.trim() !== "" && password !== "" && !loading;

  return (
    <section className="container py-10 max-w-md space-y-4">
      <h1 className="text-3xl font-bold">Sign in</h1>

      <input
        className="input"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        autoComplete="email"
      />

      <input
        className="input"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        autoComplete="current-password"
      />

      {err && (
        <div className="rounded-xl border border-red-900/50 bg-red-950/40 text-red-300 px-3 py-2 text-sm">
          {err}
        </div>
      )}

      <button className="btn w-full" onClick={onSubmit} disabled={!canSubmit}>
        {loading ? "Signing in…" : "Continue"}
      </button>

      {/* Optional helpers to add later */}
      {/* <div className="text-sm text-neutral-500 text-center">
        <a href="/forgot" className="hover:underline">Forgot password?</a>
      </div> */}
    </section>
  );
}
