"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, ArrowLeft, Tag } from "lucide-react";
import React from "react";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  coverImage: string;
  createdAt: string;
  readTime: string;
  tags: string[];
  language: "en" | "ar";
}

export default function BlogPostPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/blog/${params.id}`);
        const data = await response.json();
        setPost(data);
      } catch (error) {
        console.error("Failed to fetch blog post:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-black via-primary/20 to-black pt-24">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-black via-primary/20 to-black pt-24">
        <div className="text-white">Post not found</div>
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
          <Link
            href="/blog"
            className="mb-8 inline-flex items-center text-sm text-gray-400 hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>

          <article
            className={`mx-auto max-w-4xl ${
              post.language === "ar" ? "font-noto-naskh-arabic" : ""
            }`}
            dir={post.language === "ar" ? "rtl" : "ltr"}
          >
            <div className="relative mb-8 aspect-[21/9] overflow-hidden rounded-xl">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-sm text-gray-400">
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
              <div className="flex flex-wrap gap-2">
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
            </div>

            <h1
              className={`mb-8 text-4xl font-bold text-white ${
                post.language === "ar" ? "text-right" : "text-left"
              }`}
            >
              {post.title}
            </h1>

            <div
              className={`prose prose-invert max-w-none ${
                post.language === "ar" ? "text-right" : "text-left"
              }`}
            >
              {post.content.split("\n\n").map((paragraph, index) => (
                <motion.p
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`mb-6 text-lg leading-relaxed text-gray-300 ${
                    post.language === "ar"
                      ? "font-noto-naskh-arabic text-right"
                      : ""
                  }`}
                  dir={post.language === "ar" ? "rtl" : "ltr"}
                >
                  {paragraph.split("\n").map((line, lineIndex) => (
                    <React.Fragment key={lineIndex}>
                      {line}
                      {lineIndex < paragraph.split("\n").length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </motion.p>
              ))}
            </div>
          </article>
        </motion.div>
      </div>
    </main>
  );
}
