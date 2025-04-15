"use client";

import Image from "next/image";
import { ArtworkItem } from "@/types/artwork";
import { ChevronLeft, Expand, Eye } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { ParticlesBackground } from "@/components/particles-background";

interface ArtworkClientProps {
  artwork: ArtworkItem;
}

export default function ArtworkClient({ artwork }: ArtworkClientProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-primary/20 to-black pt-24">
      <ParticlesBackground />

      {/* Lightbox */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative max-h-[90vh] max-w-[90vw]"
          >
            <Image
              src={selectedImage}
              alt="Artwork detail"
              width={1920}
              height={1080}
              className="h-auto max-h-[90vh] w-auto rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        </motion.div>
      )}

      <div className="container relative mx-auto px-4 py-12">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            href="/work"
            className="mb-8 inline-flex items-center text-white/80 transition-colors hover:text-white"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Gallery
          </Link>
        </motion.div>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Images Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Main Image */}
            <div className="group relative aspect-square overflow-hidden rounded-lg bg-gradient-glass p-1 shadow-glow">
              <div className="relative aspect-square overflow-hidden rounded-lg">
                <Image
                  src={artwork.image}
                  alt={artwork.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
                <button
                  onClick={() => setSelectedImage(artwork.image)}
                  className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white opacity-0 transition-opacity duration-300 hover:bg-black/70 group-hover:opacity-100"
                >
                  <Expand className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Additional Images Grid */}
            {artwork.additionalImages &&
              artwork.additionalImages.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {artwork.additionalImages.map((img, index) => (
                    <div
                      key={index}
                      className="group relative aspect-square overflow-hidden rounded-lg bg-gradient-glass p-1 shadow-glow"
                    >
                      <div className="relative aspect-square overflow-hidden rounded-lg">
                        <Image
                          src={img}
                          alt={`${artwork.title} - View ${index + 2}`}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 33vw, 20vw"
                        />
                        <button
                          onClick={() => setSelectedImage(img)}
                          className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white opacity-0 transition-opacity duration-300 hover:bg-black/70 group-hover:opacity-100"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </motion.div>

          {/* Artwork Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-8 text-white"
          >
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
                {artwork.title}
              </h1>
              <p className="text-lg text-primary">{artwork.category}</p>
            </div>

            <div className="space-y-6">
              <div className="prose prose-lg prose-invert">
                <p className="leading-relaxed text-gray-300">
                  {artwork.description}
                </p>
              </div>

              {/* Technical Details */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <div className="grid gap-6 md:grid-cols-2">
                  {artwork.technique && (
                    <div>
                      <h3 className="mb-2 text-sm font-medium text-white/60">
                        Technique
                      </h3>
                      <p className="text-lg text-white">{artwork.technique}</p>
                    </div>
                  )}

                  {artwork.dimensions && (
                    <div>
                      <h3 className="mb-2 text-sm font-medium text-white/60">
                        Dimensions
                      </h3>
                      <p className="text-lg text-white">{artwork.dimensions}</p>
                    </div>
                  )}

                  {artwork.year && (
                    <div>
                      <h3 className="mb-2 text-sm font-medium text-white/60">
                        Year
                      </h3>
                      <p className="text-lg text-white">{artwork.year}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="mb-2 text-sm font-medium text-white/60">
                      Category
                    </h3>
                    <span className="inline-flex rounded-full bg-gradient-to-r from-primary/20 to-accent/20 px-4 py-1 text-primary-light backdrop-blur-sm">
                      {artwork.category}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
