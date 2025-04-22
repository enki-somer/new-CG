"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Shield, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [canAccess, setCanAccess] = useState(false);

  // Check if registration is allowed
  useEffect(() => {
    const checkRegistration = async () => {
      try {
        const response = await fetch("/api/auth/check-registration");
        const data = await response.json();
        setCanAccess(!data.isRegistered);
      } catch (error) {
        console.error("Failed to check registration status:", error);
        setError("Failed to check registration status");
      }
    };
    checkRegistration();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      if (password.length < 12) {
        throw new Error("Password must be at least 12 characters long");
      }

      // First, register the password and get 2FA setup
      const setupResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (!setupResponse.ok) {
        const data = await setupResponse.json();
        throw new Error(data.error || "Failed to register");
      }

      const setupData = await setupResponse.json();

      if (setupData.otpauth) {
        setQrCodeUrl(setupData.qrCode);
        setSuccess(
          "Please scan the QR code with your authenticator app and enter the code to complete registration"
        );
      } else {
        throw new Error("Invalid registration response");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      setError(error.message || "Failed to register");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/verify-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Registration completed successfully!");
        setTimeout(() => {
          router.push("/admin");
        }, 2000);
      } else {
        throw new Error(data.error || "Invalid verification code");
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      setError(error.message || "Failed to verify code");
    } finally {
      setIsLoading(false);
    }
  };

  if (!canAccess) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-black via-primary/20 to-black pt-24">
        <div className="text-center text-white">
          Registration is not available. An admin account already exists.
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
          className="mx-auto max-w-md"
        >
          <div className="rounded-xl bg-gradient-to-br from-white/5 to-white/10 p-6 backdrop-blur-sm">
            <div className="mb-6 flex items-center justify-center text-primary">
              <Shield className="h-12 w-12" />
            </div>
            <h1 className="mb-6 text-center text-2xl font-bold text-white">
              Admin Registration
            </h1>

            {error && (
              <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-500">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-500/10 p-3 text-sm text-green-500">
                <CheckCircle className="h-4 w-4" />
                {success}
              </div>
            )}

            {!qrCodeUrl ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">
                    Set Admin Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-white placeholder:text-white/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Enter secure password"
                      required
                      minLength={12}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-white placeholder:text-white/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Confirm password"
                      required
                      minLength={12}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-lg bg-primary px-4 py-2.5 text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50"
                >
                  {isLoading ? "Setting up..." : "Set Password & Enable 2FA"}
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="rounded-lg bg-white p-4">
                  <Image
                    src={qrCodeUrl}
                    alt="2FA QR Code"
                    width={300}
                    height={300}
                    className="mx-auto"
                  />
                </div>

                <div className="space-y-2 text-center text-sm text-gray-400">
                  <p>Scan this QR code with your authenticator app</p>
                  <p>
                    (Google Authenticator, Authy, or any compatible TOTP app)
                  </p>
                </div>

                <form onSubmit={handleVerifyToken} className="space-y-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-white">
                      <Lock className="h-4 w-4 text-primary" />
                      Verification Code
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

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-lg bg-primary px-4 py-2.5 text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50"
                  >
                    {isLoading ? "Verifying..." : "Complete Registration"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
