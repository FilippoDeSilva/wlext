// Import necessary libraries
"use client";

import { useEffect, useState } from 'react';

// Function to detect browser type
const getBrowserType = () => {
  if (typeof window === 'undefined' || !window.navigator) {
    console.log('❌ Not in browser environment');
    return 'Unknown';
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  console.log('📱 User Agent:', userAgent);

  if (userAgent.includes('firefox')) {
    console.log('🦊 Firefox detected!');
    return 'Firefox';
  } else if (userAgent.includes('edg') || userAgent.includes('edge')) {
    console.log('🧩 Edge detected!');
    return 'Edge';
  } else if (userAgent.includes('chrome') && !userAgent.includes('edg') && !userAgent.includes('opera')) {
    console.log('🌐 Chrome detected!');
    return 'Chrome';
  }

  console.log('❓ Other browser detected');
  return 'Other';
};

const MoviesPage: React.FC = () => {
  const [browserType, setBrowserType] = useState('Unknown');
  const [isFirefox, setIsFirefox] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('🔍 Starting browser detection...');
      const detected = getBrowserType();
      setBrowserType(detected);
      setIsFirefox(detected === 'Firefox');
      console.log('🌐 Browser detected in useEffect:', detected);
    }
  }, []);

  useEffect(() => {
    console.log('🎨 Rendering with:', {
      browserType,
      isFirefox,
      hasSandbox: isFirefox ? 'Yes ✅' : 'No ❌'
    });
  });

  return (
    <div className="relative w-full h-screen p-0 m-0">
      <h1 className="sr-only">Movies</h1>
      <iframe
        src="https://wlext.is"
        className="absolute inset-0 w-full h-full border-0"
        name="myiFrame"
        allowFullScreen
        sandbox={isFirefox ? "allow-same-origin allow-scripts" : undefined}
        data-browser={browserType}
      />
    </div>
  );
};

export default MoviesPage;
