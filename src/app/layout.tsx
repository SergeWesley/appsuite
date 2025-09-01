import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import AppTracker from "@/components/tracker/AppTracker";

export const metadata: Metadata = {
  title: "AppSuite - Votre suite d'applications",
  description:
    "AppSuite regroupe tous vos outils essentiels, dont Booker pour la gestion de livres. Organisez, suivez et optimisez vos tâches avec une suite moderne et intuitive.",
  keywords: "Applications, outils, productivité, gestion, suite",
  authors: [{ name: "AppSuite" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AppSuite",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-192x192.png", sizes: "192x192", type: "image/png" }],
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
    <html lang="fr" className="dark">
      <body className="antialiased dark:bg-gray-900 dark:text-gray-100">
        <AuthProvider>
          <AppTracker />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
