import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { firestore } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { uploadImage } from "@/lib/cloudinary";

// Define Cloudinary upload result type
interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  [key: string]: any;
}

export async function POST(request: NextRequest) {
  console.log("POST /api/upload - started");
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

    // Extract file information
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = uuidv4();
    
    try {
      // Upload to Cloudinary
      console.log("Uploading to Cloudinary...");
      const uploadResult = await uploadImage(buffer, 'cg-art') as CloudinaryUploadResult;
      
      if (!uploadResult || !uploadResult.secure_url) {
        throw new Error("Failed to upload to Cloudinary");
      }
      
      // Extract Cloudinary URL and ID
      const cloudinaryUrl = uploadResult.secure_url;
      const publicId = uploadResult.public_id;
      
      console.log("Image uploaded to Cloudinary:", { publicId, url: cloudinaryUrl });
      
      // Store metadata in Firestore (if available)
      try {
        if (firestore) {
          const imageData = {
            id: filename,
            filename: file.name,
            contentType: file.type,
            uploadDate: new Date().toISOString(),
            cloudinaryUrl,
            publicId
          };
          
          const docRef = doc(firestore, 'images', filename);
          await setDoc(docRef, imageData);
          console.log("Image metadata saved to Firestore");
        }
      } catch (firestoreError) {
        // Continue even if Firestore fails
        console.error("Firestore error (non-critical):", firestoreError);
      }
      
      // Return the Cloudinary URL
      return NextResponse.json({
        url: cloudinaryUrl,
        id: publicId
      });
    } catch (uploadError) {
      console.error("Cloudinary upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload image to Cloudinary" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Upload process error:", error);
    return NextResponse.json(
      { error: "Failed to process upload" },
      { status: 500 }
    );
  }
} 