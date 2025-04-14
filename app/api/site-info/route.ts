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
  console.log("[API] GET /api/site-info - Request received");
  
  // Log Firestore status
  const firestoreStatus = {
    isInitialized: !!db,
    isDummy: db && 'collection' in db && typeof db.collection === 'function' && db.collection.toString().includes('dummy'),
    type: db ? typeof db : 'undefined'
  };
  console.log("[API] GET /api/site-info - Firestore status:", firestoreStatus);

  try {
    // Check if Firestore is properly initialized
    if (!db) {
      console.log("[API] GET /api/site-info - Firestore not initialized, returning default data");
      return NextResponse.json(defaultSiteInfo, {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }

    console.log("[API] GET /api/site-info - Attempting to fetch document from Firestore");
    const docRef = doc(db, 'site', 'info');
    
    try {
      const docSnap = await getDoc(docRef);
      console.log("[API] GET /api/site-info - Document fetch attempt completed");

      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("[API] GET /api/site-info - Document exists, returning data");
        return NextResponse.json(data, {
          status: 200,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
      } else {
        // Initialize with default data if it doesn't exist
        console.log("[API] GET /api/site-info - Document doesn't exist, initializing with default data");
        try {
          await setDoc(docRef, defaultSiteInfo);
          console.log("[API] GET /api/site-info - Successfully initialized with default data");
          return NextResponse.json(defaultSiteInfo, {
            status: 200,
            headers: {
              'Cache-Control': 'no-store, no-cache, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          });
        } catch (initError) {
          console.error("[API] GET /api/site-info - Failed to initialize default data:", initError);
          return NextResponse.json(
            { error: "Failed to initialize site information" },
            { status: 500 }
          );
        }
      }
    } catch (docError) {
      console.error("[API] GET /api/site-info - Error fetching document:", docError);
      return NextResponse.json(
        { error: "Failed to fetch site information" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[API] GET /api/site-info - Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
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