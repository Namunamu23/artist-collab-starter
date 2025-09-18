import "./globals.css";
import type { Metadata } from "next";
import NavBar from "../components/NavBar";


export const metadata: Metadata = {
  title: "ArtistCollab — Find collaborators, build projects",
  description: "A creative network where your art sparks projects, credits, and income.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <NavBar />
        <main>{children}</main>
        <footer className="container py-10 text-sm text-neutral-400">
          Built with ❤️ — This is an MVP starter. Connect Supabase env vars to enable backend.
        </footer>
      </body>
    </html>
  );
}
