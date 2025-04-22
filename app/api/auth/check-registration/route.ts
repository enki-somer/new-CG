import { NextResponse } from "next/server";
import { firestore } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function GET() {
  try {
    console.log("[Registration Check] Starting admin credentials check...");
    
    // Get the admin document reference
    const adminDocRef = doc(firestore, "admin", "credentials");
    console.log("[Registration Check] Checking document:", adminDocRef.path);
    
    // Get the document
    const adminDoc = await getDoc(adminDocRef);
    
    // Log the detailed check result
    console.log("[Registration Check] Document exists:", adminDoc.exists());
    if (adminDoc.exists()) {
      console.log("[Registration Check] Admin document data:", adminDoc.data());
    } else {
      console.log("[Registration Check] No admin document found");
    }
    
    // Return with no-cache headers and explicit boolean
    const response = {
      isRegistered: adminDoc.exists(),
      timestamp: new Date().toISOString(),
      path: adminDocRef.path
    };
    
    console.log("[Registration Check] Sending response:", response);
    
    return new NextResponse(
      JSON.stringify(response),
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '-1',
          'Surrogate-Control': 'no-store',
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error("[Registration Check] Error:", error);
    // Log the full error details
    if (error instanceof Error) {
      console.error("[Registration Check] Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to check registration status",
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '-1',
          'Surrogate-Control': 'no-store',
          'Content-Type': 'application/json',
        },
      }
    );
  }
} 