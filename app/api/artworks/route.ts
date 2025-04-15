import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { firestore } from "@/lib/firebase";
import { collection, getDocs, addDoc, deleteDoc, doc, query, where, updateDoc } from "firebase/firestore";

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
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Futuristic City",
    category: "Environment",
    image: "/images/cg (2).jpg",
    description: "A sprawling metropolis showcasing advanced architecture and technology.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Digital Warrior",
    category: "3D Character",
    image: "/images/cg (3).jpg",
    description: "A detailed character design blending traditional and futuristic elements.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    title: "Ancient Temple",
    category: "Environment",
    image: "/images/cg (4).jpg",
    description: "A mysterious temple environment with intricate architectural details.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "5",
    title: "Cyber Realm",
    category: "Concept Art",
    image: "/images/cg (5).jpg",
    description: "A conceptual piece exploring themes of technology and nature.",
    createdAt: new Date().toISOString(),
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
    } else {
      // Check for artworks missing createdAt field and update them
      console.log("Checking for artworks missing createdAt field");
      let updatedCount = 0;
      
      snapshot.forEach(async (docSnapshot) => {
        const data = docSnapshot.data();
        if (!data.createdAt) {
          // Add createdAt to artworks missing it
          const docRef = doc(firestore, 'artworks', docSnapshot.id);
          await updateDoc(docRef, { createdAt: new Date().toISOString() });
          updatedCount++;
        }
      });
      
      if (updatedCount > 0) {
        console.log(`Updated createdAt field for ${updatedCount} existing artworks`);
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
          'Vary': '*',
          'x-timestamp': Date.now().toString(),
          'x-random': Math.random().toString()
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
        const artwork = {
          ...data,
          id: doc.id,
        } as ArtworkItem;
        artworks.push(artwork);
        
        // Add debug log for each artwork to help diagnose issues
        console.log(`GET /api/artworks - Found artwork: ${artwork.id}, title: ${artwork.title}, createdAt: ${artwork.createdAt || 'not set'}`);
      });
      
      // Sort artworks by createdAt date, newest first
      artworks.sort((a, b) => {
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      // If we got artworks from Firestore, return those
      if (artworks.length > 0) {
        console.log(`GET /api/artworks - Fetched ${artworks.length} artworks successfully from Firestore`);
        return NextResponse.json(artworks, {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Surrogate-Control': 'no-store',
            'Vary': '*',
            'Server-Timestamp': new Date().toISOString(),
            'x-timestamp': Date.now().toString(),
            'x-random': Math.random().toString()
          }
        });
      }
      
      // Otherwise, use the static data
      console.log("GET /api/artworks - No artworks in Firestore, using static data");
      return NextResponse.json(staticArtworks, {
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
          'Vary': '*',
          'x-timestamp': Date.now().toString(),
          'x-random': Math.random().toString()
        }
      });
    } catch (firestoreError) {
      // Catch specific Firestore errors
      console.error("GET /api/artworks - Firestore error:", firestoreError);
      return NextResponse.json(staticArtworks, {
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
          'Vary': '*',
          'x-timestamp': Date.now().toString(),
          'x-random': Math.random().toString()
        }
      });
    }
  } catch (error) {
    // Catch any other errors
    console.error("GET /api/artworks - General error:", error);
    return NextResponse.json(staticArtworks, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'Vary': '*',
        'x-timestamp': Date.now().toString(),
        'x-random': Math.random().toString()
      }
    });
  }
}

// POST /api/artworks
export async function POST(request: NextRequest) {
  console.log("POST /api/artworks - started");
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.category || !body.description || !body.image) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create artwork data with optional fields
    const artworkData = {
      title: body.title,
      category: body.category,
      description: body.description,
      image: body.image,
      additionalImages: body.additionalImages || [], // Add support for additional images
      createdAt: Date.now(),
      technique: body.technique || null,
      dimensions: body.dimensions || null,
      year: body.year || null,
    };

    // Check if Firestore is available
    const artworksCollection = getArtworksCollection();
    if (!artworksCollection) {
      console.warn("POST /api/artworks - Firestore not available");
      // Return mock response
      const mockArtwork = { 
        id: uuidv4(),
        title: body.title,
        category: body.category,
        description: body.description,
        image: body.image,
        createdAt: new Date().toISOString() 
      };
      console.log("POST /api/artworks - Returning mock artwork:", mockArtwork.id);
      
      // Try to revalidate the routes to ensure the new artwork appears
      try {
        await fetch(`${request.nextUrl.origin}/api/revalidate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ paths: ['/work', '/'] })
        });
      } catch (e) {
        console.warn("Failed to revalidate paths after creating mock artwork:", e);
      }
      
      return NextResponse.json(mockArtwork, { 
        status: 201,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'x-timestamp': Date.now().toString()
        }
      });
    }
    
    const docRef = await addDoc(artworksCollection, artworkData);
    console.log("POST /api/artworks - Artwork saved successfully with ID:", docRef.id);
    
    // Return the created artwork with its ID
    const createdArtwork = {
      id: docRef.id,
      ...artworkData,
    };
    
    // Try to revalidate the routes to ensure the new artwork appears
    try {
      await fetch(`${request.nextUrl.origin}/api/revalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paths: ['/work', '/'] })
      });
      console.log("Successfully revalidated paths after creating artwork");
    } catch (e) {
      console.warn("Failed to revalidate paths after creating artwork:", e);
    }
    
    return NextResponse.json(createdArtwork, { 
      status: 201,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'x-timestamp': Date.now().toString()
      }
    });
  } catch (error) {
    console.error("Error adding artwork:", error);
    return NextResponse.json(
      { error: "Failed to add artwork" },
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

// PUT /api/artworks?id={id}
export async function PUT(request: NextRequest) {
  console.log("PUT /api/artworks - started");
  
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: "Artwork ID is required" }, { status: 400 });
    }

    const artworksCollection = getArtworksCollection();
    if (!artworksCollection) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 });
    }

    const updateData = await request.json();
    
    // Validate required fields
    if (!updateData.title || !updateData.category || !updateData.description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get reference to the specific artwork document
    const artworkRef = doc(firestore, 'artworks', id);

    // Update the artwork
    await updateDoc(artworkRef, {
      ...updateData,
      updatedAt: new Date().toISOString(),
    });

    console.log(`PUT /api/artworks - Updated artwork ${id} successfully`);
    
    return NextResponse.json({ 
      message: "Artwork updated successfully",
      id 
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Vary': '*'
      }
    });
  } catch (error: any) {
    console.error("PUT /api/artworks - Error:", error);
    return NextResponse.json({ 
      error: "Failed to update artwork",
      details: error.message 
    }, { 
      status: 500 
    });
  }
} 