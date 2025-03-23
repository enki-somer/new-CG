/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
    domains: ["localhost"],
  },
  // Ensure your app works with GitHub Pages
  basePath: process.env.NODE_ENV === "production" ? "/enki" : "",
  // Disable server-side features not needed for static export
  experimental: {
    appDir: true,
  },
};

module.exports = nextConfig;
