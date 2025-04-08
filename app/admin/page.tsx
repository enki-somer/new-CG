"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Trash2,
  Upload,
  Lock,
  CheckCircle,
  Edit,
  Save,
  Phone,
  Mail,
  MapPin,
  Plus,
  X,
} from "lucide-react";
import Image from "next/image";

interface ArtworkItem {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
}

interface AboutInfo {
  title: string;
  subtitle: string;
  description: string[];
  image: string;
  skills: string[];
}

interface ContactInfo {
  email: string;
  phone: string;
  location: string;
  availableFor: string[];
}

interface SiteInfo {
  about: AboutInfo;
  contact: ContactInfo;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [artworks, setArtworks] = useState<ArtworkItem[]>([]);
  const [newArtwork, setNewArtwork] = useState({
    title: "",
    category: "",
    description: "",
    image: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // New state for managing tabs and site info
  const [activeTab, setActiveTab] = useState<"gallery" | "about" | "contact">(
    "gallery"
  );
  const [siteInfo, setSiteInfo] = useState<SiteInfo>({
    about: {
      title: "About Me",
      subtitle: "CG Artist & Designer",
      description: [],
      image: "/images/cg (3).jpg",
      skills: [],
    },
    contact: {
      email: "contact@example.com",
      phone: "+1 (555) 123-4567",
      location: "Los Angeles, CA",
      availableFor: [],
    },
  });
  const [newSkill, setNewSkill] = useState("");
  const [newAvailability, setNewAvailability] = useState("");
  const [tempDescription, setTempDescription] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState({
    about: false,
    contact: false,
  });

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Fetch artworks and site info on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchArtworks();
      fetchSiteInfo();
    }
  }, [isAuthenticated]);

  const fetchArtworks = async () => {
    try {
      const response = await fetch("/api/artworks");
      if (!response.ok) throw new Error("Failed to fetch artworks");
      const data = await response.json();
      setArtworks(data);
    } catch (_error: unknown) {
      console.error("Failed to fetch artworks:", _error);
      setError("Failed to load artworks");
    }
  };

  const fetchSiteInfo = async () => {
    try {
      const response = await fetch("/api/site-info");
      if (!response.ok) throw new Error("Failed to fetch site info");
      const data = await response.json();
      setSiteInfo(data);

      // Initialize tempDescription for text area editing
      if (data.about && data.about.description) {
        setTempDescription(data.about.description);
      }
    } catch (_error: unknown) {
      console.error("Failed to load site info:", _error);
      setError("Failed to load site information");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this should be a secure authentication process
    if (password === "Bat160") {
      setIsAuthenticated(true);
      setError("");
      fetchArtworks();
      fetchSiteInfo();
    } else {
      setError("Invalid password");
    }
  };

  const handleAddArtwork = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate that we have an image
      if (!newArtwork.image) {
        setError("Please upload an image first");
        setIsLoading(false);
        return;
      }

      // Log the data we're sending to help debug
      console.log("Sending artwork data:", newArtwork);

      const response = await fetch("/api/artworks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
        body: JSON.stringify(newArtwork),
        cache: "no-store",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Server error response:", errorData);
        throw new Error(`Failed to add artwork: ${response.status}`);
      }

      const data = await response.json();
      console.log("Artwork added successfully:", data);

      // Add to the state
      setArtworks([...artworks, data]);

      // Clear the form
      setNewArtwork({
        title: "",
        category: "",
        description: "",
        image: "",
      });

      setSuccess("Artwork added successfully!");

      // Force a revalidation by making multiple GET requests with different cache-busting techniques
      try {
        console.log("Force revalidating artwork cache...");

        // Method 1: Use no-store cache option
        await fetch("/api/artworks", {
          method: "GET",
          cache: "no-store",
          headers: {
            "x-force-revalidate": "true",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        });

        // Method 2: Use timestamp query parameter to bust cache
        const timestamp = new Date().getTime();
        await fetch(`/api/artworks?t=${timestamp}`, {
          method: "GET",
          cache: "no-store",
        });

        // Method 3: Attempt to manually revalidate the paths
        try {
          await fetch("/api/revalidate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              paths: ["/work", "/"],
            }),
          });
        } catch (revalidatePathError) {
          console.warn("Path revalidation failed:", revalidatePathError);
        }

        console.log("Cache revalidation attempts completed");
      } catch (revalidateError) {
        console.warn("Failed to force revalidation:", revalidateError);
        // We don't need to show this error to the user
      }
    } catch (error: any) {
      console.error("Failed to add artwork:", error);
      setError(`Failed to add artwork: ${error.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteArtwork = async (id: string) => {
    try {
      setIsLoading(true);
      setError("");

      console.log(`Attempting to delete artwork with ID: ${id}`);
      const response = await fetch(`/api/artworks?id=${id}`, {
        method: "DELETE",
        cache: "no-store", // Ensure we're not using cached response
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error("Delete artwork error response:", responseData);
        throw new Error(`Failed to delete artwork: ${response.status}`);
      }

      // Remove the artwork from the state
      setArtworks(artworks.filter((artwork) => artwork.id !== id));
      setSuccess("Artwork deleted successfully!");
      setDeleteConfirm(null);

      // Force a revalidation by making a GET request with no cache
      // This helps ensure the deleted artwork doesn't appear in the gallery
      try {
        await fetch("/api/artworks", {
          method: "GET",
          cache: "no-store",
          headers: { "x-force-revalidate": "true" },
        });
        console.log("Forced revalidation of artworks after deletion");
      } catch (revalidateError) {
        console.warn(
          "Failed to force revalidation after deletion:",
          revalidateError
        );
        // We don't need to show this error to the user
      }
    } catch (error: any) {
      console.error("Failed to delete artwork:", error);
      setError(`Failed to delete artwork: ${error.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setIsLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("file", file);

      console.log("Uploading image to Cloudinary...");
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(`Failed to upload image: ${errorText}`);
      }

      const data = await response.json();
      console.log("Image upload successful:", data);

      // Use the Cloudinary URL from the response
      if (data.url) {
        setNewArtwork({ ...newArtwork, image: data.url });
        setSuccess("Image uploaded successfully!");
      } else {
        throw new Error("No image URL returned from server");
      }
    } catch (error: any) {
      console.error("Failed to upload image:", error);
      setError(`Failed to upload image: ${error.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAbout = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Prepare the updated about data
      const updatedAbout = {
        ...siteInfo.about,
        description: tempDescription, // Use the textarea content
      };

      const response = await fetch("/api/site-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ about: updatedAbout }),
      });

      if (!response.ok) throw new Error("Failed to update about information");

      const data = await response.json();
      setSiteInfo(data);
      setIsEditing({ ...isEditing, about: false });
      setSuccess("About information updated successfully!");
    } catch (_error: unknown) {
      console.error("Failed to update about info:", _error);
      setError("Failed to update about information");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveContact = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/site-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contact: siteInfo.contact }),
      });

      if (!response.ok) throw new Error("Failed to update contact information");

      const data = await response.json();
      setSiteInfo(data);
      setIsEditing({ ...isEditing, contact: false });
      setSuccess("Contact information updated successfully!");
    } catch (_error: unknown) {
      console.error("Failed to update contact info:", _error);
      setError("Failed to update contact information");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() === "") return;

    if (!siteInfo.about.skills.includes(newSkill)) {
      const updatedSkills = [...siteInfo.about.skills, newSkill];
      setSiteInfo({
        ...siteInfo,
        about: {
          ...siteInfo.about,
          skills: updatedSkills,
        },
      });
    }

    setNewSkill("");
  };

  const handleRemoveSkill = (skill: string) => {
    const updatedSkills = siteInfo.about.skills.filter((s) => s !== skill);
    setSiteInfo({
      ...siteInfo,
      about: {
        ...siteInfo.about,
        skills: updatedSkills,
      },
    });
  };

  const handleAddAvailability = () => {
    if (newAvailability.trim() === "") return;

    if (!siteInfo.contact.availableFor.includes(newAvailability)) {
      const updatedAvailability = [
        ...siteInfo.contact.availableFor,
        newAvailability,
      ];
      setSiteInfo({
        ...siteInfo,
        contact: {
          ...siteInfo.contact,
          availableFor: updatedAvailability,
        },
      });
    }

    setNewAvailability("");
  };

  const handleRemoveAvailability = (item: string) => {
    const updatedAvailability = siteInfo.contact.availableFor.filter(
      (a) => a !== item
    );
    setSiteInfo({
      ...siteInfo,
      contact: {
        ...siteInfo.contact,
        availableFor: updatedAvailability,
      },
    });
  };

  const handleAboutImageUpload = async (file: File) => {
    try {
      setIsLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("file", file);

      console.log("Uploading about image to Cloudinary...");
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(`Failed to upload about image: ${errorText}`);
      }

      const data = await response.json();
      console.log("About image upload successful:", data);

      // Use the Cloudinary URL from the response
      if (data.url) {
        setSiteInfo({
          ...siteInfo,
          about: {
            ...siteInfo.about,
            image: data.url,
          },
        });
        setSuccess("About image updated successfully!");
      } else {
        throw new Error("No image URL returned from server");
      }
    } catch (error: any) {
      console.error("Failed to upload about image:", error);
      setError(
        `Failed to upload about image: ${error.message || "Unknown error"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-black via-primary/20 to-black pt-24">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-md"
          >
            <div className="rounded-xl bg-gradient-to-br from-white/5 to-white/10 p-6 backdrop-blur-sm">
              <div className="mb-6 flex items-center justify-center text-primary">
                <Lock className="h-12 w-12" />
              </div>
              <h1 className="mb-6 text-center text-2xl font-bold text-white">
                Admin Access
              </h1>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-white placeholder:text-white/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Enter admin password"
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <button
                  type="submit"
                  className="w-full rounded-lg bg-primary px-4 py-2.5 text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black"
                >
                  Login
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-primary/20 to-black pt-24">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="mb-8 text-3xl font-bold text-white">
            Admin Dashboard
          </h1>

          {error && (
            <div className="mb-6 rounded-lg bg-red-500/10 p-4 text-red-500">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 flex items-center gap-2 rounded-lg bg-green-500/10 p-4 text-green-500">
              <CheckCircle className="h-5 w-5" />
              {success}
            </div>
          )}

          {/* Tab Navigation */}
          <div className="mb-8 flex border-b border-white/10">
            <button
              onClick={() => setActiveTab("gallery")}
              className={`mr-4 pb-2 text-lg font-medium transition-colors ${
                activeTab === "gallery"
                  ? "border-b-2 border-primary text-primary"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Gallery
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`mr-4 pb-2 text-lg font-medium transition-colors ${
                activeTab === "about"
                  ? "border-b-2 border-primary text-primary"
                  : "text-white/70 hover:text-white"
              }`}
            >
              About Page
            </button>
            <button
              onClick={() => setActiveTab("contact")}
              className={`pb-2 text-lg font-medium transition-colors ${
                activeTab === "contact"
                  ? "border-b-2 border-primary text-primary"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Contact Info
            </button>
          </div>

          {/* Gallery Tab Content */}
          {activeTab === "gallery" && (
            <>
              {/* Add New Artwork Form */}
              <div className="mb-12 rounded-xl bg-gradient-to-br from-white/5 to-white/10 p-6 backdrop-blur-sm">
                <h2 className="mb-6 text-xl font-semibold text-white">
                  Add New Artwork
                </h2>
                <form onSubmit={handleAddArtwork} className="grid gap-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-white">
                        Title
                      </label>
                      <input
                        type="text"
                        value={newArtwork.title}
                        onChange={(e) =>
                          setNewArtwork({
                            ...newArtwork,
                            title: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-white placeholder:text-white/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="Artwork title"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-white">
                        Category
                      </label>
                      <input
                        type="text"
                        value={newArtwork.category}
                        onChange={(e) =>
                          setNewArtwork({
                            ...newArtwork,
                            category: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-white placeholder:text-white/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="Category"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">
                      Description
                    </label>
                    <textarea
                      value={newArtwork.description}
                      onChange={(e) =>
                        setNewArtwork({
                          ...newArtwork,
                          description: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-white placeholder:text-white/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Artwork description"
                      rows={3}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">
                      Image
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageUpload(file);
                          }
                        }}
                        className="hidden"
                        id="artwork-image"
                        required={!newArtwork.image}
                      />
                      <label
                        htmlFor="artwork-image"
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-white hover:bg-white/20"
                      >
                        <Upload className="h-5 w-5" />
                        Choose Image
                      </label>
                      {newArtwork.image && (
                        <span className="text-sm text-white/70">
                          Image selected
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="rounded-lg bg-primary px-4 py-2.5 text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50"
                  >
                    {isLoading ? "Adding..." : "Add Artwork"}
                  </button>
                </form>
              </div>

              {/* Existing Artworks */}
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {artworks.map((artwork) => (
                  <motion.div
                    key={artwork.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-white/5 to-white/10 p-1 backdrop-blur-sm"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                      <Image
                        src={artwork.image}
                        alt={artwork.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <div className="absolute inset-0 flex items-end p-6 opacity-0 transition-all duration-300 group-hover:opacity-100">
                        <div className="w-full">
                          <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-white">
                              {artwork.title}
                            </h3>
                            {deleteConfirm === artwork.id ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    handleDeleteArtwork(artwork.id)
                                  }
                                  className="rounded-lg bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="rounded-lg bg-gray-500 px-3 py-1 text-sm text-white hover:bg-gray-600"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirm(artwork.id)}
                                className="rounded-full bg-red-500/20 p-2 text-red-500 hover:bg-red-500/30"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                          <p className="mb-2 text-sm text-gray-300">
                            {artwork.description}
                          </p>
                          <span className="inline-block rounded-full bg-primary/20 px-3 py-1 text-sm text-primary">
                            {artwork.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {/* About Page Tab Content */}
          {activeTab === "about" && (
            <div className="rounded-xl bg-gradient-to-br from-white/5 to-white/10 p-6 backdrop-blur-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  About Page Information
                </h2>
                {isEditing.about ? (
                  <button
                    onClick={handleSaveAbout}
                    disabled={isLoading}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    Save Changes
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing({ ...isEditing, about: true })}
                    className="flex items-center gap-2 rounded-lg bg-primary/20 px-4 py-2 text-white hover:bg-primary/30"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                )}
              </div>

              <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
                <div className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">
                      Title
                    </label>
                    <input
                      type="text"
                      value={siteInfo.about.title}
                      onChange={(e) =>
                        setSiteInfo({
                          ...siteInfo,
                          about: { ...siteInfo.about, title: e.target.value },
                        })
                      }
                      disabled={!isEditing.about}
                      className="w-full rounded-lg border border-white/30 bg-black/50 px-4 py-2.5 text-white placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={siteInfo.about.subtitle}
                      onChange={(e) =>
                        setSiteInfo({
                          ...siteInfo,
                          about: {
                            ...siteInfo.about,
                            subtitle: e.target.value,
                          },
                        })
                      }
                      disabled={!isEditing.about}
                      className="w-full rounded-lg border border-white/30 bg-black/50 px-4 py-2.5 text-white placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">
                      Description
                    </label>
                    <textarea
                      value={
                        isEditing.about
                          ? tempDescription.join("\n\n")
                          : siteInfo.about.description.join("\n\n")
                      }
                      onChange={(e) => {
                        const paragraphs = e.target.value
                          .split("\n\n")
                          .map((p) => p.trim())
                          .filter((p) => p.length > 0);
                        setTempDescription(paragraphs);
                      }}
                      disabled={!isEditing.about}
                      rows={10}
                      className="w-full rounded-lg border border-white/30 bg-black/50 px-4 py-2.5 text-white placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
                      placeholder="Enter description paragraphs separated by blank lines"
                    />
                    <p className="mt-1 text-sm text-gray-400">
                      Separate paragraphs with a blank line
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">
                      Skills
                    </label>
                    <div className="mb-4 flex flex-wrap gap-2">
                      {siteInfo.about.skills.map((skill) => (
                        <div
                          key={skill}
                          className="flex items-center rounded-full bg-primary/20 px-3 py-1 text-sm text-white"
                        >
                          {skill}
                          {isEditing.about && (
                            <button
                              onClick={() => handleRemoveSkill(skill)}
                              className="ml-2 rounded-full p-1 hover:bg-primary/30"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {isEditing.about && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          className="w-full rounded-lg border border-white/30 bg-black/50 px-4 py-2 text-white placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          placeholder="Add a new skill"
                        />
                        <button
                          onClick={handleAddSkill}
                          className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
                        >
                          <Plus className="h-4 w-4" />
                          Add
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="rounded-xl bg-black/30 p-4">
                    <label className="mb-2 block text-sm font-medium text-white">
                      Profile Image
                    </label>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-black/40">
                      {siteInfo.about.image && (
                        <Image
                          src={siteInfo.about.image}
                          alt="Profile"
                          fill
                          className="object-cover"
                        />
                      )}
                      {isEditing.about && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleAboutImageUpload(file);
                              }
                            }}
                            className="hidden"
                            id="about-image"
                          />
                          <label
                            htmlFor="about-image"
                            className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
                          >
                            <Upload className="h-4 w-4" />
                            Change Image
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contact Info Tab Content */}
          {activeTab === "contact" && (
            <div className="rounded-xl bg-gradient-to-br from-white/5 to-white/10 p-6 backdrop-blur-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  Contact Information
                </h2>
                {isEditing.contact ? (
                  <button
                    onClick={handleSaveContact}
                    disabled={isLoading}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    Save Changes
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      setIsEditing({ ...isEditing, contact: true })
                    }
                    className="flex items-center gap-2 rounded-lg bg-primary/20 px-4 py-2 text-white hover:bg-primary/30"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                )}
              </div>

              <div className="grid gap-8 lg:grid-cols-2">
                <div className="space-y-6">
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
                      <Mail className="h-4 w-4 text-primary" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={siteInfo.contact.email}
                      onChange={(e) =>
                        setSiteInfo({
                          ...siteInfo,
                          contact: {
                            ...siteInfo.contact,
                            email: e.target.value,
                          },
                        })
                      }
                      disabled={!isEditing.contact}
                      className="w-full rounded-lg border border-white/30 bg-black/50 px-4 py-2.5 text-white placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
                      <Phone className="h-4 w-4 text-primary" />
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={siteInfo.contact.phone}
                      onChange={(e) =>
                        setSiteInfo({
                          ...siteInfo,
                          contact: {
                            ...siteInfo.contact,
                            phone: e.target.value,
                          },
                        })
                      }
                      disabled={!isEditing.contact}
                      className="w-full rounded-lg border border-white/30 bg-black/50 px-4 py-2.5 text-white placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
                      <MapPin className="h-4 w-4 text-primary" />
                      Location
                    </label>
                    <input
                      type="text"
                      value={siteInfo.contact.location}
                      onChange={(e) =>
                        setSiteInfo({
                          ...siteInfo,
                          contact: {
                            ...siteInfo.contact,
                            location: e.target.value,
                          },
                        })
                      }
                      disabled={!isEditing.contact}
                      className="w-full rounded-lg border border-white/30 bg-black/50 px-4 py-2.5 text-white placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
                    />
                  </div>
                </div>

                <div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">
                      Available For
                    </label>
                    <div className="mb-4 flex flex-wrap gap-2">
                      {siteInfo.contact.availableFor.map((item) => (
                        <div
                          key={item}
                          className="flex items-center rounded-full bg-primary/20 px-3 py-1 text-sm text-white"
                        >
                          {item}
                          {isEditing.contact && (
                            <button
                              onClick={() => handleRemoveAvailability(item)}
                              className="ml-2 rounded-full p-1 hover:bg-primary/30"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {isEditing.contact && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newAvailability}
                          onChange={(e) => setNewAvailability(e.target.value)}
                          className="w-full rounded-lg border border-white/30 bg-black/50 px-4 py-2 text-white placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          placeholder="Add a new availability"
                        />
                        <button
                          onClick={handleAddAvailability}
                          className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
                        >
                          <Plus className="h-4 w-4" />
                          Add
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
