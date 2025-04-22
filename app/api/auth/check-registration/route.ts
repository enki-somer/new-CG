import { NextResponse } from "next/server";
import { firestore } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function GET() {
  try {
    // Force a fresh check from Firestore
    const adminDoc = await getDoc(doc(firestore, "admin", "credentials"));
    
    // Log the check result
    console.log("[Registration Check] Admin exists:", adminDoc.exists());
    
    // Return with no-cache headers and explicit boolean
    return new NextResponse(
      JSON.stringify({ 
        isRegistered: adminDoc.exists(),
        timestamp: new Date().toISOString() // Add timestamp for debugging
      }),
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store',
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error("[Registration Check] Error:", error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to check registration status",
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store',
          'Content-Type': 'application/json',
        },
      }
    );
  }
} 