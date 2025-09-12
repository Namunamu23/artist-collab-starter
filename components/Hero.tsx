import Link from "next/link";

export default function Hero() {
  return (
    <section className="container py-16 md:py-24 grid md:grid-cols-2 gap-8 items-center">
      <div className="space-y-6">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
          Turn <span className="text-brand">likes</span> into real <span className="text-brand">collaborations</span>.
        </h1>
        <p className="text-neutral-300 text-lg">
          Showcase your work, find complementary artists, and spin up projects with built‑in tools and fair credits.
        </p>
        <div className="flex gap-3">
          <Link href="/signup" className="btn">Get started</Link>
          <Link href="/explore" className="btn bg-neutral-800 border border-neutral-700">Explore artists</Link>
        </div>
        <div className="flex gap-2">
          <span className="badge">NYC</span>
          <span className="badge">Illustration</span>
          <span className="badge">Photography</span>
          <span className="badge">Murals</span>
        </div>
      </div>
      <div className="card p-4 md:p-8">
        <div className="grid grid-cols-3 gap-3">
          {Array.from({length:9}).map((_,i)=>(
            <div key={i} className="aspect-square rounded-xl bg-neutral-800/80 border border-neutral-700" />
          ))}
        </div>
        <p className="text-sm text-neutral-400 mt-4">Drag & drop to build your portfolio grid.</p>
      </div>
    </section>
  );
}
