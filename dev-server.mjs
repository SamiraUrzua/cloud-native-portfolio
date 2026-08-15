import http from 'node:http';
import net from 'node:net';
import httpProxy from 'http-proxy';

const NEXT_PORT = 3001;
const PROXY_PORT = 3000;

const proxy = httpProxy.createProxyServer({
  target: `http://localhost:${NEXT_PORT}`,
  changeOrigin: true,
  ws: true,
});

const locales = ['en', 'es'];
const defaultLocale = 'en';

function getLocaleFromCookie(cookieHeader) {
  if (!cookieHeader) {
    return defaultLocale;
  }

  const match = cookieHeader.match(/(?:^|;\s*)locale=([^;]*)/);
  const locale = match?.[1];

  return locales.includes(locale) ? locale : defaultLocale;
}

function isNextReady() {
  return new Promise((resolve) => {
    const socket = net.createConnection({
      host: 'localhost',
      port: NEXT_PORT,
    });

    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });

    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });

    socket.setTimeout(500, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

async function waitForNext() {
  while (!(await isNextReady())) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

const staticFileExtensionPattern = /\.[a-zA-Z0-9]+$/;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PROXY_PORT}`);
  const pathname = url.pathname;

  const hasFileExtension = staticFileExtensionPattern.test(pathname);
  const isLocalized = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (req.method === 'GET' && isLocalized) {
    const strippedPathname = pathname.replace(/^\/(en|es)/, '') || '/';
    res.writeHead(302, { Location: `${strippedPathname}${url.search}` });
    res.end();
    return;
  }

  const isNextNavigation =
    req.headers.accept?.includes('text/html') || req.headers.rsc === '1';

  if (req.method === 'GET' && isNextNavigation && !hasFileExtension) {
    const normalizedPathname = pathname.endsWith('/') ? pathname : `${pathname}/`;
    const locale = getLocaleFromCookie(req.headers.cookie);
    req.url = `/${locale}${normalizedPathname}${url.search}`;
  }

  proxy.web(req, res, {}, (error) => {
    console.error(error);

    if (!res.headersSent) {
      res.writeHead(502);
      res.end('Proxy error');
    }
  });
});

server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head);
});

await waitForNext();

server.listen(PROXY_PORT, () => {
  console.log(`Dev proxy running at http://localhost:${PROXY_PORT}`);
});