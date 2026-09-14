import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

// Local visual review uses only public catalogue data. No private endpoints
// or mutations are forwarded to the live site.
const port = Number(process.env.PREVIEW_API_PORT || 4312);
createServer(async (request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1');
  if (url.pathname === '/api/session.php' && request.method === 'GET') {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ authenticated: false }));
    return;
  }
  if (url.pathname === '/api/track.php' && request.method === 'POST') {
    response.writeHead(204);
    response.end();
    return;
  }
  const isCatalogue = url.pathname === '/api/projects.php';
  const isScreenshot = /^\/api\/uploads\/screenshots\/[\w.-]+\.(png|jpe?g|webp)$/i.test(
    url.pathname,
  );
  if (request.method !== 'GET' || (!isCatalogue && !isScreenshot)) {
    response.writeHead(405, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: 'This preview supports public catalogue reads only.' }));
    return;
  }
  try {
    const upstreamUrl = new URL(url.pathname, 'https://sn8w.com');
    const lang = url.searchParams.get('lang');
    if (isCatalogue && ['en', 'fr', 'de', 'es', 'ja', 'ko'].includes(lang)) {
      upstreamUrl.searchParams.set('lang', lang);
    }
    const upstream = await fetch(upstreamUrl, { signal: AbortSignal.timeout(15000) });
    response.writeHead(upstream.status, {
      'Content-Type': upstream.headers.get('content-type') || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    if (isCatalogue && upstream.ok && process.env.SHOWROOM_PREVIEW === '1') {
      const catalog = JSON.parse(
        await readFile(new URL('./showroom-preview.json', import.meta.url), 'utf8'),
      );
      const rows = await upstream.json();
      for (const row of rows) row.showInShowcase = row.tier === 'flagship' && !!row.tagline.trim();
      for (const [index, item] of catalog.entries()) {
        let row = rows.find((row) => row.id === item.existingId);
        if (!row) {
          row = {
            id: 1000 + index,
            name: item.name,
            category: lang === 'fr' ? item.categoryFr ?? item.category : item.category,
            tagline: lang === 'fr' ? item.taglineFr ?? item.tagline : item.tagline,
            tier: 'ecosystem',
            status: item.status ?? 'prototype',
            availability: 'inactive',
            url: null,
            repoUrl: null,
            repoPrivate: false,
            groupTitle: null,
            mockup: null,
            sortOrder: index + 10,
            showInShowcase: false,
          };
          rows.push(row);
        }
        if (item.files.length) {
          row.screenshot = item.files[0];
          row.screenshots = item.files.slice(1);
          if (item.existingId) row.showInShowcase = true;
        }
        if (item.existingId && item.tagline) {
          row.category = lang === 'fr' ? item.categoryFr : item.category;
          row.tagline = lang === 'fr' ? item.taglineFr : item.tagline;
          row.status = 'in-development';
        }
      }
      response.end(JSON.stringify(rows));
    } else {
      response.end(Buffer.from(await upstream.arrayBuffer()));
    }
  } catch {
    response.writeHead(502, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: 'Public catalogue unavailable.' }));
  }
}).listen(port, '127.0.0.1', () => {
  console.log('Read-only portfolio preview API: http://127.0.0.1:' + port);
});
