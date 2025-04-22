import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { authenticator } from "otplib";
import { hash } from "bcrypt";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    // Check if admin credentials already exist
    const adminDoc = await getDoc(doc(firestore, "admin", "credentials"));
    if (adminDoc.exists()) {
      return NextResponse.json(
        { error: "Admin credentials already registered" },
        { status: 400 }
      );
    }

    // Generate secret for 2FA
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri("admin", "CG Art Admin", secret);

    // Store temporary setup data in session
    const hashedPassword = await hash(password, 10);

    // Store temporary setup data
    await setDoc(doc(firestore, "admin", "temp_setup"), {
      hashedPassword,
      secret,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ otpauth });
  } catch (error) {
    console.error("Failed to initialize setup:", error);
    return NextResponse.json(
      { error: "Failed to initialize setup" },
      { status: 500 }
    );
  }
} 