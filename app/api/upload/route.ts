import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { firestore as db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

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

    // For Netlify environment, we need to use a different approach
    // We'll create a unique ID for the image and tell the frontend to use that in a form submission
    const ext = file.name.split(".").pop();
    const filename = `${uuidv4()}.${ext}`;
    
    try {
      // Using Firestore to store image tracking info (for admin interface)
      const imageData = {
        id: filename,
        filename: file.name,
        contentType: file.type,
        uploadDate: new Date().toISOString(),
        // URL pattern for the image in the deployed site
        path: `/uploads/${filename}`
      };
      
      // Store metadata in Firestore
      const docRef = doc(db, 'images', filename);
      await setDoc(docRef, imageData);
      
      // Return the temporary URL and ID
      // NOTE: This URL won't actually work until the image is manually uploaded to
      // the repository in the public/uploads folder
      return NextResponse.json({
        url: `/uploads/${filename}`,
        id: filename,
        message: "Image metadata saved. Image needs to be manually uploaded to the repository."
      });
    } catch (error) {
      console.error("Firestore metadata save error:", error);
      return NextResponse.json(
        { error: "Failed to save image metadata" },
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