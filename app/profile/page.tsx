"use client";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Profile = {
  id: string;
  handle: string;
  display_name: string;
  city: string | null;
  bio: string | null;
  avatar_url: string | null;
  mediums: string[] | null;
  intents: string[] | null;
};

export default function ProfilePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [p, setP] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const id = auth.user?.id || null;
      setUserId(id);
      if (!id) return; // not signed in
      const { data: rows, error } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
      if (error) { console.error(error); return; }
      setP(rows as Profile);
    })();
  }, []);

  async function save() {
    if (!userId || !p) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      handle: p.handle,
      display_name: p.display_name,
      city: p.city,
      bio: p.bio,
      avatar_url: p.avatar_url,
      mediums: p.mediums,
      intents: p.intents
    }).eq("id", userId);
    setSaving(false);
    if (error) { alert(error.message); return; }
    alert("Saved!");
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (!userId) {
    return (
      <section className="container py-10 space-y-4">
        <h1 className="text-3xl font-bold">Your profile</h1>
        <p className="text-neutral-300">You’re not signed in.</p>
        <a className="btn" href="/signin">Sign in</a>
        <a className="btn bg-neutral-800 border border-neutral-700" href="/signup">Create account</a>
      </section>
    );
  }

  if (!p) {
    return <section className="container py-10"><div className="card p-4">Loading…</div></section>;
  }

  return (
    <section className="container py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your profile</h1>
        <button className="btn bg-neutral-800 border border-neutral-700" onClick={signOut}>Sign out</button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-4 space-y-3">
          <input className="input" placeholder="Handle" value={p.handle} onChange={e => setP({ ...p, handle: e.target.value })} />
          <input className="input" placeholder="Display name" value={p.display_name} onChange={e => setP({ ...p, display_name: e.target.value })} />
          <input className="input" placeholder="City" value={p.city || ""} onChange={e => setP({ ...p, city: e.target.value })} />
          <textarea className="input min-h-32" placeholder="Bio" value={p.bio || ""} onChange={e => setP({ ...p, bio: e.target.value })} />
          <input className="input" placeholder="Avatar URL" value={p.avatar_url || ""} onChange={e => setP({ ...p, avatar_url: e.target.value })} />
          <input className="input" placeholder="Mediums (comma separated)"
            value={(p.mediums || []).join(", ")}
            onChange={e => setP({ ...p, mediums: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} />
          <input className="input" placeholder="Intents (comma separated)"
            value={(p.intents || []).join(", ")}
            onChange={e => setP({ ...p, intents: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} />
          <button className="btn" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
        </div>

        <div className="card p-4">
          <h3 className="font-semibold mb-2">Portfolio</h3>
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (<div key={i} className="aspect-square rounded-xl bg-neutral-800/80 border border-neutral-700" />))}
          </div>
          <button className="btn mt-3">Upload work</button>
          <p className="text-sm text-neutral-400 mt-2">Uploads coming next (private storage + watermarked previews).</p>
        </div>
      </div>
    </section>
  );
}
