import Image from "next/image";
import Link from "next/link";
import { ArtworkItem } from "@/types/artwork";

interface Props {
  artwork: ArtworkItem;
}

export default function WorkCard({ artwork }: Props) {
  return (
    <Link
      href={`/work/${artwork.id}`}
      className="group relative block aspect-square overflow-hidden rounded-lg bg-black/50 transition-transform duration-300 hover:scale-[1.02]"
    >
      <Image
        src={artwork.image}
        alt={artwork.title}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-110"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <h3 className="text-xl font-bold">{artwork.title}</h3>
        <p className="mt-2 text-sm text-white/80">{artwork.category}</p>
      </div>
    </Link>
  );
}
