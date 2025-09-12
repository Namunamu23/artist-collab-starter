"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Paintbrush, Users, Sparkles, Search, SquarePen, LogOut, LogIn, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const links = [
  { href: "/", label: "Home", icon: Sparkles },
  { href: "/explore", label: "Explore", icon: Search },
  { href: "/projects", label: "Projects", icon: Paintbrush },
  { href: "/profile", label: "Profile", icon: Users }
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    // initial read
    (async () => {
      const { data } = await supabase.auth.getUser();
      setSignedIn(Boolean(data.user));
    })();
    // subscribe to changes
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setSignedIn(Boolean(session?.user));
    });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-40 backdrop-blur border-b border-neutral-800 bg-neutral-950/60">
      <div className="container flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <SquarePen className="h-5 w-5" />
          ArtistCollab
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`px-3 py-2 rounded-xl flex items-center gap-2 hover:bg-neutral-900 transition-colors ${pathname === href ? "bg-neutral-900" : ""
                }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {signedIn ? (
            <button
              onClick={signOut}
              className="px-3 py-2 rounded-xl hover:bg-neutral-900 flex items-center gap-2"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          ) : (
            <>
              <Link href="/signin" className="px-3 py-2 rounded-xl hover:bg-neutral-900 flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Sign in
              </Link>
              <Link href="/signup" className="btn flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
