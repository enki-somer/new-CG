import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Create unique filename
    const ext = file.name.split(".").pop();
    const filename = `${uuidv4()}.${ext}`;
    
    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // For development: Save file to public/uploads directory
    try {
      const uploadDir = join(process.cwd(), "public", "uploads");
      
      // Ensure upload directory exists
      await mkdir(uploadDir, { recursive: true });
      
      // Write file to disk
      await writeFile(join(uploadDir, filename), buffer);
      
      // Store minimal metadata in Firestore
      const imageData = {
        id: filename,
        filename: file.name,
        contentType: file.type,
        uploadDate: new Date().toISOString(),
        path: `/uploads/${filename}`
      };
      
      // Store metadata in Firestore
      const docRef = doc(db, 'images', filename);
      await setDoc(docRef, imageData);
      
      // Return the public URL
      return NextResponse.json({
        url: `/uploads/${filename}`,
        id: filename
      });
    } catch (error) {
      console.error("File save error:", error);
      return NextResponse.json(
        { error: "Failed to save image file" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to process upload" },
      { status: 500 }
    );
  }
} 