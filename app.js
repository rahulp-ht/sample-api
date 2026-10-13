const http = require('http');

const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
    return;
  }

  if (req.url === '/version') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('1.0.0');
    return;
  }

  if (req.url === '/info') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      name: 'sample-api',
      version: '1.0.0'
    }));
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Welcome to Sample API Production');
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Listening on ${port}`);
});
