// Content Script - Lockdown Mode (Whitelist Only)
console.log('[WLEXT Lockdown] Content script loaded');

const ALLOWED_DOMAINS = [
  'wlext.is', 'wlext.net', 'sobox.top', 'soapbox', 'hydra', 'omma', 
  'shorticu', 'cdn.jsdelivr.net', 'cloudflare', 'google', 
  'gstatic', 'abysscdn', 'elitecloud', 'localhost'
];

// Statistics tracking
let stats = { blocked: 0, redirects: 0, scripts: 0 };

// Send stats to background script
function updateStats() {
  chrome.runtime.sendMessage({
    type: 'updateStats',
    blocked: stats.blocked,
    redirects: stats.redirects,
    scripts: stats.scripts
  });
}

function isDomainAllowed(urlStr) {
  try {
    if (!urlStr || urlStr.startsWith('data:') || urlStr.startsWith('blob:')) return true;
    const url = new URL(urlStr, window.location.href);
    const hostname = url.hostname.toLowerCase();
    return ALLOWED_DOMAINS.some(domain => hostname.includes(domain));
  } catch (e) {
    return false;
  }
}

// Block unauthorized scripts and iframes
const enforceWhitelist = () => {
  // Check scripts
  const scripts = document.querySelectorAll('script[src]');
  scripts.forEach(script => {
    if (!isDomainAllowed(script.src)) {
      script.remove();
      console.log('[WLEXT Lockdown] Blocked unauthorized script:', script.src);
      stats.scripts++;
      updateStats();
    }
  });

  // Check iframes
  const iframes = document.querySelectorAll('iframe[src]');
  iframes.forEach(iframe => {
    if (!isDomainAllowed(iframe.src)) {
      iframe.remove();
      console.log('[WLEXT Lockdown] Blocked unauthorized iframe:', iframe.src);
      stats.blocked++;
      updateStats();
    }
  });
};

// Periodic cleanup
setInterval(enforceWhitelist, 1000);

// Block window.open redirects (Whitelist Only)
const originalWindowOpen = window.open;
window.open = function(url, name, features) {
  if (url && !isDomainAllowed(url)) {
    console.log('[WLEXT Lockdown] Blocked unauthorized window.open:', url);
    stats.redirects++;
    updateStats();
    return null;
  }
  return originalWindowOpen.call(this, url, name, features);
};

// Block location changes (Whitelist Only)
const originalLocationAssign = window.location.assign;
window.location.assign = function(url) {
  if (url && !isDomainAllowed(url)) {
    console.log('[WLEXT Lockdown] Blocked unauthorized location.assign:', url);
    stats.redirects++;
    updateStats();
    return;
  }
  return originalLocationAssign.call(this, url);
};

// Inject advanced protection script
const script = document.createElement('script');
script.src = chrome.runtime.getURL('injected.js');
script.onload = function() {
  this.remove();
};
(document.head || document.documentElement).appendChild(script);

// Run immediately and periodically
blockInlineScripts();
removeAds();
setInterval(removeAds, 2000);

// Monitor DOM changes
const observer = new MutationObserver(() => {
  removeAds();
  blockInlineScripts();
});

observer.observe(document.body || document.documentElement, {
  childList: true,
  subtree: true
});
