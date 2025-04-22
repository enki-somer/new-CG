import { NextResponse } from "next/server";
import { firestore } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function GET() {
  try {
    // Force a fresh check from Firestore
    const adminDoc = await getDoc(doc(firestore, "admin", "credentials"));
    
    // Return with no-cache headers
    return new NextResponse(
      JSON.stringify({ isRegistered: adminDoc.exists() }),
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error("Failed to check registration:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to check registration status" }),
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Content-Type': 'application/json',
        },
      }
    );
  }
} 