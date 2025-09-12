import Hero from "@/components/Hero";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <Hero />
      <section className="container grid md:grid-cols-3 gap-4 pb-16">
        <div className="card p-6">
          <h3 className="font-semibold text-lg">Discover</h3>
          <p className="text-neutral-400 mt-2">Find artists by medium, style, and location.</p>
          <Link className="btn mt-4" href="/explore">Explore artists</Link>
        </div>
        <div className="card p-6">
          <h3 className="font-semibold text-lg">Collaborate</h3>
          <p className="text-neutral-400 mt-2">Spin up projects with briefs, roles, tasks, and chat.</p>
          <Link className="btn mt-4" href="/projects">Open projects</Link>
        </div>
        <div className="card p-6">
          <h3 className="font-semibold text-lg">Showcase</h3>
          <p className="text-neutral-400 mt-2">Publish case studies and credit collaborators.</p>
          <Link className="btn mt-4" href="/profile">Your profile</Link>
        </div>
      </section>
    </>
  );
}
