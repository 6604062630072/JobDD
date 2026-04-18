const https = require('https');
const fs = require('fs');
const path = require('path');

const url =
  'https://raw.githubusercontent.com/earthchie/jquery.Thailand.js/master/jquery.Thailand.js/database/raw_database/raw_database.json';
const dest = path.join(__dirname, 'apps', 'web', 'public', 'thai-address.json');

console.log('Downloading Thai address data...');
const file = fs.createWriteStream(dest);
https
  .get(url, (res) => {
    res.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('Done! Saved to', dest);
    });
  })
  .on('error', (err) => {
    fs.unlink(dest, () => {});
    console.error('Error:', err.message);
  });
