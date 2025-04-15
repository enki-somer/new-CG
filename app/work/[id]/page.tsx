import { notFound } from "next/navigation";
import { firestore } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { ArtworkItem } from "@/types/artwork";
import { Metadata } from "next";
import ArtworkClient from "./artwork-client";

interface Props {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const docRef = doc(firestore, "artworks", params.id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return {
        title: "Artwork Not Found",
      };
    }

    const artwork = docSnap.data() as ArtworkItem;

    return {
      title: `${artwork.title} | CG Art Gallery`,
      description: artwork.description,
      openGraph: {
        images: [artwork.image],
      },
    };
  } catch (error) {
    console.error("Error fetching artwork metadata:", error);
    return {
      title: "Artwork",
    };
  }
}

export default async function ArtworkPage({ params }: Props) {
  try {
    const docRef = doc(firestore, "artworks", params.id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      notFound();
    }

    const artwork = { id: docSnap.id, ...docSnap.data() } as ArtworkItem;

    return <ArtworkClient artwork={artwork} />;
  } catch (error) {
    console.error("Error fetching artwork:", error);
    notFound();
  }
}
