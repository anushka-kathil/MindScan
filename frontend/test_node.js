const fs = require('fs');
fs.writeFileSync('success.txt', 'This worked at ' + new Date().toISOString());
console.log('File written');
