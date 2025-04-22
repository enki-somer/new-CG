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
  Shield,
  Pencil,
  BookOpen,
} from "lucide-react";
import Image from "next/image";
import QRCode from "qrcode";
import Link from "next/link";

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

interface BlogPost {
  id: string;
  title: string;
  content: string;
  coverImage: string;
  tags: string[];
  createdAt: string;
  language: "en" | "ar";
}

interface BlogPostForm {
  title: string;
  content: string;
  coverImage: string;
  tags: string;
  language: "en" | "ar";
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [showRegisterButton, setShowRegisterButton] = useState(false);
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
  const [activeTab, setActiveTab] = useState<
    "gallery" | "about" | "contact" | "blog"
  >("gallery");
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
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [editingArtwork, setEditingArtwork] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ArtworkItem>>({});
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [newBlogPost, setNewBlogPost] = useState<BlogPostForm>({
    title: "",
    content: "",
    coverImage: "",
    tags: "",
    language: "en",
  });
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editPostForm, setEditPostForm] = useState<BlogPostForm>({
    title: "",
    content: "",
    coverImage: "",
    tags: "",
    language: "en",
  });

  // Check if admin exists
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await fetch("/api/auth/check-registration");
        const data = await response.json();
        setShowRegisterButton(!data.isRegistered);
      } catch (error) {
        console.error("Failed to check admin status:", error);
      }
    };
    checkAdmin();
  }, []);

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

  useEffect(() => {
    if (isAuthenticated && activeTab === "blog") {
      fetchBlogPosts();
    }
  }, [isAuthenticated, activeTab]);

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
      console.log("[Admin] Starting site info fetch...");
      const response = await fetch("/api/site-info", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      });
      console.log("[Admin] Site info response received:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[Admin] Failed to fetch site info - Response not OK:", {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });
        throw new Error(
          `Failed to fetch site info: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("[Admin] Site info fetched successfully:", data);
      setSiteInfo(data);

      // Initialize tempDescription for text area editing
      if (data.about && data.about.description) {
        setTempDescription(data.about.description);
      }
    } catch (_error: unknown) {
      console.error("[Admin] Failed to load site info:", _error);
      setError("Failed to load site information");
    }
  };

  const fetchBlogPosts = async () => {
    try {
      const response = await fetch("/api/blog");
      if (!response.ok) throw new Error("Failed to fetch blog posts");
      const data = await response.json();
      setPosts(data);
      return data;
    } catch (error) {
      console.error("Failed to fetch blog posts:", error);
      setError("Failed to fetch blog posts");
      return [];
    }
  };

  // Function to handle QR code generation
  const generateQRCode = async (otpauthUrl: string) => {
    try {
      console.log("Generating QR code for:", otpauthUrl);
      const url = await QRCode.toDataURL(otpauthUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });
      console.log("QR code generated successfully");
      return url;
    } catch (error) {
      console.error("Failed to generate QR code:", error);
      return null;
    }
  };

  // Function to handle initial password verification
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // Fetch 2FA setup with password verification
      const response = await fetch("/api/auth/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (response.status === 401) {
        setError("Invalid password");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch 2FA setup");
      }

      const data = await response.json();
      console.log("2FA setup data received");

      if (data.otpauth) {
        const qrCodeDataUrl = await generateQRCode(data.otpauth);
        if (qrCodeDataUrl) {
          setQrCodeUrl(qrCodeDataUrl);
          setShowTokenInput(true);
        } else {
          setError("Failed to generate QR code");
        }
      } else {
        setError("Invalid 2FA setup response");
      }
    } catch (error) {
      console.error("Failed to fetch 2FA setup:", error);
      setError("Failed to set up 2FA");
    }
  };

  // Function to handle complete login with 2FA
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password, token }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        fetchArtworks();
        fetchSiteInfo();
      } else {
        setError(data.error || "Authentication failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Failed to authenticate");
    }
  };

  const handleAddArtwork = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!newArtwork.image) {
        setError("Please upload a main image first");
        setIsLoading(false);
        return;
      }

      const artworkData = {
        ...newArtwork,
        additionalImages: additionalImages,
      };

      console.log("Sending artwork data:", artworkData);

      const response = await fetch("/api/artworks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(artworkData),
      });

      if (!response.ok) {
        throw new Error("Failed to add artwork");
      }

      const data = await response.json();
      setArtworks([...artworks, data]);

      // Clear the form
      setNewArtwork({
        title: "",
        category: "",
        description: "",
        image: "",
      });
      setAdditionalImages([]);

      setSuccess("Artwork added successfully!");

      // Revalidate paths without page refresh
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

        const updatedArtworksResponse = await fetch("/api/artworks");
        if (updatedArtworksResponse.ok) {
          const updatedArtworks = await updatedArtworksResponse.json();
          setArtworks(updatedArtworks);
        }
      } catch (revalidateError) {
        console.warn("Failed to revalidate paths:", revalidateError);
      }
    } catch (error: any) {
      console.error("Failed to add artwork:", error);
      setError(`Failed to add artwork: ${error.message}`);
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

  const handleImageUpload = async (file: File): Promise<string | null> => {
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
        return data.url;
      } else {
        throw new Error("No image URL returned from server");
      }
    } catch (error: any) {
      console.error("Failed to upload image:", error);
      setError(`Failed to upload image: ${error.message || "Unknown error"}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlogCoverImageUpload = async (
    file: File
  ): Promise<string | null> => {
    try {
      setIsLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("file", file);

      console.log("Uploading blog cover image to Cloudinary...");
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(`Failed to upload cover image: ${errorText}`);
      }

      const data = await response.json();
      console.log("Blog cover image upload successful:", data);

      if (data.url) {
        setNewBlogPost({ ...newBlogPost, coverImage: data.url });
        setSuccess("Cover image uploaded successfully!");
        return data.url;
      } else {
        throw new Error("No image URL returned from server");
      }
    } catch (error: any) {
      console.error("Failed to upload cover image:", error);
      setError(
        `Failed to upload cover image: ${error.message || "Unknown error"}`
      );
      return null;
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

  const handleAdditionalImageUpload = async (file: File) => {
    try {
      setIsLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload additional image");
      }

      const data = await response.json();
      setAdditionalImages([...additionalImages, data.url]);
      setSuccess("Additional image uploaded successfully!");
    } catch (error: any) {
      console.error("Failed to upload additional image:", error);
      setError(`Failed to upload additional image: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateArtwork = async (id: string) => {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch(`/api/artworks?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error("Failed to update artwork");
      }

      // Update the artwork in the local state
      setArtworks(
        artworks.map((art) => (art.id === id ? { ...art, ...editForm } : art))
      );

      setSuccess("Artwork updated successfully!");
      setEditingArtwork(null);
      setEditForm({});

      // Revalidate paths
      try {
        await fetch("/api/revalidate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paths: ["/work", "/", `/work/${id}`],
          }),
        });
      } catch (revalidateError) {
        console.warn("Failed to revalidate paths:", revalidateError);
      }
    } catch (error: any) {
      console.error("Failed to update artwork:", error);
      setError(`Failed to update artwork: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBlogPost = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Check if we have a cover image in the state
      if (!newBlogPost.coverImage || newBlogPost.coverImage.trim() === "") {
        setError("Please upload a cover image first");
        setIsLoading(false);
        return;
      }

      console.log("Creating blog post with data:", newBlogPost);

      const response = await fetch("/api/blog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newBlogPost,
          tags: newBlogPost.tags
            .split(",")
            .map((tag: string) => tag.trim())
            .filter(Boolean),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create blog post");
      }

      setSuccess("Blog post created successfully!");
      setNewBlogPost({
        title: "",
        content: "",
        coverImage: "",
        tags: "",
        language: "en",
      });
      await fetchBlogPosts();
    } catch (error: any) {
      console.error("Failed to create blog post:", error);
      setError(error.message || "Failed to create blog post");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartEdit = (post: BlogPost) => {
    setEditingPost(post.id);
    setEditPostForm({
      title: post.title,
      content: post.content,
      coverImage: post.coverImage,
      tags: post.tags.join(", "),
      language: post.language,
    });
  };

  const handleUpdateBlogPost = async (id: string) => {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch(`/api/blog/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editPostForm.title,
          content: editPostForm.content,
          coverImage: editPostForm.coverImage,
          tags: editPostForm.tags
            .split(",")
            .map((tag: string) => tag.trim())
            .filter(Boolean),
          language: editPostForm.language,
        }),
      });

      if (!response.ok) throw new Error("Failed to update blog post");

      setSuccess("Blog post updated successfully!");
      setEditingPost(null);
      setEditPostForm({
        title: "",
        content: "",
        coverImage: "",
        tags: "",
        language: "en",
      });
      const updatedPosts = await fetchBlogPosts();
      setPosts(updatedPosts);
    } catch (error) {
      console.error("Failed to update blog post:", error);
      setError("Failed to update blog post");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBlogPost = async (id: string) => {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch(`/api/blog/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete blog post");

      setSuccess("Blog post deleted successfully!");
      await fetchBlogPosts();
    } catch (error) {
      console.error("Failed to delete blog post:", error);
      setError("Failed to delete blog post");
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

              {!showTokenInput ? (
                // Password Form
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
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
                    Continue
                  </button>
                  {showRegisterButton && (
                    <Link
                      href="/register"
                      className="mt-4 block w-full rounded-lg border border-primary px-4 py-2.5 text-center text-primary hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black"
                    >
                      Register Admin Account
                    </Link>
                  )}
                </form>
              ) : (
                // 2FA Form
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-white">
                      <Shield className="h-4 w-4 text-primary" />
                      Enter 2FA Code
                    </label>
                    <input
                      type="text"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-white placeholder:text-white/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      pattern="\d{6}"
                      required
                    />
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowTokenInput(false)}
                      className="w-1/3 rounded-lg border border-white/20 px-4 py-2.5 text-white hover:bg-white/10"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="w-2/3 rounded-lg bg-primary px-4 py-2.5 text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black"
                    >
                      Login
                    </button>
                  </div>
                </form>
              )}
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
              onClick={() => setActiveTab("blog")}
              className={`mr-4 pb-2 text-lg font-medium transition-colors ${
                activeTab === "blog"
                  ? "border-b-2 border-primary text-primary"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Blog
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
                  {/* Additional Images Upload */}
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-white">
                      Additional Images (Optional)
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {additionalImages.map((img, index) => (
                        <div key={index} className="relative aspect-square">
                          <Image
                            src={img}
                            alt={`Additional image ${index + 1}`}
                            fill
                            className="rounded-lg object-cover"
                          />
                          <button
                            onClick={() => {
                              setAdditionalImages(
                                additionalImages.filter((_, i) => i !== index)
                              );
                            }}
                            className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      {additionalImages.length < 3 && (
                        <label className="relative flex aspect-square cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-white/30 hover:border-primary">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleAdditionalImageUpload(file);
                            }}
                          />
                          <Plus className="h-8 w-8 text-white/60" />
                        </label>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">
                      Upload up to 3 additional images (optional)
                    </p>
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
                          {editingArtwork === artwork.id ? (
                            <div className="space-y-4">
                              <input
                                type="text"
                                value={editForm.title || ""}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    title: e.target.value,
                                  })
                                }
                                className="w-full rounded-lg border border-white/20 bg-black/50 px-3 py-1.5 text-white"
                                placeholder="Title"
                              />
                              <input
                                type="text"
                                value={editForm.category || ""}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    category: e.target.value,
                                  })
                                }
                                className="w-full rounded-lg border border-white/20 bg-black/50 px-3 py-1.5 text-white"
                                placeholder="Category"
                              />
                              <textarea
                                value={editForm.description || ""}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    description: e.target.value,
                                  })
                                }
                                className="w-full rounded-lg border border-white/20 bg-black/50 px-3 py-1.5 text-white"
                                placeholder="Description"
                                rows={3}
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    handleUpdateArtwork(artwork.id)
                                  }
                                  disabled={isLoading}
                                  className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm text-white hover:bg-primary/90"
                                >
                                  <Save className="h-4 w-4" />
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingArtwork(null);
                                    setEditForm({});
                                  }}
                                  className="flex items-center gap-1 rounded-lg bg-gray-500 px-3 py-1.5 text-sm text-white hover:bg-gray-600"
                                >
                                  <X className="h-4 w-4" />
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-xl font-semibold text-white">
                                  {artwork.title}
                                </h3>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingArtwork(artwork.id);
                                      setEditForm({
                                        title: artwork.title,
                                        category: artwork.category,
                                        description: artwork.description,
                                      });
                                    }}
                                    className="rounded-full bg-primary/20 p-2 text-primary hover:bg-primary/30"
                                  >
                                    <Edit className="h-5 w-5" />
                                  </button>
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
                                      onClick={() =>
                                        setDeleteConfirm(artwork.id)
                                      }
                                      className="rounded-full bg-red-500/20 p-2 text-red-500 hover:bg-red-500/30"
                                    >
                                      <Trash2 className="h-5 w-5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                              <p className="mb-2 text-sm text-gray-300">
                                {artwork.description.length > 100
                                  ? artwork.description.substring(0, 100) +
                                    "..."
                                  : artwork.description}
                              </p>
                              <p className="text-sm text-primary">
                                {artwork.category}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {/* Blog Tab Content */}
          {activeTab === "blog" && (
            <>
              {/* Add New Blog Post Form */}
              <div className="mb-12 rounded-xl bg-gradient-to-br from-white/5 to-white/10 p-6 backdrop-blur-sm">
                <h2 className="mb-6 text-xl font-semibold text-white">
                  Add New Blog Post
                </h2>
                <form onSubmit={handleAddBlogPost} className="grid gap-6">
                  <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-white">
                        Title
                      </label>
                      <input
                        type="text"
                        value={newBlogPost.title}
                        onChange={(e) =>
                          setNewBlogPost({
                            ...newBlogPost,
                            title: e.target.value,
                          })
                        }
                        className={`w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 placeholder:text-white/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
                          newBlogPost.language === "ar"
                            ? "font-noto-naskh-arabic text-right"
                            : ""
                        }`}
                        dir={newBlogPost.language === "ar" ? "rtl" : "ltr"}
                        placeholder="Blog post title"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-white">
                        Language
                      </label>
                      <select
                        value={newBlogPost.language}
                        onChange={(e) =>
                          setNewBlogPost({
                            ...newBlogPost,
                            language: e.target.value as "en" | "ar",
                          })
                        }
                        className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="en">English</option>
                        <option value="ar">العربية</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">
                      Content
                    </label>
                    <textarea
                      value={newBlogPost.content}
                      onChange={(e) =>
                        setNewBlogPost({
                          ...newBlogPost,
                          content: e.target.value,
                        })
                      }
                      className={`w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-white placeholder:text-white/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
                        newBlogPost.language === "ar"
                          ? "font-noto-naskh-arabic text-right"
                          : ""
                      }`}
                      dir={newBlogPost.language === "ar" ? "rtl" : "ltr"}
                      placeholder="Blog post content"
                      rows={10}
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={newBlogPost.tags}
                      onChange={(e) =>
                        setNewBlogPost({
                          ...newBlogPost,
                          tags: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-white placeholder:text-white/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="tag1, tag2, tag3"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">
                      Cover Image
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleBlogCoverImageUpload(file);
                          }
                        }}
                        className="hidden"
                        id="blog-cover-image"
                        required={!newBlogPost.coverImage}
                      />
                      <label
                        htmlFor="blog-cover-image"
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-white hover:bg-white/20"
                      >
                        <Upload className="h-5 w-5" />
                        Choose Image
                      </label>
                      {newBlogPost.coverImage && (
                        <span className="text-sm text-white/70">
                          Cover image selected
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="rounded-lg bg-primary px-4 py-2.5 text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50"
                  >
                    {isLoading ? "Creating..." : "Create Blog Post"}
                  </button>
                </form>
              </div>

              {/* Existing Blog Posts */}
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </div>
                    <div className="p-6">
                      {editingPost === post.id ? (
                        <div className="space-y-4">
                          <input
                            type="text"
                            value={editPostForm.title || ""}
                            onChange={(e) =>
                              setEditPostForm({
                                ...editPostForm,
                                title: e.target.value,
                              })
                            }
                            className="w-full rounded-lg border border-white/20 bg-black/50 px-3 py-1.5 text-white"
                            placeholder="Title"
                          />
                          <textarea
                            value={editPostForm.content || ""}
                            onChange={(e) =>
                              setEditPostForm({
                                ...editPostForm,
                                content: e.target.value,
                              })
                            }
                            className="w-full rounded-lg border border-white/20 bg-black/50 px-3 py-1.5 text-white"
                            placeholder="Content"
                            rows={3}
                          />
                          <input
                            type="text"
                            value={editPostForm.tags || ""}
                            onChange={(e) =>
                              setEditPostForm({
                                ...editPostForm,
                                tags: e.target.value,
                              })
                            }
                            className="w-full rounded-lg border border-white/20 bg-black/50 px-3 py-1.5 text-white"
                            placeholder="Tags (comma-separated)"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateBlogPost(post.id)}
                              disabled={isLoading}
                              className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm text-white hover:bg-primary/90"
                            >
                              <Save className="h-4 w-4" />
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingPost(null);
                                setEditPostForm({
                                  title: "",
                                  content: "",
                                  coverImage: "",
                                  tags: "",
                                  language: "en",
                                });
                              }}
                              className="flex items-center gap-1 rounded-lg bg-gray-500 px-3 py-1.5 text-sm text-white hover:bg-gray-600"
                            >
                              <X className="h-4 w-4" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-white">
                              {post.title}
                            </h3>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleStartEdit(post)}
                                className="rounded-full bg-primary/20 p-2 text-primary hover:bg-primary/30"
                              >
                                <Pencil className="h-5 w-5" />
                              </button>
                              {deleteConfirm === post.id ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() =>
                                      handleDeleteBlogPost(post.id)
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
                                  onClick={() => setDeleteConfirm(post.id)}
                                  className="rounded-full bg-red-500/20 p-2 text-red-500 hover:bg-red-500/30"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="mb-4 flex flex-wrap gap-2">
                            {post.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-primary/20 px-3 py-1 text-xs text-primary"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <p className="mb-4 text-sm text-gray-400">
                            {post.content.length > 150
                              ? post.content.substring(0, 150) + "..."
                              : post.content}
                          </p>
                          <p className="text-sm text-gray-400">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                        </>
                      )}
                    </div>
                  </motion.article>
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
