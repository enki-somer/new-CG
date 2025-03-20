"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ParticlesBackground } from "@/components/particles-background";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-primary/20 to-black pt-24">
      <ParticlesBackground />
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid gap-12 lg:grid-cols-2 lg:gap-16"
        >
          <div className="order-2 lg:order-1">
            <h1 className="mb-6 text-4xl font-bold tracking-tighter text-white sm:text-5xl md:text-6xl">
              About{" "}
              <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                Me
              </span>
            </h1>
            <div className="space-y-6 text-lg text-white/90">
              <p>
                As a passionate CG artist, I blend creativity with technical
                expertise to bring imagination to life. My journey in digital
                art spans over several years, during which I've developed a deep
                understanding of 3D modeling, texturing, and environmental
                design.
              </p>
              <p>
                I specialize in creating immersive environments and compelling
                character designs that tell stories and evoke emotions. My work
                combines traditional artistic principles with cutting-edge
                digital techniques to achieve unique and memorable results.
              </p>
              <p>
                Whether it's crafting detailed character models, designing
                expansive environments, or creating concept art, I approach each
                project with dedication and creativity. I'm constantly exploring
                new techniques and pushing the boundaries of what's possible in
                CG artistry.
              </p>
            </div>
            <div className="mt-8 space-y-4">
              <h2 className="text-2xl font-semibold text-white">
                Specializations
              </h2>
              <div className="flex flex-wrap gap-3">
                {[
                  "3D Modeling",
                  "Environment Design",
                  "Character Art",
                  "Texturing",
                  "Concept Art",
                  "Digital Sculpting",
                ].map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-primary/20 px-4 py-2 text-sm font-medium text-white"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="order-1 lg:order-2"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gradient-to-br from-white/5 to-white/10 p-1 backdrop-blur-sm">
              <Image
                src="/images/cg (3).jpg"
                alt="Digital Warrior - Showcasing character design expertise"
                fill
                className="rounded-lg object-cover"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
