import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { CursorWrapper } from "@/components/cursor-wrapper";
import Script from "next/script";

// Load font with subset optimization
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false, // Changed to false to reduce processing
  weight: ["400", "500", "700"], // Only load the weights we need
});

export const metadata: Metadata = {
  title: "Enki",
  description: "Portfolio showcasing stunning CG artwork and projects",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/favicon.svg" }],
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://localhost:3000" />
        <link rel="dns-prefetch" href="https://localhost:3000" />
        {/* Preload critical assets */}
        <link rel="preload" href="/images/cg (2).jpg" as="image" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body
        className={`${spaceGrotesk.className} antialiased bg-black`}
        suppressHydrationWarning
      >
        <CursorWrapper />
        <Navigation />
        <div id="main-content">{children}</div>
        <Footer />

        {/* Error handling and performance improvements */}
        <Script id="error-handling" strategy="afterInteractive">
          {`
            // Global error handler to prevent unhandled errors from crashing the app
            window.addEventListener('error', function(event) {
              // Don't show errors in production unless they're critical
              if (process.env.NODE_ENV !== 'production') {
                console.warn('Caught error:', event.error);
              }
              // Prevent the error from completely crashing the app
              event.preventDefault();
              return true;
            });
            
            // Fix for common third-party script errors
            window.addEventListener('unhandledrejection', function(event) {
              // Don't show errors in production unless they're critical
              if (process.env.NODE_ENV !== 'production') {
                console.warn('Unhandled promise rejection:', event.reason);
              }
              // Prevent the error from completely crashing the app
              event.preventDefault();
              return true;
            });
            
            // Disable Grammarly and similar extensions on this site
            document.body.setAttribute('data-grammarly-skip', 'true');
            
            // Force removal of extension attributes that cause hydration warnings
            window.addEventListener('load', () => {
              setTimeout(() => {
                document.documentElement.removeAttribute('data-gr-ext-installed');
                document.documentElement.removeAttribute('data-new-gr-c-s-check-loaded');
                document.body.removeAttribute('data-gr-ext-installed');
                document.body.removeAttribute('data-new-gr-c-s-check-loaded');
                
                // Fix any WebGL context errors
                const canvases = document.querySelectorAll('canvas');
                canvases.forEach(canvas => {
                  if (canvas.parentElement && !canvas.getAttribute('data-processed')) {
                    const style = window.getComputedStyle(canvas.parentElement);
                    if (style.display === 'none' || style.visibility === 'hidden') {
                      canvas.parentElement.style.display = 'block';
                      canvas.parentElement.style.visibility = 'visible';
                      canvas.setAttribute('data-processed', 'true');
                    }
                  }
                });
                
                // Remove any duplicate canvas elements (common Three.js issue)
                const containers = document.querySelectorAll('[class*="three-scene"]');
                containers.forEach(container => {
                  const canvases = container.querySelectorAll('canvas');
                  if (canvases.length > 1) {
                    for (let i = 1; i < canvases.length; i++) {
                      canvases[i].remove();
                    }
                  }
                });
              }, 100);
            });
          `}
        </Script>
      </body>
    </html>
  );
}
