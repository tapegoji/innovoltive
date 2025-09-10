import { createServer } from 'https';
import { parse } from 'url';
import next from 'next';
import * as fs from 'fs';

const dev = false; // Set to false for production build
const hostname = 'innovoltive.com';
const port = 443; // Standard HTTPS port
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// SSL certificate paths
const httpsOptions = {
  key: fs.readFileSync('/etc/letsencrypt/live/innovoltive.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/innovoltive.com/fullchain.pem'),
};

app.prepare().then(() => {
  createServer(httpsOptions, async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  })
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on https://${hostname}:${port}`);
    });
});