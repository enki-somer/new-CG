"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ThreeScene } from "@/components/three-scene";
import { ParticlesBackground } from "@/components/particles-background";
import Image from "next/image";
import Link from "next/link";

interface ArtworkItem {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
}

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
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
  {
    id: "6",
    title: "Neon Dreams",
    category: "Concept Art",
    image: "/images/cg (2).jpg", // Using an existing image as a duplicate for the example
    description:
      "A vibrant exploration of neon aesthetics in a futuristic setting.",
  },
];

export default function Home() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const [featuredWorks, setFeaturedWorks] = useState<ArtworkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);

  // Ensure component is mounted before animations start
  useEffect(() => {
    setIsRendered(true);
  }, []);

  // Show content immediately but with animation after component is mounted
  useEffect(() => {
    if (isRendered) {
      setIsContentVisible(true);
    }
  }, [isRendered]);

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        // Add cache headers and retry logic
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

        const allArtworks = await response.json();

        // Ensure we have artworks before shuffling
        if (Array.isArray(allArtworks) && allArtworks.length > 0) {
          console.log(
            `Loaded ${allArtworks.length} artworks successfully for homepage`
          );
          // Show their IDs for debugging
          console.log(
            "Artwork IDs loaded:",
            allArtworks.map((a) => a.id).join(", ")
          );

          const randomWorks = shuffleArray([...allArtworks]).slice(0, 6);
          setFeaturedWorks(randomWorks);
        } else {
          console.warn(
            "API returned empty artworks array for homepage, using fallback data"
          );
          // Use shuffled fallback data
          const randomFallbackWorks = shuffleArray([...fallbackArtworks]).slice(
            0,
            6
          );
          setFeaturedWorks(randomFallbackWorks);
        }
      } catch (error) {
        console.error("Failed to load artworks for homepage:", error);
        // Use fallback data on error - shuffle to get a different set each time
        const randomFallbackWorks = shuffleArray([...fallbackArtworks]).slice(
          0,
          6
        );
        setFeaturedWorks(randomFallbackWorks);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchArtworks();

    // Remove the duplicate fetch after 2 seconds
    // const refreshTimer = setTimeout(() => {
    //   console.log(
    //     "Performing second artwork fetch to check for updates on home page..."
    //   );
    //   fetchArtworks();
    // }, 2000);

    // return () => clearTimeout(refreshTimer);

    // Simple cleanup function
    return () => {};
  }, []);

  // Only render content when component is mounted
  if (!isRendered) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-black via-primary/5 to-black">
      <section className="relative flex h-screen items-center justify-center overflow-hidden">
        <ThreeScene />
        {isContentVisible && <ParticlesBackground />}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="container relative z-10 px-4 text-center text-white"
        >
          <div className="relative mb-8 inline-block">
            <motion.span
              className="absolute -left-4 top-0 h-full w-1 bg-gradient-to-b from-primary via-accent to-primary/50 shadow-glow animate-glow"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: isContentVisible ? 1 : 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
            <h1 className="pl-4 text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: isContentVisible ? 1 : 0,
                  y: isContentVisible ? 0 : 20,
                }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
              >
                Bringing
              </motion.span>
              <br />
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: isContentVisible ? 1 : 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="animate-pulse-slow text-gray-100"
              >
                Imagination to Life
              </motion.span>
            </h1>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: isContentVisible ? 1 : 0,
              y: isContentVisible ? 0 : 20,
            }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mx-auto mb-12 max-w-[700px] text-xl text-gray-200/90 sm:text-2xl"
          >
            Creating stunning visual experiences through CG artistry and
            innovative design
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: isContentVisible ? 1 : 0,
              y: isContentVisible ? 0 : 20,
            }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex justify-center gap-4"
          >
            <Link
              href="#work"
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary to-accent p-0.5 text-lg font-medium text-white shadow-glow transition-shadow hover:shadow-glow-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <span className="relative rounded-md bg-black/80 px-8 py-3 transition-all duration-300 ease-in group-hover:bg-opacity-0">
                View Work
              </span>
            </Link>
            <Link
              href="/contact"
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg border border-primary/30 p-0.5 text-lg font-medium text-white backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <span className="relative rounded-md px-8 py-3 transition-all duration-300 ease-in group-hover:bg-primary/10">
                Contact Me
              </span>
            </Link>
          </motion.div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.03 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 z-0"
          style={{ y }}
        >
          <Image
            src="/images/cg (2).jpg"
            alt="Stunning CG artwork showcasing a futuristic cityscape"
            fill
            className="object-cover"
            priority
            sizes="100vw"
            loading="eager"
          />
        </motion.div>
      </section>

      <section id="work" className="py-24">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-4xl font-bold tracking-tighter text-primary sm:text-5xl">
              Featured{" "}
              <span className="bg-gradient-to-r from-primary-light via-accent to-primary bg-clip-text text-transparent">
                Works
              </span>
            </h2>
            <p className="mx-auto max-w-[600px] text-lg text-gray-400/90">
              A selection of my latest and most impactful projects
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? // Skeleton loading state
                Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="relative overflow-hidden rounded-xl bg-gradient-glass p-1 shadow-glow backdrop-blur-sm"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-primary/5">
                      <div className="absolute inset-0 animate-pulse bg-primary/10" />
                    </div>
                  </div>
                ))
              : featuredWorks.map((artwork, index) => (
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

          <div className="mt-12 text-center">
            <Link
              href="/work"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-accent px-6 py-3 text-white shadow-glow transition-all hover:shadow-glow-lg"
            >
              View All Works
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
