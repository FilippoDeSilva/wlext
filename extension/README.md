# WLEXT Ad Blocker Browser Extension

A powerful browser extension specifically designed to block ads, pop-ups, and redirects on WLEXT and similar streaming sites.

## Features

- **Advanced Redirect Blocking**: Prevents malicious redirects and pop-unders
- **Real-time Pattern Learning**: Dynamically learns and blocks new ad domains
- **Script Injection Protection**: Blocks malicious scripts before they execute
- **Navigation Hijack Prevention**: Stops attempts to hijack browser navigation
- **Service Worker Protection**: Network-level blocking of ad requests
- **Statistics Tracking**: Monitor blocked ads, redirects, and scripts
- **Whitelist Management**: Allow specific domains if needed

## Installation

### Chrome/Edge:
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `extension` folder

### Firefox:
1. Open `about:debugging`
2. Click "This Firefox"
3. Click "Load Temporary Add-on"
4. Select the `manifest.json` file

## Files Structure

```
extension/
├── manifest.json       # Extension configuration
├── background.js       # Service worker for network blocking
├── content.js          # Content script for DOM protection
├── injected.js         # Advanced protection in page context
├── popup.html          # Extension popup interface
├── popup.js            # Popup functionality
├── icons/              # Extension icons (add your own)
└── README.md           # This file
```

## Configuration

### Adding Custom Blocked Domains
Edit `background.js` and add domains to the `BLOCKED_DOMAINS` array:

```javascript
const BLOCKED_DOMAINS = [
  'example-ad-domain.com',
  'another-ad-site.net',
  // ... existing domains
];
```

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
