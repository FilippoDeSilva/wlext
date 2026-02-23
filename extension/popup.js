// Popup script for WLEXT Ad Blocker
let isEnabled = true;

// Load statistics
chrome.storage.local.get(['stats', 'enabled'], (result) => {
    const stats = result.stats || { blocked: 0, redirects: 0, scripts: 0 };
    isEnabled = result.enabled !== false;
    
    updateUI(stats);
});

// Update UI with current stats
function updateUI(stats) {
    document.getElementById('blockedCount').textContent = stats.blocked;
    document.getElementById('redirectCount').textContent = stats.redirects;
    document.getElementById('scriptCount').textContent = stats.scripts;
    
    const statusEl = document.getElementById('status');
    const toggleBtn = document.getElementById('toggleProtection');
    
    if (isEnabled) {
        statusEl.textContent = 'Protection Active';
        statusEl.className = 'status active';
        toggleBtn.textContent = 'Disable Protection';
    } else {
        statusEl.textContent = 'Protection Disabled';
        statusEl.className = 'status blocked';
        toggleBtn.textContent = 'Enable Protection';
    }
}

// Toggle protection
document.getElementById('toggleProtection').addEventListener('click', () => {
    isEnabled = !isEnabled;
    
    chrome.storage.local.set({ enabled: isEnabled }, () => {
        // Notify background script
        chrome.runtime.sendMessage({ 
            type: 'toggleProtection', 
            enabled: isEnabled 
        });
        
        updateUI({ blocked: 0, redirects: 0, scripts: 0 });
    });
});

// Clear statistics
document.getElementById('clearStats').addEventListener('click', () => {
    chrome.storage.local.set({ 
        stats: { blocked: 0, redirects: 0, scripts: 0 } 
    }, () => {
        updateUI({ blocked: 0, redirects: 0, scripts: 0 });
    });
});

// Whitelist management
document.getElementById('whitelist').addEventListener('click', () => {
    const domain = prompt('Enter domain to whitelist (e.g., example.com):');
    if (domain) {
        chrome.storage.local.get(['whitelist'], (result) => {
            const whitelist = result.whitelist || [];
            if (!whitelist.includes(domain)) {
                whitelist.push(domain);
                chrome.storage.local.set({ whitelist }, () => {
                    alert(`${domain} added to whitelist`);
                });
            } else {
                alert(`${domain} is already whitelisted`);
            }
        });
    }
});

// Listen for updates from background script
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'statsUpdate') {
        chrome.storage.local.get(['stats'], (result) => {
            updateUI(result.stats || { blocked: 0, redirects: 0, scripts: 0 });
        });
    }
});
