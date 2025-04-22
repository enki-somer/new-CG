import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/lib/firebase";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { authenticator } from "otplib";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Verification code is required" },
        { status: 400 }
      );
    }

    // Get temporary registration data
    const tempRegDoc = doc(firestore, "admin", "temp_registration");
    const tempRegSnap = await getDoc(tempRegDoc);

    if (!tempRegSnap.exists()) {
      return NextResponse.json(
        { error: "No pending registration found" },
        { status: 400 }
      );
    }

    const tempRegData = tempRegSnap.data();
    const { hashedPassword, secret, timestamp } = tempRegData;

    // Check if the registration attempt has expired (30 minutes)
    const registrationTime = new Date(timestamp).getTime();
    const currentTime = new Date().getTime();
    const timeLimit = 30 * 60 * 1000; // 30 minutes in milliseconds

    if (currentTime - registrationTime > timeLimit) {
      await deleteDoc(tempRegDoc);
      return NextResponse.json(
        { error: "Registration attempt has expired. Please start over." },
        { status: 400 }
      );
    }

    // Verify the token
    const isValid = authenticator.verify({
      token,
      secret,
    });

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Store the verified credentials
    const adminDoc = doc(firestore, "admin", "credentials");
    await setDoc(adminDoc, {
      password: hashedPassword,
      secret,
      createdAt: new Date().toISOString(),
    });

    // Clean up temporary registration data
    await deleteDoc(tempRegDoc);

    return NextResponse.json({ message: "Registration completed successfully" });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify registration" },
      { status: 500 }
    );
  }
} 