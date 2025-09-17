"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  const prefersReduced = useReducedMotion();

  // child animation (used per-element, not on a parent wrapper)
  const fadeUp = {
    hidden: { opacity: 0, y: prefersReduced ? 0 : 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
  };

  return (
    <section
      className="relative z-0 border-b border-neutral-900 bg-[radial-gradient(1200px_600px_at_20%_-10%,rgba(168,85,247,0.08),transparent),radial-gradient(900px_500px_at_110%_10%,rgba(34,197,94,0.06),transparent)]"
      aria-labelledby="hero-heading"
    >
      {/* Content container */}
      <div className="container relative z-10 grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
        {/* Left */}
        <div className="space-y-6">
          <motion.h1
            id="hero-heading"
            className="text-4xl font-extrabold tracking-tight text-white md:text-6xl"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.6 }}
          >
            Turn <span className="text-brand">likes</span> into real{" "}
            <span className="text-brand">collaborations</span>.
          </motion.h1>

          <motion.p
            className="max-w-lg text-lg leading-relaxed text-neutral-300"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.6 }}
          >
            Show your work, find complementary artists, and spin up projects
            with built-in tools, shared credits, and fair splits.
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-3"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.6 }}
          >
            <Link
              href="/signup"
              aria-label="Create an account"
              className="btn inline-flex items-center gap-2"
            >
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/explore"
              aria-label="Explore artists"
              className="inline-flex items-center justify-center rounded-xl border border-neutral-700 bg-neutral-900/50 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
            >
              Explore artists
            </Link>
          </motion.div>

          <motion.div
            className="flex gap-2 overflow-x-auto -mx-1 py-1 pr-2"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.6 }}
            aria-label="Popular tags"
          >
            {["NYC", "Illustration", "Photography", "Murals", "3D", "Digital collage"].map(
              (tag) => (
                <span key={tag} className="badge select-none whitespace-nowrap">
                  {tag}
                </span>
              )
            )}
          </motion.div>
        </div>

        {/* Right */}
        <motion.div
          className="card relative z-10 p-4 md:p-8"
          initial={{ opacity: 0, y: prefersReduced ? 0 : 20, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <motion.div
                key={i}
                className="aspect-square rounded-xl border border-neutral-700 bg-neutral-800/80"
                initial={{ opacity: 0, y: prefersReduced ? 0 : 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.3, delay: prefersReduced ? 0 : i * 0.04 }}
              />
            ))}
          </div>
          <p className="mt-4 text-sm text-neutral-400">
            Drag & drop to build your portfolio grid.
          </p>
        </motion.div>
      </div>

      {/* Subtle glow behind (z below content so it never covers it) */}
      <div className="pointer-events-none absolute -right-6 -top-6 z-0 h-20 w-20 rounded-full bg-brand/10 blur-2xl" />
    </section>
  );
}
