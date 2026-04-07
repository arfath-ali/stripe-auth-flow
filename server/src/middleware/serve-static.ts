import type { IncomingMessage, ServerResponse } from 'http';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const mimeTypes: Record<string, string> = {
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
};

export function serveStaticFile(
  req: IncomingMessage,
  res: ServerResponse,
  clientDir: string,
  extension: string,
  next: () => void,
) {
  try {
    const filePath = path.join(clientDir, req.url || '');
    const mimeType = mimeTypes[extension];

    if (!mimeType) {
      return next();
    }

    fs.readFile(filePath, (err, file) => {
      if (err) {
        return next();
      }

      const etag = crypto.createHash('md5').update(file).digest('hex');

      if (req.headers['if-none-match'] === etag) {
        res.statusCode = 304;
        res.end();
        return;
      }

      res.writeHead(200, {
        'Content-Type': mimeTypes[extension],
        'Cache-Control': 'no-cache',
        ETag: etag,
      });
      res.end(file);
    });
  } catch (err) {
    console.error('serveStaticFile error:', err);
    res.statusCode = 500;
    res.end();
  }
}

export function serveHTML(
  req: IncomingMessage,
  res: ServerResponse,
  indexPath: string,
) {
  try {
    fs.readFile(indexPath, (err, html) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }

      const etag = crypto.createHash('md5').update(html).digest('hex');

      if (req.headers['if-none-match'] === etag) {
        res.statusCode = 304;
        res.end();
        return;
      }

      res.writeHead(200, {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache',
        ETag: etag,
      });
      res.end(html);
    });
  } catch (err) {
    console.error('serveHTML error:', err);
    res.statusCode = 500;
    res.end();
  }
}
