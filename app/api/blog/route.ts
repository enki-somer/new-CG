import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/lib/firebase";
import { collection, getDocs, addDoc, query, orderBy } from "firebase/firestore";

export async function GET() {
  try {
    const blogRef = collection(firestore, "blog");
    const q = query(blogRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Failed to fetch blog posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { title, content, coverImage, tags, language } = data;

    if (!title || !content || !coverImage) {
      return NextResponse.json(
        { error: "Title, content, and cover image are required" },
        { status: 400 }
      );
    }

    // Normalize content formatting
    const normalizedContent = content
      .replace(/\r\n/g, '\n') // Convert Windows line endings
      .replace(/\r/g, '\n')   // Convert Mac line endings
      .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newlines
      .trim();

    // Calculate read time (rough estimate: 200 words per minute)
    const words = normalizedContent.trim().split(/\s+/).length;
    const readTime = `${Math.max(1, Math.ceil(words / 200))} ${language === 'ar' ? 'دقيقة للقراءة' : 'min read'}`;

    // Create excerpt (first 150 characters)
    const excerpt = normalizedContent
      .split('\n')[0] // Take first paragraph
      .slice(0, 150) + (normalizedContent.length > 150 ? "..." : "");

    const blogRef = collection(firestore, "blog");
    const docRef = await addDoc(blogRef, {
      title,
      content: normalizedContent,
      excerpt,
      coverImage,
      tags: tags || [],
      readTime,
      language: language || 'en',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      id: docRef.id,
      message: "Blog post created successfully"
    });
  } catch (error) {
    console.error("Failed to create blog post:", error);
    return NextResponse.json(
      { error: "Failed to create blog post" },
      { status: 500 }
    );
  }
} 