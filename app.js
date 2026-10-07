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
  if (req.url === '/info') {
   res.setHeader('Content-Type', 'application/json');
   res.end(JSON.stringify({
     name: 'sample-api',
     version: '1.0.0'
   }));
   return;
  } 
  res.end('Welcome to Sample API - Feature');

}).listen(port, () => console.log(`Listening on ${port}`));
