const http = require('http');
const port = process.env.PORT || 3000;

http.createServer((req, res) => {
  if (req.url === '/health') {
    res.end('OK');
    return;
  }
  if (req.url == '/version'){
    res.end('1.0.0');
    return;
  }

  res.end('Welcome to Sample API');
}).listen(port, () => console.log(`Listening on ${port}`));
