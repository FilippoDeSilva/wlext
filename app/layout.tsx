import type { Metadata, Viewport } from "next";
import "./globals.css";
import InstallPWA from "./Components/InstallPWA";
import ServiceWorkerRegistration from "./Components/ServiceWorkerRegistration";

export const metadata: Metadata = {
  title: "Wlext",
  description: "Enjoy International movies from all over the world!",
  manifest: "/manifest.json",
  icons: {
    apple: [
      { url: "https://wlext.is/wp-content/uploads/2016/08/cropped-63960-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "https://wlext.is/wp-content/uploads/2016/08/cropped-63960-192x192.png", sizes: "512x512", type: "image/png" }
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
      <body className='antialiased m-0 p-0 overflow-hidden'>
        {children}
        <ServiceWorkerRegistration />
        <InstallPWA />
      </body>
    </html>
  );
}
