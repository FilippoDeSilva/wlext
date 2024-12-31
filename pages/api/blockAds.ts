import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';
// import { adMonitorScript } from './adMonitor';

interface AdFilter {
  type: 'domain' | 'element' | 'resource' | 'popup';
  pattern: string;
  selector?: string;
  options?: {
    resourceTypes?: string[];
    domains?: string[];
  };
}

const parseFilter = (line: string): AdFilter | null => {
  try {
    const filter = line.trim();
    if (!filter || filter.startsWith('!')) return null;

    // Handle element hiding filters (site.com##.ad-container)
    if (filter.includes('##')) {
      const [domains, selector] = filter.split('##');
      const cleanSelector = selector
        .replace(/:has-text\((.*?)\)/g, '')
        .replace(/:has\((.*?)\)/g, '')
        .replace(/:contains\((.*?)\)/g, '')
        .replace(/\[\s*has\s*=.*?\]/g, '')
        .trim();

      if (!cleanSelector) return null;

      return {
        type: 'element',
        pattern: cleanSelector,
        selector: cleanSelector,
        options: {
          domains: domains ? domains.split(',') : []
        }
      };
    }

    // Handle parameter removal filters ($removeparam)
    if (filter.includes('$removeparam')) {
      return {
        type: 'resource',
        pattern: filter,
        options: {
          resourceTypes: ['xmlhttprequest', 'script', 'image', 'media']
        }
      };
    }

    // Handle domain blocks (||example.com^)
    if (filter.startsWith('||')) {
      return {
        type: 'domain',
        pattern: filter.slice(2).replace(/\^$/, '')
      };
    }

    // Handle resource type filters ($script,image)
    if (filter.includes('$')) {
      const [pattern, options] = filter.split('$');
      return {
        type: 'resource',
        pattern,
        options: {
          resourceTypes: options.split(',')
        }
      };
    }

    return {
      type: 'domain',
      pattern: filter
    };
  } catch (e) {
    console.log('Filter parse error:', e);
    return null;
  }
};

const loadFilters = async (): Promise<AdFilter[]> => {
  const filtersPath = path.join(process.cwd(), 'public', 'filters.txt');
  const customFiltersPath = path.join(process.cwd(), 'public', 'filters-wlext.txt');
  
  const filtersContent = fs.readFileSync(filtersPath, 'utf8');
  const customFiltersContent = fs.readFileSync(customFiltersPath, 'utf8');

  const allFilters = [...filtersContent.split('\n'), ...customFiltersContent.split('\n')]
    .map(line => parseFilter(line))
    .filter((f): f is AdFilter => f !== null);

  return allFilters;
};

const sanitizeSelector = (selector: string): string => {
  try {
    return selector
      // Remove trailing brackets and parentheses
      .replace(/[\]\)\}]+$/, '')
      // Remove invalid CSS properties
      .replace(/;.*$/, '')
      // Remove position and style properties
      .replace(/;position:.*$/, '')
      // Remove ABP specific syntax
      .replace(/:-abp-.*$/, '')
      // Remove complex attribute selectors that are invalid
      .replace(/\[class\^="[^"]*"\]\[class\*="[^"]*"\].*$/, '')
      // Clean up any remaining invalid characters
      .replace(/[^\w\s-#\.\[\]='":\^\*\$>~\+,]/g, '')
      // Remove empty attribute selectors
      .replace(/\[\s*\]/g, '')
      // Remove empty classes
      .replace(/\.\s*\./g, '.')
      .replace(/\s+/g, ' ')
      .trim();
  } catch (e) {
    console.error('Selector sanitization error:', e);
    return '';
  }
};

const shouldBlockUrl = (url: string, hostname: string): boolean => {
  // Block by exact domain match with all variations
  const blockedDomains = [
    'best-girls-around.com',
    'holahupa.com',
    'mobiletracking.ru',
    'o18.click',
    'tracker.mobiletracking.ru',
    'rr.tracker.mobiletracking.ru'
  ];

  if (blockedDomains.some(domain => 
    hostname === domain || 
    hostname.endsWith('.' + domain) || 
    hostname.includes(domain)
  )) {
    return true;
  }

  // Block specific URL patterns
  const blockedPatterns = [
    '/video_app/new/main',
    '/1976784',
    'fX12bpzt',
    'tracker',
    'video_app',
    '/c?o=',
    '/c?'
  ];

  if (blockedPatterns.some(pattern => url.includes(pattern))) {
    return true;
  }

  // Block specific paths
  const blockedPaths = [
    'best-girls-around.com/video_app',
    'holahupa.com/1976784',
    'mobiletracking.ru/fX12bpzt'
  ];

  if (blockedPaths.some(path => url.includes(path))) {
    return true;
  }

  return false;
};

const runPuppeteer = async (req: NextApiRequest, res: NextApiResponse) => {
  let browser;
  try {
    const filtersPath = path.join(process.cwd(), 'public', 'filters.txt');
    const filtersContent = fs.readFileSync(filtersPath, 'utf8')
      .split('\n')
      .map(line => parseFilter(line))
      .filter((f): f is AdFilter => f !== null);

    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--single-process',
        '--disable-popup-blocking',  // Required to handle popups
        '--disable-notifications',   // Block notification requests
        '--disable-permissions-api'  // Block permission requests
      ],
      defaultViewport: {
        width: 1920,
        height: 1080
      }
    });
    
    const page = await browser.newPage();

    // Block popups at the page level
    await page.evaluateOnNewDocument(() => {
      // Override window.open
      window.open = () => null;
      
      // Block common popup methods
      window.alert = () => null;
      window.confirm = () => false;
      window.prompt = () => null;

      // Block redirects
      window.onbeforeunload = () => false;
      window.onunload = () => false;

      // Block common ad script functions
      window.eval = () => null;
      
      // Block common popup triggers
      Object.defineProperty(window, 'showModalDialog', { value: () => null });
      Object.defineProperty(window, 'showModelessDialog', { value: () => null });
    });

    // Set modern Chrome user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

    // Enhanced request interception
    await page.setRequestInterception(true);
    page.on('request', async (request) => {
      try {
        const url = request.url();
        const resourceType = request.resourceType();
        const urlObj = new URL(url);

        // Block known popup/redirect domains
        const blockedDomains = [
          'best-girls-around.com',
          'holahupa.com',
          'mobiletracking.ru',
          'o18.click',
          'tracker.mobiletracking.ru',
          'rr.tracker.mobiletracking.ru'
        ];

        // Block specific URL patterns
        const blockedPatterns = [
          '/video_app/new/main',
          '/1976784',
          'fX12bpzt',
          'tracker',
          'video_app',
          '/c?o=',
          '/c?'
        ];

        // Allow main site resources
        if (urlObj.hostname === 'wlext.is') {
          console.log(`✅ Allowing main site resource: ${url}`);
          await request.continue();
          return;
        }

        // Block by domain
        if (blockedDomains.some(domain => 
          urlObj.hostname === domain || 
          urlObj.hostname.endsWith('.' + domain) || 
          urlObj.hostname.includes(domain)
        )) {
          console.log(`🚫 Blocked domain: ${urlObj.hostname}`);
          await request.abort();
          return;
        }

        // Block by pattern
        if (blockedPatterns.some(pattern => url.includes(pattern))) {
          console.log(`🚫 Blocked pattern: ${url}`);
          await request.abort();
          return;
        }

        // Check against filters
        const shouldBlock = filtersContent.some(filter => {
          switch (filter.type) {
            case 'domain':
              return url.includes(filter.pattern);
            case 'resource':
              return filter.options?.resourceTypes?.includes(resourceType);
            default:
              return false;
          }
        });

        if (shouldBlock) {
          console.log(`🚫 Blocked ${resourceType}: ${url}`);
          await request.abort();
        } else {
          console.log(`✅ Allowed ${resourceType}: ${url}`);
          await request.continue();
        }
      } catch (e) {
        console.error('Request handler error:', e);
        try {
          await request.continue();
        } catch {
          // Ignore any errors here
        }
      }
    });

    // Block new windows/popups
    page.on('popup', async (popup) => {
      if (popup) {
        console.log('🚫 Blocked popup window');
        try {
          await popup.close();
        } catch (e) {
          console.error('Error closing popup:', e);
        }
      }
    });

    // Monitor for redirects
    page.on('response', async (response) => {
      const status = response.status();
      if ([301, 302, 303, 307, 308].includes(status)) {
        const location = response.headers()['location'];
        if (location) {
          console.log(`🚫 Blocked redirect to: ${location}`);
          await response.request().abort();
        }
      }
    });

    // Add timing information
    const startTime = Date.now();
    await page.goto('https://wlext.is', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    console.log(`Page loaded in ${Date.now() - startTime}ms`);

    // Remove ad elements
    const elementFilters = filtersContent.filter(
      (f): f is AdFilter & { selector: string } => 
        f.type === 'element' && typeof f.selector === 'string'
    );

    if (elementFilters.length > 0) {
      try {
        for (const filter of elementFilters) {
          try {
            const removedCount = await page.evaluate((selector: string) => {
              const elements = document.querySelectorAll(selector);
              elements.forEach(el => el.remove());
              return elements.length;
            }, filter.selector);
            if (removedCount > 0) {
              console.log(`🗑️ Removed ${removedCount} elements matching: ${filter.selector}`);
            }
          } catch (e) {
            console.error('Element removal error:', e);
          }
        }
      } catch (e) {
        console.error('Element removal error:', e);
      }
    }

    // Take screenshot for debugging
    await page.screenshot({ 
      path: 'debug-chrome.png',
      fullPage: true 
    });

    // Send success response with no-cache header
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.status(200).json({ 
      success: true,
      browser: 'chrome',
      timestamp: new Date().toISOString()
    });

  } catch (e) {
    console.error('Main error:', e);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        console.error('Browser close error:', e);
      }
    }
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await runPuppeteer(req, res);
}
