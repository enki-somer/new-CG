import { NextResponse } from "next/server";
import { firestore } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function GET() {
  try {
    const adminDoc = await getDoc(doc(firestore, "admin", "credentials"));
    return NextResponse.json({ isRegistered: adminDoc.exists() });
  } catch (error) {
    console.error("Failed to check registration:", error);
    return NextResponse.json(
      { error: "Failed to check registration status" },
      { status: 500 }
    );
  }
} 