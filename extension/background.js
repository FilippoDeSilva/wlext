// Background Service Worker for WLEXT Ad Blocker (Lockdown Mode)
const ALLOWED_DOMAINS = [
  'wlext.is', 'wlext.net', 'sobox.top', 'soapbox', 'hydra', 'omma', 
  'shorticu', 'cdn.jsdelivr.net', 'cloudflare', 'google', 
  'gstatic', 'abysscdn', 'elitecloud', 'localhost', 'chrome-extension'
];

// Statistics tracking
let stats = { blocked: 0, redirects: 0, scripts: 0 };

// Function to check if a URL is allowed
function isUrlAllowed(urlStr) {
  try {
    if (!urlStr || urlStr === 'about:blank') return true;
    const url = new URL(urlStr);
    const hostname = url.hostname.toLowerCase();
    const protocol = url.protocol.toLowerCase();

    if (protocol === 'chrome-extension:' || protocol === 'edge-extension:') return true;
    
    return ALLOWED_DOMAINS.some(domain => hostname.includes(domain));
  } catch (e) {
    return false;
  }
}

// Early redirect interception for Edge & Chrome
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId === 0 && details.url && details.url !== 'about:blank') {
    if (!isUrlAllowed(details.url)) {
      chrome.tabs.update(details.tabId, { url: 'about:blank' });
      stats.redirects++;
      chrome.storage.local.set({ stats });
      console.log('[WLEXT Lockdown] Blocked unauthorized navigation:', details.url);
    }
  }
}, { url: [{ urlMatches: '.*' }] });

// Function to update declarativeNetRequest rules for Lockdown
async function updateBlockingRules() {
  // In Lockdown mode, we want to allow the whitelist and block everything else for frames/scripts
  // However, DNR works better with specific block rules or specific allow rules.
  // We'll implement a 'block all subresources' except for allowed domains.
  
  const allowRules = ALLOWED_DOMAINS.map((domain, index) => ({
    id: index + 1,
    priority: 1,
    action: { type: 'allow' },
    condition: { urlFilter: domain, resourceTypes: ['main_frame', 'sub_frame', 'script', 'xmlhttprequest', 'media'] }
  }));

  // Rule to block everything else (lower priority than allow rules)
  const blockAllRule = {
    id: 1000,
    priority: 2, // Higher number = lower priority in some contexts, but DNR priority works: highest priority wins
    action: { type: 'block' },
    condition: { urlFilter: '*', resourceTypes: ['sub_frame', 'script'] }
  };

  // Actually, DNR doesn't easily support "block everything except X" without complex setups.
  // We will stick to the existing BLOCKED_DOMAINS list but expand it aggressively 
  // and use the onBeforeNavigate logic for the "Block Everything Else" part.
}

// Initialize storage and rules
chrome.runtime.onInstalled.addListener(() => {
  updateBlockingRules();
});

chrome.runtime.onStartup.addListener(() => {
  updateBlockingRules();
});

// Listen for blocked requests via declarativeNetRequest
if (chrome.declarativeNetRequest.onRuleMatchedDebug) {
  chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((info) => {
    stats.blocked++;
    chrome.storage.local.set({ stats });
  });
}

chrome.storage.local.get(['stats'], (result) => {
  stats = result.stats || { blocked: 0, redirects: 0, scripts: 0 };
});

// Handle tab updates to inject scripts
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const url = new URL(tab.url);
    const hostname = url.hostname.toLowerCase();
    
    // Only inject on pages that need protection
    if (hostname.includes('wlext.is') || hostname.includes('wlext.net') || 
        hostname.includes('sobox.top') || !ALLOWED_DOMAINS.some(domain => hostname.includes(domain))) {
      
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['injected.js']
      }).catch(() => {
        // Silent fail
      });
    }
  }
});

// Handle new tab creation
chrome.tabs.onCreated.addListener((tab) => {
  if (tab.url && tab.url.startsWith('http')) {
    const url = new URL(tab.url);
    const hostname = url.hostname.toLowerCase();
    
    // Redirect suspicious new tabs
    if (BLOCKED_DOMAINS.some(domain => hostname.includes(domain)) ||
        tab.url.includes('popunder') || tab.url.includes('popup') ||
        tab.url.includes('skinnycrawlinglax.com') || 
        tab.url.includes('back-dare.com') || 
        tab.url.includes('wayfarerorthodox.com')) {
      chrome.tabs.update(tab.id, { 
        url: 'about:blank' 
      });
      stats.redirects++;
      chrome.storage.local.set({ stats });
    }
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'updateStats') {
    stats.blocked += message.blocked || 0;
    stats.redirects += message.redirects || 0;
    stats.scripts += message.scripts || 0;
    chrome.storage.local.set({ stats });
  }
  
  if (message.type === 'getStats') {
    sendResponse(stats);
  }
});

console.log('WLEXT Ad Blocker background script loaded');
