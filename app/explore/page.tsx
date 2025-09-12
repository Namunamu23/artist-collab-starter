"use client";
import { supabase } from "@/lib/supabaseClient";
import ArtistCard, { Artist } from "@/components/ArtistCard";
import { useEffect, useMemo, useState } from "react";

export default function ExplorePage() {
  const [q, setQ] = useState("");
  const [data, setData] = useState<Artist[]>([]);

  useEffect(() => {
    (async () => {
      const { data: rows, error } = await supabase
        .from("profiles")
        .select("id, display_name, city, mediums, intents, avatar_url")
        .limit(60);
      if (error) { console.error(error); return; }
      setData((rows || []).map(r => ({
        id: r.id,
        name: r.display_name,
        city: r.city || "—",
        mediums: (r.mediums as string[] | null) || [],
        intents: (r.intents as string[] | null) || [],
        avatar: r.avatar_url || "https://picsum.photos/seed/fallback/100"
      })));
    })();
  }, []);

  const filtered = useMemo(() => {
    const term = q.toLowerCase();
    return data.filter(a =>
      a.name.toLowerCase().includes(term) ||
      a.city.toLowerCase().includes(term) ||
      a.mediums.some(m => m.toLowerCase().includes(term)) ||
      a.intents.some(i => i.toLowerCase().includes(term))
    );
  }, [q, data]);

  return (
    <section className="container py-10 space-y-6">
      <h1 className="text-3xl font-bold">Explore artists</h1>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name, city, medium, intent..." className="input" />
      <div className="grid md:grid-cols-3 gap-4">
        {filtered.map(a => <ArtistCard key={a.id} artist={a} />)}
      </div>
    </section>
  );
}
