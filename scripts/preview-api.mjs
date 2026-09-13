import { createServer } from 'node:http';

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
    response.end(Buffer.from(await upstream.arrayBuffer()));
  } catch {
    response.writeHead(502, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: 'Public catalogue unavailable.' }));
  }
}).listen(port, '127.0.0.1', () => {
  console.log('Read-only portfolio preview API: http://127.0.0.1:' + port);
});
