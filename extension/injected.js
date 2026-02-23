// Injected Script - Lockdown Mode (Whitelist Only)
(function() {
    'use strict';
    
    console.log('[WLEXT Lockdown] Advanced protection loaded');
    
    const ALLOWED_DOMAINS = [
        'wlext.is', 'wlext.net', 'sobox.top', 'soapbox', 'hydra', 'omma', 
        'shorticu', 'cdn.jsdelivr.net', 'cloudflare', 'google', 
        'gstatic', 'abysscdn', 'elitecloud', 'localhost'
    ];
    
    // Statistics tracking
    let stats = { blocked: 0, redirects: 0, scripts: 0 };
    
    // Send stats to background
    function updateStats() {
        if (typeof chrome !== 'undefined' && chrome.runtime) {
            chrome.runtime.sendMessage({
                type: 'updateStats',
                blocked: stats.blocked,
                redirects: stats.redirects,
                scripts: stats.scripts
            });
        }
    }
    
    const extractDomain = (url) => {
        try {
            if (!url || url.startsWith('data:') || url.startsWith('blob:')) return null;
            const hostname = new URL(url.startsWith('http') ? url : 'https://' + url).hostname.toLowerCase();
            return hostname;
        } catch(e) { return null; }
    };
    
    const isUrlAllowed = (url) => {
        if (!url || typeof url !== 'string' || url === 'about:blank') return true;
        
        const domain = extractDomain(url);
        if (!domain) return true; // Allow non-URL strings or internal calls

        const isAllowed = ALLOWED_DOMAINS.some(allowed => domain.includes(allowed));
        
        if (!isAllowed) {
            console.log('[WLEXT Lockdown] Blocked unauthorized URL:', url);
            return false;
        }
        
        return true;
    };
    
    // Override window.location with recursive proxy
    const locationProxy = new Proxy(window.location, {
        get(target, prop) {
            if (prop === 'href' || prop === 'assign' || prop === 'replace') {
                return new Proxy(target[prop], {
                    apply(targetFn, thisArg, args) {
                        const url = args[0];
                        if (url && !isUrlAllowed(url)) {
                            stats.redirects++;
                            updateStats();
                            return;
                        }
                        return targetFn.apply(thisArg, args);
                    }
                });
            }
            return target[prop];
        },
        set(target, prop, value) {
            if (prop === 'href') {
                if (!isUrlAllowed(value)) {
                    stats.redirects++;
                    updateStats();
                    return true;
                }
            }
            target[prop] = value;
            return true;
        }
    });
    
    try {
        Object.defineProperty(window, 'location', {
            value: locationProxy,
            writable: false,
            configurable: false
        });
    } catch(e) {
        console.log('[WLEXT Lockdown] Could not override location:', e);
    }
    
    // Override window.open
    const originalOpen = window.open;
    window.open = function(url, name, features) {
        if (url && !isUrlAllowed(url)) {
            stats.redirects++;
            updateStats();
            return null;
        }
        return originalOpen.call(this, url, name, features);
    };
    
    // Override eval and Function constructor
    const originalEval = window.eval;
    window.eval = function(code) {
        if (typeof code === 'string' && 
            (code.includes('location') || code.includes('window.open') || 
             code.includes('replace') || code.includes('assign'))) {
            // Check if the code is trying to navigate to something not allowed
            // This is a heuristic as eval is hard to parse perfectly
            console.log('[WLEXT Lockdown] Blocked suspicious eval');
            stats.scripts++;
            updateStats();
            return undefined;
        }
        return originalEval.call(this, code);
    };
    
    const originalFunction = window.Function;
    window.Function = function(...args) {
        const body = args[args.length - 1] || '';
        if (typeof body === 'string' && 
            (body.includes('location') || body.includes('window.open') || 
             body.includes('replace') || body.includes('assign'))) {
            console.log('[WLEXT Lockdown] Blocked suspicious Function constructor');
            stats.scripts++;
            updateStats();
            return function() {};
        }
        return new originalFunction(...args);
    };
    
    // Event listener protection
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
        if (type === 'click' && listener && listener.toString) {
            const listenerStr = listener.toString();
            if (listenerStr.includes('window.open') || listenerStr.includes('location') ||
                listenerStr.includes('redirect')) {
                console.log('[WLEXT Lockdown] Blocked suspicious click listener');
                stats.blocked++;
                updateStats();
                return;
            }
        }
        return originalAddEventListener.call(this, type, listener, options);
    };
    
    // Remove unauthorized elements continuously
    const removeUnauthorizedElements = () => {
        // Scripts
        document.querySelectorAll('script[src]').forEach(el => {
            if (!isUrlAllowed(el.src)) {
                el.remove();
                stats.scripts++;
                updateStats();
            }
        });

        // Iframes
        document.querySelectorAll('iframe[src]').forEach(el => {
            if (!isUrlAllowed(el.src)) {
                el.remove();
                stats.blocked++;
                updateStats();
            }
        });

        // Links
        document.querySelectorAll('a[href]').forEach(el => {
            if (el.href && !el.href.startsWith('javascript:') && !isUrlAllowed(el.href)) {
                // Don't remove links, just neutralize them to prevent accidental clicks
                el.onclick = (e) => {
                    e.preventDefault();
                    console.log('[WLEXT Lockdown] Blocked unauthorized link click:', el.href);
                    return false;
                };
                el.href = '#';
            }
        });
    };
    
    // Start protection
    removeUnauthorizedElements();
    setInterval(removeUnauthorizedElements, 1000);
    
    // Monitor DOM changes
    const observer = new MutationObserver(() => {
        removeUnauthorizedElements();
    });
    
    observer.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true
    });
    
    console.log('[WLEXT Lockdown] Advanced protection active');
})();
