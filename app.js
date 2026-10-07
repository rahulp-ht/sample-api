const http = require('http');
const port = process.env.PORT || 3000;

http.createServer((req, res) => {
  if (req.url === '/health') {
    res.end('OK');
    return;
  }

  res.end('Sample API v1');
}).listen(port, () => console.log(`Listening on ${port}`));
