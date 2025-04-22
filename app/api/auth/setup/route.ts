import { NextRequest, NextResponse } from "next/server";
import { authenticator } from "otplib";
import { firestore } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { compare } from "bcrypt";

// GET /api/auth/setup
export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    // Get admin credentials from Firebase
    const adminDoc = await getDoc(doc(firestore, "admin", "credentials"));
    if (!adminDoc.exists()) {
      return NextResponse.json(
        { error: "Admin credentials not found" },
        { status: 401 }
      );
    }

    const adminData = adminDoc.data();
    
    // Verify password
    const isPasswordValid = await compare(password, adminData.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    // Generate QR code data using the stored secret
    const otpauth = authenticator.keyuri(
      "admin",
      "CG Art Gallery",
      adminData.secret
    );

    return NextResponse.json({
      otpauth,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
  } catch (error) {
    console.error("Error generating 2FA setup:", error);
    return NextResponse.json(
      { error: "Failed to generate 2FA setup" },
      { status: 500 }
    );
  }
} 