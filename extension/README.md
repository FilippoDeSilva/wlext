# WLEXT Ad Blocker (Lockdown Edition)

An advanced, Manifest V3 compliant browser extension specifically designed to provide absolute protection for WLEXT and similar streaming sites.

## Key Features (Lockdown Mode)

- **Whitelist-Only Policy**: The "Ultimate Shield" approach. Instead of blocking known bad domains, it blocks **everything by default** and only allows trusted streaming sources.
- **Network-Level Blocking (DNR)**: Uses Chrome's `declarativeNetRequest` to kill ad requests before they even reach the browser's engine.
- **Early Navigation Interception**: Uses `webNavigation` to catch and neutralize redirects in Microsoft Edge and Chrome before the page can even start loading.
- **Deep Page Protection**: 
    - **Location Proxying**: Prevents scripts from hijacking the browser URL.
    - **API Hardening**: Overrides `eval`, `Function`, and `window.open` to neutralize obfuscated ad code.
    - **Event Interception**: Blocks click-hijack listeners that trigger popups.
- **Real-time Statistics**: Live tracking of blocked ads, redirects, and scripts.
- **Modern UI**: Clean popup interface with toggle controls and live data.

## Installation

### Chrome/Edge:
1. Open `chrome://extensions/` (Chrome) or `edge://extensions/` (Edge).
2. Enable **"Developer mode"**.
3. Click **"Load unpacked"**.
4. Select the `extension` folder from this repository.
5. **Crucial**: After installing, click the extension icon and ensure it's active.

### Why this extension?
Most ad-blockers fail on streaming sites because ad networks rotate domains every few hours. This extension solves that by **locking down the browser** to only trust the specific domains needed for WLEXT to function. Anything else is completely obliterated.

## Whitelisted Domains
- `wlext.is`, `wlext.net` (Main sites)
- `sobox.top`, `soapbox`, `hydra`, `omma`, `shorticu` (Video players)
- `cdn.jsdelivr.net`, `cloudflare`, `google`, `gstatic` (Essential CDNs)
- `abysscdn`, `elitecloud` (Legitimate streaming mirrors)
- `localhost` (Development)

## File Structure

```
extension/
├── manifest.json       # Extension Manifest V3 configuration with DNR and Navigation permissions.
├── background.js       # Service worker for network rules, blocking and navigation interception.
├── content.js          # Content script for DOM manipulation and protection (Enforces whitelist).
├── injected.js         # Advanced page-context API overrides and recursive proxies.
├── popup.html          # Extension popup interface
├── popup.js            # Popup functionality
├── icons/              # Extension icons (add your own)
└── README.md           # This file
```
## Configuration

### Whitelisting Domains
Use the popup interface or edit the storage directly:

```javascript
chrome.storage.local.set({
  whitelist: ['trusted-domain.com']
});
```

## How It Works

1. **Background Script**: Intercepts network requests and blocks known ad domains
2. **Content Script**: Runs in the page context to block DOM-based ads and scripts
3. **Injected Script**: Provides advanced protection by overriding browser APIs
4. **Real-time Learning**: Dynamically learns new ad patterns and blocks them

## Permissions

- `activeTab`: Access current tab for script injection
- `storage`: Save settings and statistics
- `webRequest`: Block network requests
- `webRequestBlocking`: Intercept and block requests
- `scripting`: Inject scripts into pages
- `tabs`: Manage tab events
- `<all_urls>`: Access all websites for protection

## Development

To modify the extension:
1. Make changes to the relevant files
2. Reload the extension in the browser
3. Test on target websites

## Security

This extension:
- Only blocks known ad and tracking domains
- Does not collect personal data
- Works entirely offline
- Open source and transparent

## Troubleshooting

### Extension not working:
1. Ensure developer mode is enabled
2. Check for errors in the extension console
3. Verify permissions are granted

### Missing icons:
Add 16x16, 48x48, and 128x128 PNG icons to the `icons/` folder.

### Performance issues:
The extension is optimized for minimal performance impact. If issues occur, check the browser's task manager.

## License

MIT License - Feel free to modify and distribute.
