"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

const handleOk = (h: string) => /^[a-z0-9_.]{3,30}$/.test(h);

export default function SignUp() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [handle, setHandle] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = useCallback(async () => {
    if (loading) return;
    setErr(null);

    // normalize + validate handle
    const normHandle = handle.trim().toLowerCase();
    if (!handleOk(normHandle)) {
      setErr("Handle must be 3–30 chars and use a–z, 0–9, _ or .");
      return;
    }
    if (!email.trim()) {
      setErr("Email is required.");
      return;
    }
    if (password.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }
    if (!name.trim()) {
      setErr("Display name is required.");
      return;
    }

    try {
      setLoading(true);

      // 1) Sign up the auth user
      const { data: sign, error: signErr } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          // store full name in auth metadata (optional)
          data: { full_name: name.trim() },
        },
      });
      if (signErr) {
        setErr(signErr.message);
        setLoading(false);
        return;
      }

      const userId = sign.user?.id;
      if (!userId) {
        // extremely rare: sign-up returned no user
        setErr("Sign up succeeded but no user ID returned. Try signing in.");
        setLoading(false);
        return;
      }

      // 2) Create/Update profile row
      //    Use UPSERT so it works whether a trigger already inserted a profile row or not.
      const { error: upErr } = await supabase
        .from("profiles")
        .upsert(
          {
            id: userId,
            handle: normHandle,
            display_name: name.trim(),
            mediums: [],
            intents: [],
          },
          { onConflict: "id" }
        );

      if (upErr) {
        // Duplicate handle => Postgres code 23505
        // (Supabase bubbles it as error.code when available)
        if ((upErr as any).code === "23505") {
          setErr("That handle is taken. Try another.");
        } else {
          setErr(upErr.message);
        }
        setLoading(false);
        return;
      }

      // 3) Done — go to profile (or projects)
      router.push("/profile");
    } catch (e: any) {
      setErr(e?.message ?? "Unexpected error. Please try again.");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }, [email, password, handle, name, loading, router]);

  return (
    <section className="container py-10 max-w-md space-y-4">
      <h1 className="text-3xl font-bold">Create your account</h1>

      <div className="space-y-2">
        <label className="block text-sm text-neutral-400">Handle (unique)</label>
        <input
          className="input w-full"
          placeholder="e.g. demetre_art"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        />
        <p className="text-xs text-neutral-500">
          3–30 chars · a–z, 0–9, _ or . · shown as <code>@handle</code>
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm text-neutral-400">Display name</label>
        <input
          className="input w-full"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm text-neutral-400">Email</label>
        <input
          className="input w-full"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm text-neutral-400">Password</label>
        <input
          className="input w-full"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        />
      </div>

      {err && (
        <div className="rounded-xl border border-red-900/50 bg-red-950/40 text-red-300 px-3 py-2 text-sm">
          {err}
        </div>
      )}

      <button
        className="btn w-full"
        onClick={onSubmit}
        disabled={loading}
      >
        {loading ? "Creating…" : "Create account"}
      </button>

      <p className="text-sm text-neutral-400">
        You’ll be redirected to your profile.
      </p>
    </section>
  );
}
