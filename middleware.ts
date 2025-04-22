import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { firestore } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function middleware(request: NextRequest) {
  // Only run on /register
  if (request.nextUrl.pathname === '/register') {
    try {
      // Check if admin exists
      const adminDoc = await getDoc(doc(firestore, "admin", "credentials"));
      
      // If admin exists, redirect to home
      if (adminDoc.exists()) {
        return NextResponse.redirect(new URL('/', request.url));
      }
      
      // If no admin, allow access to register page
      return NextResponse.next();
    } catch (error) {
      console.error("[Middleware] Error checking admin:", error);
      // On error, redirect to home for safety
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Continue for all other routes
  return NextResponse.next();
}

export const config = {
  matcher: '/register',
} 