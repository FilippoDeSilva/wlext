'use client';
import { useEffect, useState, useRef } from 'react';
import { IoDownloadOutline, IoClose } from 'react-icons/io5';

interface NavigatorWithRelatedApps extends Navigator {
  getInstalledRelatedApps?: () => Promise<any[]>;
}

export default function InstallPWA() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const deferredPromptRef = useRef<any>(null);

  useEffect(() => {
    // Check if the browser is Firefox and exit early if it is
    const isFirefox = navigator.userAgent.includes('Firefox');
    if (isFirefox) {
      setShowPrompt(false);
      return;
    }

    // Check if enough time has passed since last prompt
    const lastPromptTime = localStorage.getItem('lastPWAPromptTime');
    const currentTime = Date.now();
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

    if (lastPromptTime && currentTime - parseInt(lastPromptTime) < oneHour) {
      setShowPrompt(false);
      return;
    }

    // Store the beforeinstallprompt event for later use
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      deferredPromptRef.current = e;
      setShowPrompt(true);
      console.log('beforeinstallprompt event captured');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app is already installed
    const checkInstalled = async () => {
      try {
        const nav = navigator as NavigatorWithRelatedApps;
        if (nav.getInstalledRelatedApps) {
          const relatedApps = await nav.getInstalledRelatedApps();
          setIsInstalled(relatedApps.length > 0);
        }
      } catch (error) {
        console.log('Error checking installation status:', error);
      }
    };

    // Show prompt after a delay if not already installed or in standalone mode
    const shouldShowPrompt = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      if (!isInstalled && !isStandalone) {
        setShowPrompt(true);
        localStorage.setItem('lastPWAPromptTime', currentTime.toString());
      }
    };

    checkInstalled();

    const timer = setTimeout(shouldShowPrompt, 3000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isInstalled]);

  const handleInstall = async () => {
    if (deferredPromptRef.current) {
      try {
        await deferredPromptRef.current.prompt();
        const { outcome } = await deferredPromptRef.current.userChoice;
        if (outcome === 'accepted') {
          setShowPrompt(false);
          setIsInstalled(true);
        }
        deferredPromptRef.current = null;
      } catch (err) {
        console.error('PWA Installation failed:', err);
      }
    } else {
      // Fallback for browsers that don't support beforeinstallprompt or if event was missed
      console.log('No deferred prompt available');
      // Some browsers allow adding to home screen via menu even if prompt is not triggered
    }
  };

  if (!showPrompt || isInstalled) {
    return null;
  }

  return (
    <div
      id="pwa-install-prompt"
      className="fixed z-[9999] p-4 md:p-6 transition-all duration-500 ease-in-out
                 bottom-0 left-0 right-0 md:left-auto md:right-4 md:bottom-4
                 flex justify-center md:block"
    >
      <div 
        className="w-full max-w-[400px] bg-[#111827] border border-gray-800 
                   rounded-2xl shadow-2xl p-5 md:p-6 animate-in duration-500"
        style={{ backgroundColor: '#111827', borderColor: '#1f2937' }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
              <IoDownloadOutline className="text-blue-400 text-2xl" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white text-lg leading-tight">Install Wlext App</h3>
              <p className="text-sm text-gray-400 mt-1.5 leading-relaxed">
                Experience Wlext with offline access, faster loading, and a seamless native experience.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowPrompt(false)}
            className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5 cursor-pointer"
            aria-label="Close"
          >
            <IoClose className="text-xl" />
          </button>
        </div>
        
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleInstall}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl 
                       hover:bg-blue-500 active:scale-[0.98] transition-all 
                       text-sm font-semibold shadow-lg shadow-blue-600/20 cursor-pointer"
          >
            Install Now
          </button>
          <button
            onClick={() => setShowPrompt(false)}
            className="flex-1 bg-white/5 text-gray-300 px-6 py-3 rounded-xl 
                       hover:bg-white/10 hover:text-white transition-all 
                       text-sm font-semibold border border-white/5 cursor-pointer"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
