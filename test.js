const fs = require('fs');
const assert = require('assert');

const app = fs.readFileSync('./app.js', 'utf8');

assert(app.includes('/health'), 'Missing /health endpoint');
assert(app.includes('/version'), 'Missing /version endpoint');
assert(app.includes('/info'), 'Missing /info endpoint');

console.log('All sample-api source checks passed!');
