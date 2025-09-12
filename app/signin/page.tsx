"use client";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { alert(error.message); setLoading(false); return; }
    router.push("/profile");
  }

  return (
    <section className="container py-10 max-w-md space-y-4">
      <h1 className="text-3xl font-bold">Sign in</h1>
      <input className="input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <button className="btn w-full" onClick={onSubmit} disabled={loading}>{loading ? "Signing in…" : "Continue"}</button>
    </section>
  );
}
