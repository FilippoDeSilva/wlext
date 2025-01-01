"use client";
import { useEffect, useState } from "react";

function MoviesPage() {
  const [isChromium, setIsChromium] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsChromium(
        /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
      );
    }
  }, []);

  return (
    <main className="w-screen h-screen overflow-hidden">
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
    </main>
  );
}

export default MoviesPage;
