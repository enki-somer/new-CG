"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";

interface ArtworkItem {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
}

// Add a fallback list of artworks to use when API fails
const fallbackArtworks: ArtworkItem[] = [
  {
    id: "1",
    title: "Mystical Forest",
    category: "Environment",
    image: "/images/cg (1).jpg",
    description:
      "A serene and enchanting forest environment with magical elements.",
  },
  {
    id: "2",
    title: "Futuristic City",
    category: "Environment",
    image: "/images/cg (2).jpg",
    description:
      "A sprawling metropolis showcasing advanced architecture and technology.",
  },
  {
    id: "3",
    title: "Digital Warrior",
    category: "3D Character",
    image: "/images/cg (3).jpg",
    description:
      "A detailed character design blending traditional and futuristic elements.",
  },
  {
    id: "4",
    title: "Ancient Temple",
    category: "Environment",
    image: "/images/cg (4).jpg",
    description:
      "A mysterious temple environment with intricate architectural details.",
  },
  {
    id: "5",
    title: "Cyber Realm",
    category: "Concept Art",
    image: "/images/cg (5).jpg",
    description:
      "A conceptual piece exploring themes of technology and nature.",
  },
];

export default function WorkPage() {
  const [artworks, setArtworks] = useState<ArtworkItem[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isContentVisible, setIsContentVisible] = useState(false);

  useEffect(() => {
    // Show content after a brief delay to ensure smooth transition
    const timer = setTimeout(() => {
      setIsContentVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        // Add retries and improved error handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        // Add timestamp to prevent browser caching
        const timestamp = new Date().getTime();
        const random = Math.random();

        // Try with multiple cache-busting techniques
        const response = await fetch(
          `/api/artworks?t=${timestamp}&r=${random}`,
          {
            next: { revalidate: 0 }, // Don't cache
            signal: controller.signal,
            headers: {
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              "x-force-revalidate": "true",
            },
            cache: "no-store",
          }
        )
          .catch(async () => {
            // Retry on failure with different approach
            console.log("Retrying artwork fetch without cache");
            return await fetch("/api/artworks", {
              cache: "no-store",
              headers: { "x-force-revalidate": "true" },
            });
          })
          .catch(async () => {
            // Third fallback attempt with different URL parameter
            console.log("Third attempt for artwork fetch");
            return await fetch(`/api/artworks?nocache=${Math.random()}`, {
              cache: "no-store",
            });
          });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Failed to fetch artworks: ${response.status}`);
        }

        const data = await response.json();

        // Verify we got an array with items
        if (Array.isArray(data) && data.length > 0) {
          console.log(`Loaded ${data.length} artworks successfully`);
          setArtworks(data);

          // Show their IDs for debugging
          console.log("Artwork IDs loaded:", data.map((a) => a.id).join(", "));
        } else {
          console.warn(
            "API returned empty artworks array, using fallback data"
          );
          setArtworks(fallbackArtworks);
        }
      } catch (error) {
        console.error("Failed to load artworks:", error);
        setError(
          "Unable to load artworks from server. Showing fallback gallery."
        );
        // Use fallback data on error
        setArtworks(fallbackArtworks);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchArtworks();

    // Remove the duplicate fetch after 2 seconds
    // const refreshTimer = setTimeout(() => {
    //   console.log("Performing second artwork fetch to check for updates...");
    //   fetchArtworks();
    // }, 2000);

    // return () => clearTimeout(refreshTimer);

    // Simple cleanup function
    return () => {};
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-primary/5 to-black pt-24">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isContentVisible ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <h1 className="mb-4 text-4xl font-bold tracking-tighter text-white sm:text-5xl md:text-6xl">
            The{" "}
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: isContentVisible ? 1 : 0,
                y: isContentVisible ? 0 : 20,
              }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gradient-to-r from-primary-light via-accent to-primary bg-clip-text text-transparent"
            >
              Artwork
            </motion.span>
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: isContentVisible ? 1 : 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mx-auto max-w-[600px] text-lg text-gray-400/90"
          >
            A showcase of my creative work in CG artistry and digital design
          </motion.p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-lg bg-danger/10 p-4 text-center text-danger backdrop-blur-sm"
          >
            {error}
          </motion.div>
        )}

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? // Skeleton loading state
              Array.from({ length: 9 }).map((_, index) => (
                <div
                  key={index}
                  className="relative overflow-hidden rounded-xl bg-gradient-glass p-1 shadow-glow backdrop-blur-sm"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-primary/5">
                    <div className="absolute inset-0 animate-pulse bg-primary/10" />
                  </div>
                </div>
              ))
            : artworks.map((artwork, index) => (
                <Link href={`/work/${artwork.id}`} key={artwork.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-white/5 to-white/10 p-1 backdrop-blur-sm"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                      <Image
                        src={artwork.image}
                        alt={artwork.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <div className="absolute inset-0 flex items-end p-6 opacity-0 transition-all duration-300 group-hover:opacity-100">
                        <div className="w-full">
                          <h3 className="mb-2 text-xl font-semibold text-white">
                            {artwork.title}
                          </h3>
                          <p className="mb-2 text-sm text-gray-300">
                            {artwork.description.length > 100
                              ? artwork.description.substring(0, 100) + "..."
                              : artwork.description}
                          </p>
                          <span className="inline-block rounded-full bg-primary/20 px-3 py-1 text-sm text-primary">
                            {artwork.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
        </div>
      </div>
    </main>
  );
}
