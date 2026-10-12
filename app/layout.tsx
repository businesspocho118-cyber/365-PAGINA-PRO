import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "365 THE BEGINNING",
  description: "365 THE BEGINNING — Una experiencia para acompañar un regalo de 365 días.",
  manifest: "/manifest.webmanifest",
  robots: {
    index: false,
    follow: false,
  },
  icons: {
    icon: "/icon.svg",
  },
  formatDetection: {
    telephone: false,
    date: false,
    email: false,
    address: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#12051f",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
