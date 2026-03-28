/**
 * Post-build pre-rendering script for SEO.
 * Launches a local server on the Vite dist/ output, then uses Puppeteer
 * to capture the rendered HTML of each public route and writes it back
 * so that crawlers receive full HTML content.
 *
 * Usage: node scripts/prerender.mjs
 */

import { createServer } from 'http';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');

// Public routes to pre-render (excluding auth/dashboard/admin pages)
const ROUTES = [
  '/',
  '/bateaux',
  '/destinations',
  '/a-propos',
  '/faq',
  '/contact',
  '/conditions-generales',
  '/politique-de-confidentialite',
  '/mentions-legales',
];

/** Tiny static file server for the dist folder */
function startServer(port) {
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon',
  };

  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      let filePath = join(DIST, req.url === '/' ? 'index.html' : req.url);
      // SPA fallback: if file doesn't exist, serve index.html
      if (!existsSync(filePath)) {
        filePath = join(DIST, 'index.html');
      }
      const ext = '.' + filePath.split('.').pop();
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      try {
        const content = readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      } catch {
        res.writeHead(404);
        res.end('Not found');
      }
    });
    server.listen(port, () => resolve(server));
  });
}

async function prerender() {
  const PORT = 4173;
  console.log(`Starting static server on port ${PORT}...`);
  const server = await startServer(PORT);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    for (const route of ROUTES) {
      console.log(`  Pre-rendering ${route}...`);
      const page = await browser.newPage();

      // Block external resources and APIs to speed up rendering
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const url = req.url();
        if (
          url.startsWith(`http://localhost:${PORT}`) ||
          url.startsWith('data:')
        ) {
          req.continue();
        } else {
          req.abort();
        }
      });

      await page.goto(`http://localhost:${PORT}${route}`, {
        waitUntil: 'networkidle0',
        timeout: 15000,
      });

      // Wait a bit for React to finish rendering
      await page.evaluate(() => new Promise((r) => setTimeout(r, 500)));

      const html = await page.content();
      await page.close();

      // Write the rendered HTML to the correct file path
      const outDir = join(DIST, route === '/' ? '' : route);
      const outFile = route === '/' ? join(DIST, 'index.html') : join(outDir, 'index.html');

      if (route !== '/') {
        mkdirSync(outDir, { recursive: true });
      }

      writeFileSync(outFile, html, 'utf-8');
      console.log(`    ✓ Written to ${outFile}`);
    }
  } finally {
    await browser.close();
    server.close();
  }

  console.log(`\nPre-rendered ${ROUTES.length} routes successfully.`);
}

prerender().catch((err) => {
  console.error('Pre-rendering failed:', err);
  process.exit(1);
});
