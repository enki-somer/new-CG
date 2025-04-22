import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { firestore } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function middleware(request: NextRequest) {
  // Only run on /register
  if (request.nextUrl.pathname === '/register') {
    try {
      console.log("[Middleware] Checking admin credentials...");
      
      // Get the admin document reference
      const adminDocRef = doc(firestore, "admin", "credentials");
      console.log("[Middleware] Checking document:", adminDocRef.path);
      
      // Get the document with cache busting
      const adminDoc = await getDoc(adminDocRef);
      
      console.log("[Middleware] Admin document exists:", adminDoc.exists());
      if (adminDoc.exists()) {
        console.log("[Middleware] Admin found, redirecting to home");
        return NextResponse.redirect(new URL('/', request.url));
      }
      
      console.log("[Middleware] No admin found, allowing access to register");
      return NextResponse.next();
    } catch (error) {
      console.error("[Middleware] Error checking admin:", error);
      if (error instanceof Error) {
        console.error("[Middleware] Error details:", {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      }
      // On error, redirect to home for safety
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Continue for all other routes
  return NextResponse.next();
}

// Update config to only match /register exactly
export const config = {
  matcher: ['/register']
} 