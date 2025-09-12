"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Plus, Lock, Globe, ChevronRight } from "lucide-react";

type ProjectRow = {
  id: string;
  owner_id: string;
  title: string;
  brief: string | null;
  is_public: boolean | null;
  created_at: string;
};

export default function ProjectsPage() {
  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ProjectRow[]>([]);
  const [showNew, setShowNew] = useState(false);

  // New-project form state
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);
  const canCreate = title.trim().length >= 3;

  useEffect(() => {
    (async () => {
      // who am I?
      const { data: auth } = await supabase.auth.getUser();
      const me = auth.user?.id ?? null;
      setUid(me);

      // fetch projects I can see (RLS: owner or member or public)
      // We'll still filter client-side to show "Mine" first.
      const { data, error } = await supabase
        .from("projects")
        .select("id, owner_id, title, brief, is_public, created_at")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        console.error(error);
      } else {
        setRows(data ?? []);
      }
      setLoading(false);
    })();
  }, []);

  const mine = useMemo(() => rows.filter(p => p.owner_id === uid), [rows, uid]);
  // RLS lets members read, but we can fetch membership separately for exactness.
  // Simpler: "Shared with me" = visible but not owned.
  const shared = useMemo(() => rows.filter(p => p.owner_id !== uid), [rows, uid]);

  async function createProject() {
    if (!uid || !canCreate) return;
    setSaving(true);

    // 1) create the project
    const { data: proj, error: projErr } = await supabase
      .from("projects")
      .insert({
        owner_id: uid,
        title: title.trim(),
        brief: brief.trim() || null,
        is_public: isPublic,
      })
      .select("id")
      .single();

    if (projErr) {
      setSaving(false);
      alert(projErr.message);
      return;
    }

    // 2) ensure owner is also a member (prevents recursion edge-cases and lets owner see roles)
    const { error: roleErr } = await supabase
      .from("project_roles")
      .insert({
        project_id: proj!.id,
        profile_id: uid,
        role: "Owner",
        share_pct: 100
      });

    setSaving(false);

    if (roleErr) {
      // Not fatal for project creation, but useful to know
      console.warn("Could not add owner role row:", roleErr.message);
    }

    // go to detail
    window.location.href = `/projects/${proj!.id}`;
  }

  return (
    <section className="container py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Projects</h1>
        <button
          className="btn flex items-center gap-2"
          onClick={() => setShowNew(true)}
          disabled={!uid}
          title={uid ? "Create a new project" : "Sign in to create"}
        >
          <Plus className="h-4 w-4" />
          New project
        </button>
      </div>

      {!uid && (
        <div className="card p-4 text-sm text-neutral-300">
          You’re not signed in. <a className="underline" href="/signin">Sign in</a> to create and manage projects.
        </div>
      )}

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-4 h-28 animate-pulse bg-neutral-900/50" />
          ))}
        </div>
      ) : (
        <>
          <Section title="My projects" emptyText="You have no projects yet.">
            {mine.map(p => <ProjectItem key={p.id} p={p} />)}
          </Section>

          <Section title="Shared with me & public" emptyText="Nothing here yet.">
            {shared.map(p => <ProjectItem key={p.id} p={p} />)}
          </Section>
        </>
      )}

      {/* New Project Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">New project</h2>
              <button className="px-2 py-1 rounded-lg hover:bg-neutral-900" onClick={() => setShowNew(false)}>✕</button>
            </div>

            <input
              className="input"
              placeholder="Title (e.g., City Rhythms)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className="input min-h-28"
              placeholder="Brief (what's the concept, what collaborators do you need?)"
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
            />

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              Make project public (visible to everyone)
            </label>

            <div className="flex justify-end gap-2">
              <button className="px-3 py-2 rounded-xl hover:bg-neutral-900" onClick={() => setShowNew(false)}>
                Cancel
              </button>
              <button className="btn" onClick={createProject} disabled={!canCreate || saving || !uid}>
                {saving ? "Creating…" : "Create project"}
              </button>
            </div>

            {!uid && <p className="text-xs text-red-400">You must be signed in.</p>}
          </div>
        </div>
      )}
    </section>
  );
}

function Section({
  title,
  children,
  emptyText,
}: {
  title: string;
  children: React.ReactNode;
  emptyText: string;
}) {
  const isEmpty = Array.isArray(children) ? (children as any[]).length === 0 : false;
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {isEmpty ? (
        <div className="card p-4 text-neutral-400 text-sm">{emptyText}</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">{children}</div>
      )}
    </div>
  );
}

function ProjectItem({ p }: { p: ProjectRow }) {
  const Icon = p.is_public ? Globe : Lock;
  return (
    <Link href={`/projects/${p.id}`} className="card p-4 group hover:shadow-lg transition">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <h3 className="font-semibold">{p.title}</h3>
          </div>
          {p.brief ? (
            <p className="text-sm text-neutral-400 line-clamp-2">{p.brief}</p>
          ) : (
            <p className="text-sm text-neutral-500 italic">No description yet</p>
          )}
        </div>
        <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition" />
      </div>
      <p className="text-xs text-neutral-500 mt-3">
        {new Date(p.created_at).toLocaleString()}
      </p>
    </Link>
  );
}
