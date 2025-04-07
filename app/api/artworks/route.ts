import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { firestore } from "@/lib/firebase";
import { collection, getDocs, addDoc, deleteDoc, doc, query, where } from "firebase/firestore";

// Define the interface for an artwork item
interface ArtworkItem {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  createdAt?: string;
}

const initialArtworks = [
  {
    id: "1",
    title: "Mystical Forest",
    category: "Environment",
    image: "/images/cg (1).jpg",
    description: "A serene and enchanting forest environment with magical elements.",
  },
  {
    id: "2",
    title: "Futuristic City",
    category: "Environment",
    image: "/images/cg (2).jpg",
    description: "A sprawling metropolis showcasing advanced architecture and technology.",
  },
  {
    id: "3",
    title: "Digital Warrior",
    category: "3D Character",
    image: "/images/cg (3).jpg",
    description: "A detailed character design blending traditional and futuristic elements.",
  },
  {
    id: "4",
    title: "Ancient Temple",
    category: "Environment",
    image: "/images/cg (4).jpg",
    description: "A mysterious temple environment with intricate architectural details.",
  },
  {
    id: "5",
    title: "Cyber Realm",
    category: "Concept Art",
    image: "/images/cg (5).jpg",
    description: "A conceptual piece exploring themes of technology and nature.",
  },
];

// Fallback to mock data if Firestore isn't available
function getStaticArtworks() {
  console.log("Using static artwork data due to Firestore unavailability");
  return initialArtworks;
}

// Helper to get the artworks collection
function getArtworksCollection() {
  try {
    return collection(firestore, 'artworks');
  } catch (error) {
    console.error("Error getting artworks collection:", error);
    return null;
  }
}

// Initialize the artworks collection with default data if it's empty
async function initializeArtworksIfEmpty() {
  try {
    const artworksCollection = getArtworksCollection();
    if (!artworksCollection) {
      console.warn("Skipping artworks initialization - Firestore not available");
      return;
    }
    
    const snapshot = await getDocs(artworksCollection);
    
    if (snapshot.empty) {
      console.log("Initializing artworks collection with default data");
      
      // Add each default artwork to the collection
      for (const artwork of initialArtworks) {
        await addDoc(artworksCollection, artwork);
      }
    }
  } catch (error) {
    console.error("Error initializing artworks:", error);
  }
}

// GET /api/artworks
export async function GET() {
  console.log("GET /api/artworks - started");
  try {
    // Check if Firestore is available
    const artworksCollection = getArtworksCollection();
    if (!artworksCollection) {
      console.warn("GET /api/artworks - Using static data (Firestore not available)");
      return NextResponse.json(getStaticArtworks());
    }
    
    // Make sure artworks are initialized
    await initializeArtworksIfEmpty();
    
    // Get all artworks from Firestore
    const snapshot = await getDocs(artworksCollection);
    
    const artworks: ArtworkItem[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      artworks.push({
        ...data,
        id: doc.id,
      } as ArtworkItem);
    });
    
    console.log(`GET /api/artworks - Fetched ${artworks.length} artworks successfully`);
    return NextResponse.json(artworks);
  } catch (error) {
    console.error("Error fetching artworks:", error);
    // Fallback to static data if there's an error
    console.warn("GET /api/artworks - Falling back to static data due to error");
    return NextResponse.json(getStaticArtworks());
  }
}

// POST /api/artworks
export async function POST(request: NextRequest) {
  console.log("POST /api/artworks - started");
  try {
    const data = await request.json();
    
    // Check if Firestore is available
    const artworksCollection = getArtworksCollection();
    if (!artworksCollection) {
      console.warn("POST /api/artworks - Firestore not available");
      // Return mock response
      return NextResponse.json(
        { 
          id: uuidv4(),
          ...data,
          createdAt: new Date().toISOString() 
        }, 
        { status: 201 }
      );
    }
    
    const newArtwork = {
      ...data,
      createdAt: new Date().toISOString(),
    };
    
    const docRef = await addDoc(artworksCollection, newArtwork);
    console.log("POST /api/artworks - Artwork saved successfully with ID:", docRef.id);
    
    return NextResponse.json(
      { 
        id: docRef.id,
        ...newArtwork 
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating artwork:", error);
    return NextResponse.json(
      { error: "Failed to create artwork" },
      { status: 500 }
    );
  }
}

// DELETE /api/artworks
export async function DELETE(request: NextRequest) {
  console.log("DELETE /api/artworks - started");
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "Artwork ID is required" },
        { status: 400 }
      );
    }
    
    // Check if Firestore is available
    if (!firestore) {
      console.warn("DELETE /api/artworks - Firestore not available");
      // Return success response
      return NextResponse.json({ success: true });
    }
    
    const artworkDoc = doc(firestore, 'artworks', id);
    await deleteDoc(artworkDoc);
    console.log("DELETE /api/artworks - Artwork deleted successfully with ID:", id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting artwork:", error);
    return NextResponse.json(
      { error: "Failed to delete artwork" },
      { status: 500 }
    );
  }
} 