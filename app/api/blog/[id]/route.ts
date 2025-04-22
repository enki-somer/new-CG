import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const docRef = doc(firestore, "blog", params.id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: docSnap.id,
      ...docSnap.data()
    });
  } catch (error) {
    console.error("Failed to fetch blog post:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog post" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const { title, content, coverImage, tags } = data;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const docRef = doc(firestore, "blog", params.id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    // Calculate read time (rough estimate: 200 words per minute)
    const words = content.trim().split(/\s+/).length;
    const readTime = `${Math.max(1, Math.ceil(words / 200))} min read`;

    // Create excerpt (first 150 characters)
    const excerpt = content.slice(0, 150) + (content.length > 150 ? "..." : "");

    const updateData: any = {
      title,
      content,
      excerpt,
      readTime,
      updatedAt: new Date().toISOString(),
    };

    if (coverImage) updateData.coverImage = coverImage;
    if (tags) updateData.tags = tags;

    await updateDoc(docRef, updateData);

    return NextResponse.json({
      message: "Blog post updated successfully"
    });
  } catch (error) {
    console.error("Failed to update blog post:", error);
    return NextResponse.json(
      { error: "Failed to update blog post" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const docRef = doc(firestore, "blog", params.id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    await deleteDoc(docRef);

    return NextResponse.json({
      message: "Blog post deleted successfully"
    });
  } catch (error) {
    console.error("Failed to delete blog post:", error);
    return NextResponse.json(
      { error: "Failed to delete blog post" },
      { status: 500 }
    );
  }
} 