import Image from "next/image";
import Link from "next/link";

export type Artist = {
  id: string;
  name: string;
  city: string;
  mediums: string[];
  intents: string[];
  avatar: string;
};

export default function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <Link href={`/artist/${artist.id}`} className="card p-4 hover:scale-[1.01] transition block">
      <div className="flex items-center gap-3">
        <Image src={artist.avatar} alt={artist.name} width={48} height={48} className="rounded-full object-cover" />
        <div className="flex-1">
          <div className="font-semibold leading-tight">{artist.name}</div>
          <div className="text-sm text-neutral-400">{artist.city}</div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {artist.mediums.map(m => <span key={m} className="badge">{m}</span>)}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {artist.intents.map(m => <span key={m} className="badge">{m}</span>)}
      </div>
    </Link>
  );
}
