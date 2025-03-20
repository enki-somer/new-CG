import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { CustomCursor } from "@/components/custom-cursor";
import Script from "next/script";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "KELWA",
  description: "Portfolio showcasing stunning CG artwork and projects",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Preload critical assets */}
        <link rel="preload" href="/images/cg (2).jpg" as="image" />
      </head>
      <body
        className={`${spaceGrotesk.className} antialiased`}
        suppressHydrationWarning
      >
        <CustomCursor />
        <Navigation />
        <div id="main-content">{children}</div>
        <Footer />

        {/* Disable Grammarly and similar extensions on this site */}
        <Script id="disable-grammar-extensions" strategy="afterInteractive">
          {`
            document.body.setAttribute('data-grammarly-skip', 'true');
            
            // Force removal of extension attributes that cause hydration warnings
            window.addEventListener('load', () => {
              setTimeout(() => {
                document.documentElement.removeAttribute('data-gr-ext-installed');
                document.documentElement.removeAttribute('data-new-gr-c-s-check-loaded');
                document.body.removeAttribute('data-gr-ext-installed');
                document.body.removeAttribute('data-new-gr-c-s-check-loaded');
              }, 100);
            });
          `}
        </Script>
      </body>
    </html>
  );
}
