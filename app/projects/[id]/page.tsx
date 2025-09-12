"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  MessageSquareText,
  ListTodo,
  Users,
  Send,
  Plus,
  Trash2,
  CornerDownLeft,
} from "lucide-react";

type Project = {
  id: string;
  owner_id: string;
  title: string;
  brief: string | null;
  is_public: boolean | null;
  created_at: string;
};
type Task = {
  id: string;
  project_id: string;
  title: string;
  status: "todo" | "doing" | "done";
  assignee_id: string | null;
  due_date: string | null;
  created_at?: string | null;
};
type Msg = {
  id: string;
  project_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};
type MyRoleRow = {
  project_id: string;
  profile_id: string;
  role: string | null;
  share_pct: number | null;
};
type MemberRow = {
  profile_id: string;
  handle: string;
  display_name: string;
  role: string | null;
  share_pct: number | null;
};

type TabKey = "tasks" | "chat" | "members";

export default function ProjectDetail() {
  const { id: pid } = useParams<{ id: string }>();
  const router = useRouter();

  const [me, setMe] = useState<string | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [tab, setTab] = useState<TabKey>("tasks");

  // tasks
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [savingTask, setSavingTask] = useState(false);

  // chat
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [msgBody, setMsgBody] = useState("");
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // members
  const [myRole, setMyRole] = useState<MyRoleRow | null>(null);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [inviteHandle, setInviteHandle] = useState("");
  const [inviteShare, setInviteShare] = useState<number>(20);
  const [inviting, setInviting] = useState(false);

  // ---------- Load base data ----------
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id ?? null;
      if (!isMounted) return;
      setMe(uid);

      // Project (RLS: owner/member/public)
      const { data: p } = await supabase
        .from("projects")
        .select("id, owner_id, title, brief, is_public, created_at")
        .eq("id", pid)
        .maybeSingle();
      if (!isMounted) return;
      setProject((p || null) as Project | null);

      // My membership row (non-recursive policy returns only my row)
      if (uid) {
        const { data: role } = await supabase
          .from("project_roles")
          .select("project_id, profile_id, role, share_pct")
          .eq("project_id", pid)
          .eq("profile_id", uid)
          .maybeSingle();
        if (!isMounted) return;
        setMyRole((role || null) as MyRoleRow | null);
      }

      // initial loads
      await refreshTasks();
      await refreshMsgs();
      await refreshMembers();
    })();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pid]);

  const iAmOwner = useMemo(
    () => Boolean(project && me && project.owner_id === me),
    [project, me]
  );

  // ---------- Realtime wiring ----------
  // ---------- Realtime wiring ----------
  useEffect(() => {
    if (!pid) return;

    const tasksChannel = supabase
      .channel(`tasks-${pid}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "project_tasks" },
        (payload) => {
          const evt = payload.eventType;
          const row = (payload.new ?? null) as Task | null;
          const old = (payload.old ?? null) as Partial<Task> | null;

          setTasks((prev) => {
            if ((evt === "INSERT" || evt === "UPDATE") && row) {
              // Only accept rows for this project
              if (String(row.project_id) !== String(pid)) return prev;

              if (evt === "INSERT") {
                if (prev.some(t => t.id === row.id)) return prev;
                return [...prev, row].sort(byCreated);
              }
              // UPDATE
              return prev.map(t => t.id === row.id ? { ...t, ...row } : t).sort(byCreated);
            }

            if (evt === "DELETE" && old?.id) {
              // We may not have old.project_id; if we currently render this id, remove it.
              if (!prev.some(t => t.id === old.id)) return prev;
              return prev.filter(t => t.id !== old.id);
            }

            return prev;
          });
        }
      )
      .subscribe();


    const chatChannel = supabase
      .channel(`chat-${pid}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `project_id=eq.${pid}` },
        (payload) => {
          const row = payload.new as Msg;
          setMsgs((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev;
            const next = [...prev, row];
            setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 0);
            return next;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(chatChannel);
    };
  }, [pid]);



  // ---------- Helpers ----------
  function byCreated(a: Task, b: Task) {
    const ca = a.created_at ? new Date(a.created_at).getTime() : 0;
    const cb = b.created_at ? new Date(b.created_at).getTime() : 0;
    if (ca !== cb) return ca - cb;
    return a.id.localeCompare(b.id);
  }


  async function refreshTasks() {
    const { data, error } = await supabase
      .from("project_tasks")
      .select("*")
      .eq("project_id", pid)
      .order("created_at", { ascending: true });
    if (error) {
      console.error("tasks fetch error:", error);
      return;
    }
    setTasks((data || []) as Task[]);
  }

  async function addTask() {
    const title = newTask.trim();
    if (!title) return;
    setSavingTask(true);
    const { error } = await supabase.from("project_tasks").insert({
      project_id: pid,
      title,
      status: "todo",
    });
    setSavingTask(false);
    if (error) {
      alert(error.message);
      return;
    }
    setNewTask("");
    // realtime will deliver the new row; no manual refresh needed
  }

  async function setStatus(taskId: string, status: Task["status"]) {
    const { error } = await supabase
      .from("project_tasks")
      .update({ status })
      .eq("id", taskId);
    if (error) {
      alert(error.message);
      return;
    }
    // realtime will patch the row
  }

  async function deleteTask(taskId: string) {
    if (!confirm("Delete this task?")) return;

    // Optimistic remove so the deleter sees it vanish instantly
    setTasks(ts => ts.filter(t => t.id !== taskId));

    const { error } = await supabase
      .from("project_tasks")
      .delete()
      .eq("id", taskId);

    if (error) {
      alert(error.message);
      // Roll back by refetching if the delete failed
      await refreshTasks();
    }
  }

  async function refreshMsgs() {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("project_id", pid)
      .order("created_at", { ascending: true });
    if (error) {
      console.error(error);
      return;
    }
    setMsgs((data || []) as Msg[]);
    setTimeout(
      () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      0
    );
  }

  async function sendMsg() {
    const body = msgBody.trim();
    if (!body || !me) return;
    setSending(true);
    const { error } = await supabase
      .from("messages")
      .insert({ project_id: pid, sender_id: me, body });
    setSending(false);
    if (error) {
      alert(error.message);
      return;
    }
    setMsgBody("");
    // realtime will append the message
  }

  async function refreshMembers() {
    const { data, error } = await supabase.rpc("list_project_members", {
      p_project_id: pid as string,
    });
    if (error) {
      console.error("members fetch error:", error);
      setMembers([]);
      return;
    }
    setMembers((data || []) as MemberRow[]);
  }

  async function inviteMember() {
    if (!iAmOwner) {
      alert("Only the owner can invite collaborators.");
      return;
    }
    const handleRaw = inviteHandle.trim();
    if (!handleRaw) return;

    const handle = handleRaw.startsWith("@")
      ? handleRaw.slice(1)
      : handleRaw;
    const share = Number.isFinite(inviteShare) ? inviteShare : 0;

    setInviting(true);

    // find profile by handle
    const { data: prof, error: profErr } = await supabase
      .from("profiles")
      .select("id")
      .eq("handle", handle)
      .maybeSingle();
    if (profErr) {
      setInviting(false);
      alert(profErr.message);
      return;
    }
    if (!prof) {
      setInviting(false);
      alert("No artist with that handle.");
      return;
    }

    // add role row (owner-only policy)
    const { error: roleErr } = await supabase.from("project_roles").insert({
      project_id: pid,
      profile_id: prof.id,
      role: "Collaborator",
      share_pct: share,
    });
    setInviting(false);
    if (roleErr) {
      alert(roleErr.message);
      return;
    }

    setInviteHandle("");
    setInviteShare(20);
    await refreshMembers();
  }

  if (!project) {
    return (
      <section className="container py-10">
        <div className="card p-4">
          Project not found or you don’t have access.
        </div>
        <button
          className="px-3 py-1 rounded-lg hover:bg-neutral-900 text-sm mt-3"
          onClick={() => router.push("/projects")}
        >
          ← Back to Projects
        </button>
      </section>
    );
  }

  return (
    <section className="container py-10 space-y-6">
      <button
        className="px-3 py-1 rounded-lg hover:bg-neutral-900 text-sm"
        onClick={() => router.back()}
      >
        &larr; Back
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{project.title}</h1>
          <p className="text-neutral-400">
            {project.brief || "No description yet."}
          </p>
        </div>
        <div className="text-right text-sm text-neutral-500">
          <div>Created: {new Date(project.created_at).toLocaleString()}</div>
          <div>Visibility: {project.is_public ? "Public" : "Private"}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <TabBtn
          active={tab === "tasks"}
          onClick={() => setTab("tasks")}
          icon={ListTodo}
          label="Tasks"
        />
        <TabBtn
          active={tab === "chat"}
          onClick={() => setTab("chat")}
          icon={MessageSquareText}
          label="Chat"
        />
        <TabBtn
          active={tab === "members"}
          onClick={() => setTab("members")}
          icon={Users}
          label="Members"
        />
      </div>

      {tab === "tasks" && (
        <div className="grid md:grid-cols-3 gap-4">
          {(["todo", "doing", "done"] as const).map((col) => (
            <div key={col} className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold capitalize">{col}</h3>
                {col === "todo" && (
                  <div className="flex gap-2">
                    <input
                      className="input"
                      placeholder="New task"
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addTask();
                      }}
                    />
                    <button
                      className="btn"
                      onClick={addTask}
                      disabled={savingTask || !newTask.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {tasks
                  .filter((t) => t.status === col)
                  .map((t) => (
                    <TaskCard
                      key={t.id}
                      t={t}
                      onSetStatus={setStatus}
                      onDelete={deleteTask}
                    />
                  ))}
                {tasks.filter((t) => t.status === col).length === 0 && (
                  <p className="text-sm text-neutral-500">No tasks.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "chat" && (
        <div className="card p-0 overflow-hidden">
          <div className="p-4 h-[48vh] overflow-y-auto">
            {msgs.length === 0 && (
              <p className="text-sm text-neutral-500">No messages yet.</p>
            )}
            {msgs.map((m) => (
              <div key={m.id} className="mb-3">
                <div className="text-xs text-neutral-500">
                  {new Date(m.created_at).toLocaleString()}
                </div>
                <div
                  className={`mt-1 rounded-xl p-3 ${m.sender_id === me
                    ? "bg-neutral-700/60"
                    : "bg-neutral-900/70"
                    }`}
                >
                  {m.body}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="p-3 border-t border-neutral-800 flex gap-2">
            <input
              className="input flex-1"
              placeholder="Write a message…"
              value={msgBody}
              onChange={(e) => setMsgBody(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMsg();
                }
              }}
            />
            <button
              className="btn flex items-center gap-2"
              onClick={sendMsg}
              disabled={!msgBody.trim() || sending}
            >
              <Send className="h-4 w-4" />
              <span className="hidden md:inline">Send</span>
              <CornerDownLeft className="h-4 w-4 md:hidden" />
            </button>
          </div>
        </div>
      )}

      {tab === "members" && (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="card p-4 space-y-2">
            <h3 className="font-semibold">Your membership</h3>
            {myRole ? (
              <div className="text-sm">
                <div>Role: {myRole.role || "Member"}</div>
                <div>Share: {myRole.share_pct ?? 0}%</div>
              </div>
            ) : (
              <p className="text-sm text-neutral-500">
                You don’t have a role row (owner might not have added one yet).
              </p>
            )}
          </div>

          <div className="card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Invite collaborator (by handle)</h3>
              {!iAmOwner && (
                <span className="text-xs text-neutral-500">Owner only</span>
              )}
            </div>
            <div className="flex flex-col md:flex-row gap-2">
              <input
                className="input flex-1"
                placeholder="@handle"
                value={inviteHandle}
                onChange={(e) => setInviteHandle(e.target.value)}
              />
              <input
                className="input w-36"
                type="number"
                min={0}
                max={100}
                value={inviteShare}
                onChange={(e) =>
                  setInviteShare(
                    Number.isFinite(parseInt(e.target.value, 10))
                      ? parseInt(e.target.value, 10)
                      : 0
                  )
                }
              />
              <button
                className="btn"
                onClick={inviteMember}
                disabled={!iAmOwner || inviting || !inviteHandle.trim()}
              >
                Invite
              </button>
            </div>
            <p className="text-xs text-neutral-500">
              After inviting, collaborators can access this project via RLS.
            </p>
          </div>

          <div className="card p-4 md:col-span-2 space-y-3">
            <h3 className="font-semibold">Members</h3>
            {members.length === 0 ? (
              <p className="text-sm text-neutral-500">No members yet.</p>
            ) : (
              <div className="divide-y divide-neutral-800">
                {members.map((m) => (
                  <div
                    key={m.profile_id}
                    className="py-2 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium">{m.display_name}</div>
                      <div className="text-xs text-neutral-500">
                        @{m.handle}
                      </div>
                    </div>
                    <div className="text-sm text-neutral-400">
                      <span className="mr-3">{m.role || "Member"}</span>
                      <span>{m.share_pct ?? 0}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function TabBtn({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: any;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-xl flex items-center gap-2 hover:bg-neutral-900 ${active ? "bg-neutral-900" : ""
        }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function TaskCard({
  t,
  onSetStatus,
  onDelete,
}: {
  t: Task;
  onSetStatus: (id: string, s: Task["status"]) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
      <div className="flex items-center justify-between">
        <div className="font-medium">{t.title}</div>
        <button
          className="text-neutral-400 hover:text-red-400"
          title="Delete"
          onClick={() => onDelete(t.id)}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-2 flex gap-2 text-xs">
        {(["todo", "doing", "done"] as const).map((s) => (
          <button
            key={s}
            className={`px-2 py-1 rounded-lg border ${t.status === s
              ? "bg-neutral-800 border-neutral-700"
              : "border-transparent hover:bg-neutral-800/60"
              }`}
            onClick={() => onSetStatus(t.id, s)}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
