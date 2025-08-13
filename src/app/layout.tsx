import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "Booker - Gestionnaire de bibliothèque personnelle",
  description: "Application moderne pour gérer votre collection de livres. Suivez votre progression de lecture, ajoutez des notes et organisez votre bibliothèque personnelle.",
  keywords: "livres, bibliothèque, lecture, gestion, collection, progression",
  authors: [{ name: "Booker App" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Booker",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#f9fafb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('Service Worker enregistré avec succès:', registration.scope);
                    })
                    .catch(function(error) {
                      console.log("Échec de l\'enregistrement du Service Worker:", error);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
