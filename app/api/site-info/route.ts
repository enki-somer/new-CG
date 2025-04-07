import { NextRequest, NextResponse } from "next/server";
import { firestore as db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

// Define the data structure
interface SiteInfo {
  about: {
    title: string;
    subtitle: string;
    description: string[];
    image: string;
    skills: string[];
  };
  contact: {
    email: string;
    phone: string;
    location: string;
    availableFor: string[];
  };
}

const defaultSiteInfo: SiteInfo = {
  about: {
    title: "About Me",
    subtitle: "CG Artist & Designer",
    description: [
      "As a passionate CG artist, I blend creativity with technical expertise to bring imagination to life. My journey in digital art spans over several years, during which I've developed a deep understanding of 3D modeling, texturing, and environmental design.",
      "I specialize in creating immersive environments and compelling character designs that tell stories and evoke emotions. My work combines traditional artistic principles with cutting-edge digital techniques to achieve unique and memorable results.",
      "Whether it's crafting detailed character models, designing expansive environments, or creating concept art, I approach each project with dedication and creativity. I'm constantly exploring new techniques and pushing the boundaries of what's possible in CG artistry."
    ],
    image: "/images/cg (3).jpg",
    skills: [
      "3D Modeling",
      "Environment Design",
      "Character Art",
      "Texturing",
      "Concept Art",
      "Digital Sculpting"
    ]
  },
  contact: {
    email: "contact@example.com",
    phone: "+1 (555) 123-4567",
    location: "Los Angeles, CA",
    availableFor: [
      "Freelance",
      "Collaboration",
      "Full-time",
      "Consultation"
    ]
  }
};

// GET handler - retrieve site information
export async function GET() {
  try {
    const docRef = doc(db, 'site', 'info');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return NextResponse.json(docSnap.data());
    } else {
      // Initialize with default data if it doesn't exist
      await setDoc(docRef, defaultSiteInfo);
      return NextResponse.json(defaultSiteInfo);
    }
  } catch (error) {
    console.error("Error reading site info:", error);
    return NextResponse.json(
      { error: "Failed to load site information" },
      { status: 500 }
    );
  }
}

// POST handler - update site information
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body) {
      return NextResponse.json(
        { error: "No data provided" },
        { status: 400 }
      );
    }

    const docRef = doc(db, 'site', 'info');
    const docSnap = await getDoc(docRef);
    
    // Get current data or use default if it doesn't exist
    const currentData = docSnap.exists() ? docSnap.data() : defaultSiteInfo;
    
    // Update only the fields that were provided
    const updatedData = {
      about: {
        ...currentData.about,
        ...(body.about || {})
      },
      contact: {
        ...currentData.contact,
        ...(body.contact || {})
      }
    };
    
    try {
      await setDoc(docRef, updatedData);
      return NextResponse.json(updatedData);
    } catch (error) {
      console.error("Error writing to Firestore:", error);
      return NextResponse.json(
        { error: "Failed to save changes" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error updating site info:", error);
    return NextResponse.json(
      { error: "Failed to update site information" },
      { status: 500 }
    );
  }
} 