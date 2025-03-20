import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const dataFilePath = path.join(process.cwd(), "data", "artworks.json");

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

// Initialize data file if it doesn't exist
async function initDataFile() {
  try {
    await fs.access(dataFilePath);
  } catch {
    const dirPath = path.join(process.cwd(), "data");
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath);
    }
    await fs.writeFile(dataFilePath, JSON.stringify(initialArtworks));
  }
}

// Helper to read artworks
async function getArtworks() {
  await initDataFile();
  const data = await fs.readFile(dataFilePath, "utf8");
  return JSON.parse(data);
}

// Helper to write artworks
async function writeArtworks(artworks: any[]) {
  await fs.writeFile(dataFilePath, JSON.stringify(artworks, null, 2));
}

// GET /api/artworks
export async function GET() {
  try {
    const artworks = await getArtworks();
    return NextResponse.json(artworks);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch artworks" },
      { status: 500 }
    );
  }
}

// POST /api/artworks
export async function POST(request: NextRequest) {
  try {
    const artworks = await getArtworks();
    const data = await request.json();

    const newArtwork = {
      id: uuidv4(),
      ...data,
      createdAt: new Date().toISOString(),
    };

    artworks.push(newArtwork);
    await writeArtworks(artworks);

    return NextResponse.json(newArtwork, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create artwork" },
      { status: 500 }
    );
  }
}

// DELETE /api/artworks
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Artwork ID is required" },
        { status: 400 }
      );
    }

    const artworks = await getArtworks();
    const updatedArtworks = artworks.filter((artwork: any) => artwork.id !== id);

    if (artworks.length === updatedArtworks.length) {
      return NextResponse.json(
        { error: "Artwork not found" },
        { status: 404 }
      );
    }

    await writeArtworks(updatedArtworks);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete artwork" },
      { status: 500 }
    );
  }
} 