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
      console.error("POST /api/upload - No file provided");
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      console.error("POST /api/upload - Invalid file type:", file.type);
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    console.log(`POST /api/upload - Processing file: ${file.name}, Size: ${Math.round(file.size / 1024)}KB, Type: ${file.type}`);

    // Extract file information
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = uuidv4();
    
    try {
      // Upload to Cloudinary
      console.log("POST /api/upload - Uploading to Cloudinary...");
      const uploadResult = await uploadImage(buffer, 'cg-art') as CloudinaryUploadResult;
      
      if (!uploadResult || !uploadResult.secure_url) {
        console.error("POST /api/upload - Cloudinary upload failed, no secure_url returned");
        console.log("POST /api/upload - Cloudinary response:", uploadResult);
        throw new Error("Failed to upload to Cloudinary");
      }
      
      // Extract Cloudinary URL and ID
      const cloudinaryUrl = uploadResult.secure_url;
      const publicId = uploadResult.public_id;
      
      console.log("POST /api/upload - Image uploaded to Cloudinary successfully:", { 
        publicId, 
        url: cloudinaryUrl.substring(0, 50) + '...' // Truncate for logging
      });
      
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
          console.log("POST /api/upload - Image metadata saved to Firestore");
        }
      } catch (firestoreError) {
        // Continue even if Firestore fails
        console.error("POST /api/upload - Firestore error (non-critical):", firestoreError);
      }
      
      // Return the Cloudinary URL
      console.log("POST /api/upload - Returning successful response");
      return NextResponse.json({
        url: cloudinaryUrl,
        id: publicId
      });
    } catch (uploadError) {
      console.error("POST /api/upload - Cloudinary upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload image to Cloudinary", details: String(uploadError) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("POST /api/upload - General error:", error);
    return NextResponse.json(
      { error: "Failed to process upload", details: String(error) },
      { status: 500 }
    );
  }
} 