"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, ArrowRight, Tag } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  coverImage: string;
  createdAt: string;
  readTime: string;
  tags: string[];
  language: "en" | "ar";
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/blog");
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Failed to fetch blog posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-black via-primary/20 to-black pt-24">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-primary/20 to-black pt-24">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="mb-8 text-center text-4xl font-bold text-white">
            Blog
          </h1>

          {posts.length === 0 ? (
            <div className="text-center text-gray-400">
              No blog posts available yet.
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                  className={`group relative overflow-hidden rounded-xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm ${
                    post.language === "ar" ? "font-noto-naskh-arabic" : ""
                  }`}
                  dir={post.language === "ar" ? "rtl" : "ltr"}
                >
                  <Link href={`/blog/${post.id}`}>
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                    <div className="p-6">
                      <div className="mb-4 flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="flex items-center gap-1 rounded-full bg-primary/20 px-3 py-1 text-xs text-primary"
                          >
                            <Tag
                              className={`h-3 w-3 ${
                                post.language === "ar" ? "ml-1" : "mr-1"
                              }`}
                            />
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h2
                        className={`mb-3 text-xl font-semibold text-white group-hover:text-primary ${
                          post.language === "ar" ? "text-right" : "text-left"
                        }`}
                      >
                        {post.title}
                      </h2>
                      <p
                        className={`mb-4 text-sm text-gray-400 ${
                          post.language === "ar" ? "text-right" : "text-left"
                        }`}
                      >
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <Calendar
                            className={`h-4 w-4 ${
                              post.language === "ar" ? "ml-2" : "mr-2"
                            }`}
                          />
                          <span>
                            {new Date(post.createdAt).toLocaleDateString(
                              post.language === "ar" ? "ar-SA" : "en-US"
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock
                            className={`h-4 w-4 ${
                              post.language === "ar" ? "ml-2" : "mr-2"
                            }`}
                          />
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                      <div
                        className={`mt-4 flex items-center ${
                          post.language === "ar"
                            ? "justify-start flex-row-reverse"
                            : "justify-end"
                        } text-primary`}
                      >
                        <span className="text-sm">
                          {post.language === "ar" ? "اقرأ المزيد" : "Read more"}
                        </span>
                        <ArrowRight
                          className={`h-4 w-4 transition-transform group-hover:translate-x-2 ${
                            post.language === "ar" ? "rotate-180 mr-2" : "ml-2"
                          }`}
                        />
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
