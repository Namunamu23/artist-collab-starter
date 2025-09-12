import { artists } from "@/lib/mockData";
import { notFound } from "next/navigation";

export default function ArtistProfile({ params }: { params: { id: string }}) {
  const artist = artists.find(a=>a.id===params.id);
  if(!artist) return notFound();
  return (
    <section className="container py-10 space-y-6">
      <div className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={artist.avatar} alt={artist.name} className="h-16 w-16 rounded-full object-cover" />
        <div>
          <h1 className="text-3xl font-bold">{artist.name}</h1>
          <div className="text-neutral-400">{artist.city}</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {artist.mediums.map(m => <span key={m} className="badge">{m}</span>)}
        {artist.intents.map(m => <span key={m} className="badge">{m}</span>)}
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        {Array.from({length:9}).map((_,i)=>(
          <div key={i} className="aspect-square rounded-xl bg-neutral-800/80 border border-neutral-700" />
        ))}
      </div>
    </section>
  );
}
