"use client";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [handle, setHandle] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit() {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) { alert(error.message); setLoading(false); return; }
    const userId = data.user?.id;
    if (userId) {
      const { error: upErr } = await supabase.from("profiles").insert({
        id: userId, handle, display_name: name, mediums: [], intents: []
      });
      if (upErr) { alert(upErr.message); setLoading(false); return; }
    }
    router.push("/profile");
  }

  return (
    <section className="container py-10 max-w-md space-y-4">
      <h1 className="text-3xl font-bold">Create your account</h1>
      <input className="input" placeholder="Handle (unique)" value={handle} onChange={e => setHandle(e.target.value)} />
      <input className="input" placeholder="Display name" value={name} onChange={e => setName(e.target.value)} />
      <input className="input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <button className="btn w-full" onClick={onSubmit} disabled={loading}>{loading ? "Creating…" : "Create account"}</button>
      <p className="text-sm text-neutral-400">You’ll be redirected to your profile.</p>
    </section>
  );
}
