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
export async function GET(request: NextRequest) {
  // Extract any cache-busting parameters for logging
  const { searchParams } = new URL(request.url);
  const timestamp = searchParams.get('t');
  const nocache = searchParams.get('nocache');
  const forceRevalidate = request.headers.get('x-force-revalidate');
  
  console.log("GET /api/artworks - started", { 
    timestamp,
    nocache,
    forceRevalidate: !!forceRevalidate,
    cacheControl: request.headers.get('cache-control')
  });
  
  // Always have static data available as a fallback
  const staticArtworks = initialArtworks;
  
  try {
    // Check if Firestore is available
    const artworksCollection = getArtworksCollection();
    if (!artworksCollection) {
      console.warn("GET /api/artworks - Using static data (Firestore not available)");
      return NextResponse.json(staticArtworks, {
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
          'Vary': '*'
        }
      });
    }
    
    try {
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
      
      // If we got artworks from Firestore, return those
      if (artworks.length > 0) {
        console.log(`GET /api/artworks - Fetched ${artworks.length} artworks successfully from Firestore`);
        return NextResponse.json(artworks, {
          headers: {
            'Cache-Control': 'no-store, must-revalidate',
            'Vary': '*',
            'Server-Timestamp': new Date().toISOString()
          }
        });
      }
      
      // Otherwise, use the static data
      console.log("GET /api/artworks - No artworks in Firestore, using static data");
      return NextResponse.json(staticArtworks, {
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
          'Vary': '*'
        }
      });
    } catch (firestoreError) {
      // Catch specific Firestore errors
      console.error("GET /api/artworks - Firestore error:", firestoreError);
      return NextResponse.json(staticArtworks, {
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
          'Vary': '*'
        }
      });
    }
  } catch (error) {
    // Catch any other errors
    console.error("GET /api/artworks - General error:", error);
    return NextResponse.json(staticArtworks, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'Vary': '*'
      }
    });
  }
}

// POST /api/artworks
export async function POST(request: NextRequest) {
  console.log("POST /api/artworks - started");
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.title || !data.category || !data.description || !data.image) {
      console.error("POST /api/artworks - Missing required fields", {
        title: !!data.title,
        category: !!data.category,
        description: !!data.description,
        image: !!data.image
      });
      
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Log the data we're processing
    console.log("POST /api/artworks - Processing data:", {
      title: data.title,
      category: data.category,
      imageUrl: data.image.substring(0, 50) + '...' // Truncate for logging
    });
    
    // Check if Firestore is available
    const artworksCollection = getArtworksCollection();
    if (!artworksCollection) {
      console.warn("POST /api/artworks - Firestore not available");
      // Return mock response
      const mockArtwork = { 
        id: uuidv4(),
        title: data.title,
        category: data.category,
        description: data.description,
        image: data.image,
        createdAt: new Date().toISOString() 
      };
      console.log("POST /api/artworks - Returning mock artwork:", mockArtwork.id);
      return NextResponse.json(mockArtwork, { status: 201 });
    }
    
    const newArtwork = {
      title: data.title,
      category: data.category,
      description: data.description,
      image: data.image,
      createdAt: new Date().toISOString(),
    };
    
    try {
      const docRef = await addDoc(artworksCollection, newArtwork);
      console.log("POST /api/artworks - Artwork saved successfully with ID:", docRef.id);
      
      // Return the complete artwork with ID
      const createdArtwork = {
        id: docRef.id,
        title: data.title,
        category: data.category,
        description: data.description,
        image: data.image,
        createdAt: newArtwork.createdAt
      };
      
      return NextResponse.json(createdArtwork, { status: 201 });
    } catch (firestoreError) {
      console.error("POST /api/artworks - Firestore error:", firestoreError);
      // Fallback to returning the data without saving to Firestore
      const fallbackArtwork = { 
        id: uuidv4(),
        title: data.title,
        category: data.category,
        description: data.description,
        image: data.image,
        createdAt: newArtwork.createdAt
      };
      console.log("POST /api/artworks - Returning fallback artwork:", fallbackArtwork.id);
      return NextResponse.json(fallbackArtwork, { status: 201 });
    }
  } catch (error) {
    console.error("Error creating artwork:", error);
    return NextResponse.json(
      { error: "Failed to create artwork", details: String(error) },
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
      console.error("DELETE /api/artworks - No ID provided");
      return NextResponse.json(
        { error: "Artwork ID is required" },
        { status: 400 }
      );
    }
    
    console.log(`DELETE /api/artworks - Attempting to delete artwork with ID: ${id}`);
    
    // Check if Firestore is available
    if (!firestore) {
      console.warn("DELETE /api/artworks - Firestore not available, returning mock success");
      // Return mock success response
      return NextResponse.json({ success: true });
    }
    
    try {
      // Try to delete from Firestore
      const artworkDoc = doc(firestore, 'artworks', id);
      await deleteDoc(artworkDoc);
      console.log("DELETE /api/artworks - Artwork deleted successfully with ID:", id);
      
      return NextResponse.json({ success: true });
    } catch (firestoreError) {
      console.error("DELETE /api/artworks - Firestore deletion error:", firestoreError);
      
      // For IDs that might be from the initial static data (like "1", "2", etc.)
      // just return success since those aren't actually in Firestore
      if (["1", "2", "3", "4", "5"].includes(id)) {
        console.log(`DELETE /api/artworks - ID ${id} appears to be from static data, returning mock success`);
        return NextResponse.json({ success: true });
      }
      
      // Return error for other Firestore errors
      return NextResponse.json(
        { error: "Failed to delete from database", details: String(firestoreError) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("DELETE /api/artworks - General error:", error);
    return NextResponse.json(
      { error: "Failed to delete artwork", details: String(error) },
      { status: 500 }
    );
  }
} 