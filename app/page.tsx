"use client";
import { useEffect, useState } from "react";

function MoviesPage() {
  const [isChromium, setIsChromium] = useState(false);
  const [showImage, setShowImage] = useState(true);

  useEffect(() => {
    // Detect Chromium-based browsers
    if (typeof window !== "undefined") {
      setIsChromium(
        /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
      );
    }

    // Hide the image after 3 seconds
    const timer = setTimeout(() => {
      setShowImage(false);
    }, 3000);

    // Cleanup timer
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="w-screen h-screen overflow-hidden bg-black flex items-center justify-center">
      {showImage ? (
        <div className="flex items-center justify-center w-full h-full bg-black">
          <img
            src="https://wlext.is/wp-content/uploads/2018/07/WLEXT-LOGO-NO-PIC.png"
            alt="WLEXT Logo"
            className="fade-in-out"
            style={{
              maxWidth: "80%", // Scales for small screens
              maxHeight: "80%", // Avoids overflow
              objectFit: "contain", // Ensures proper scaling
            }}
          />
        </div>
      ) : (
        <>
          {isChromium ? (
            // Chromium-based browsers
            <iframe
              src="https://wlext.is"
              className="w-full h-full"
              style={{
                border: "none",
                margin: 0,
                padding: 0,
                width: "100vw",
                height: "100vh",
              }}
              allowFullScreen
            />
          ) : (
            // Non-Chromium browsers with sandbox
            <iframe
              src="https://wlext.is"
              className="w-full h-full"
              style={{
                border: "none",
                margin: 0,
                padding: 0,
                width: "100vw",
                height: "100vh",
              }}
              sandbox="allow-same-origin allow-scripts"
              allow="fullscreen; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          )}
        </>
      )}
    </main>
  );
}

export default MoviesPage;