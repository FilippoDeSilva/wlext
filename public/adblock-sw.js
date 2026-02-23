const CACHE_NAME = 'adblock-v1';
const ALLOWED_DOMAINS = [
  'wlext.is', 'wlext.net', 'sobox.top', 'soapbox', 'hydra', 'omma', 
  'shorticu', 'cdn.jsdelivr.net', 'cloudflare', 'google', 
  'gstatic', 'abysscdn', 'elitecloud', 'localhost'
];

const ALLOWED_SCHEMES = [
  'chrome-extension://',
  'moz-extension://',
  'about:blank',
  'blob:',
  'data:'
];

const BLOCKED_DOMAINS = [
  'imasdk.googleapis.com', 'doubleclick.net', 'googlesyndication.com',
  'facebook.com', 'adnxs.com', 'crwdcntrl.net', 'exequy', 'sothorefusedturgid',
  'wriestunvote.com', 'cardboardcrispyrover.com', 'marketdeathly.com',
  'brisknessdebtordismiss.com', 'onclickads.net', 'popads.net', 'tuitionulua.shop',
  'teopantrivant.shop', 'polosanitizertrusting.com', 'whitebit.com'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  const hostname = url.hostname.toLowerCase();

  // Allow main site and essential resources
  if (hostname.includes('wlext.is') || hostname.includes('wlext.net') || 
      hostname === 'localhost' || request.url.startsWith('chrome-extension://')) {
    return;
  }

  // Block known ad domains
  if (BLOCKED_DOMAINS.some(domain => hostname.includes(domain))) {
    event.respondWith(new Response(null, { status: 204 }));
    return;
  }

  // Block suspicious patterns
  if (request.url.includes('popunder') || request.url.includes('popup') ||
      request.url.includes('doubleclick') || request.url.includes('googlesyndication')) {
    event.respondWith(new Response(null, { status: 204 }));
    return;
  }

  // Check if it's a navigation request to untrusted domain
  if ((request.destination === 'iframe' || request.destination === 'document') &&
      !ALLOWED_DOMAINS.some(d => hostname.includes(d))) {
    event.respondWith(new Response(null, { status: 403 }));
    return;
  }
});
