import { NextRequest, NextResponse } from "next/server";
import { authenticator } from "otplib";
import { firestore } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { compare } from "bcrypt";

// POST /api/auth
export async function POST(request: NextRequest) {
  try {
    const { password, token } = await request.json();

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

    // Verify the 2FA token
    const isTokenValid = authenticator.verify({
      token,
      secret: adminData.secret
    });

    if (!isTokenValid) {
      return NextResponse.json(
        { error: "Invalid 2FA token" },
        { status: 401 }
      );
    }

    // If both are valid, return success
    return NextResponse.json({
      success: true,
      message: "Authentication successful",
    });
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
} 