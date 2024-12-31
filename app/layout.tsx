import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import InstallPWA from "./Components/InstallPWA";
import ServiceWorkerRegistration from "./Components/ServiceWorkerRegistration";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wlext.is",
  description: "Enjoy International movies from all over the world!",
  manifest: "/manifest.json",
  icons: {
    apple: [
      { url: "https://wlext.is/wp-content/uploads/2016/08/cropped-63960-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "https://wlext.is/wp-content/uploads/2016/08/cropped-63960-192x192.png", sizes: "512x512", type: "image/png" }
    ],
  },
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" href="https://wlext.is/wp-content/uploads/2016/08/cropped-63960-192x192.png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <ServiceWorkerRegistration />
        <InstallPWA />
      </body>
    </html>
  );
}
