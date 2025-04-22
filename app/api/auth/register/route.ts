import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import bcrypt from "bcrypt";
import { authenticator } from "otplib";
import QRCode from "qrcode";

export async function POST(request: NextRequest) {
  try {
    // Check if admin already exists
    const adminDoc = doc(firestore, "admin", "credentials");
    const adminSnap = await getDoc(adminDoc);

    if (adminSnap.exists()) {
      return NextResponse.json(
        { error: "Admin account already exists" },
        { status: 400 }
      );
    }

    const { password } = await request.json();

    if (!password || password.length < 12) {
      return NextResponse.json(
        { error: "Password must be at least 12 characters long" },
        { status: 400 }
      );
    }

    // Generate salt and hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate TOTP secret
    const secret = authenticator.generateSecret();
    const appName = "CG-Art Admin";
    const otpauthUrl = authenticator.keyuri("admin", appName, secret);

    // Generate QR code
    const qrCode = await QRCode.toDataURL(otpauthUrl);

    // Store temporary registration data
    const tempRegDoc = doc(firestore, "admin", "temp_registration");
    await setDoc(tempRegDoc, {
      hashedPassword,
      secret,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      otpauth: otpauthUrl,
      qrCode,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to initialize registration" },
      { status: 500 }
    );
  }
} 