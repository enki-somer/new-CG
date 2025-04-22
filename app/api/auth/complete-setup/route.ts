import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/lib/firebase";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { authenticator } from "otplib";

export async function POST(request: NextRequest) {
  try {
    const { password, token } = await request.json();

    if (!password || !token) {
      return NextResponse.json(
        { error: "Password and verification code are required" },
        { status: 400 }
      );
    }

    // Get temporary setup data
    const tempSetupDoc = await getDoc(doc(firestore, "admin", "temp_setup"));
    if (!tempSetupDoc.exists()) {
      return NextResponse.json(
        { error: "Setup session expired or not found" },
        { status: 400 }
      );
    }

    const tempSetupData = tempSetupDoc.data();
    const { hashedPassword, secret } = tempSetupData;

    // Verify the token
    const isValid = authenticator.verify({
      token,
      secret
    });

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Store final admin credentials
    await setDoc(doc(firestore, "admin", "credentials"), {
      password: hashedPassword,
      secret,
      createdAt: new Date().toISOString(),
    });

    // Clean up temporary setup data
    await deleteDoc(doc(firestore, "admin", "temp_setup"));

    return NextResponse.json({ message: "Admin setup completed successfully" });
  } catch (error) {
    console.error("Failed to complete setup:", error);
    return NextResponse.json(
      { error: "Failed to complete setup" },
      { status: 500 }
    );
  }
} 