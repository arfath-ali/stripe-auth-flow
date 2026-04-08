import { IncomingMessage, ServerResponse } from 'node:http';

export function parseRequestBody(
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void,
) {
  let body: string = '';

  req.on('data', (chunk) => {
    body += chunk.toString();
  });

  req.on('end', () => {
    try {
      req.body = JSON.parse(body);
      next();
    } catch {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Invalid JSON format' }));
    }
  });
}
