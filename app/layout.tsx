import type { Metadata, Viewport } from "next";
import "./globals.css";
import InstallPWA from "@/app/Components/InstallPWA";
import ServiceWorkerRegistration from "@/app/Components/ServiceWorkerRegistration";

export const metadata: Metadata = {
  title: "Wlext",
  description: "Enjoy International movies from all over the world!",
  manifest: "/manifest.json",
  icons: {
    apple: [
      { url: "https://wlext.is/wp-content/uploads/2022/09/TELENOVELA-WORLD.jpg", sizes: "192x192", type: "image/png" },
      { url: "https://wlext.is/wp-content/uploads/2022/09/TELENOVELA-WORLD.jpg", sizes: "512x512", type: "image/png" }
    ],
  }
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-hidden">
      <body className='m-0 p-0 overflow-hidden'>
        {children}
        <ServiceWorkerRegistration />
        <InstallPWA />
      </body>
    </html>
  );
}
