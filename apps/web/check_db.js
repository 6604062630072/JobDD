const https = require('https');

https.get(
  'https://cdn.jsdelivr.net/gh/earthchie/jquery.Thailand.js@master/jquery.Thailand.js/database/raw_database/raw_database.json',
  (res) => {
    let body = '';
    res.on('data', (chunk) => (body += chunk));
    res.on('end', () => {
      const data = JSON.parse(body);
      const mueangs = Array.from(
        new Set(data.filter((d) => d.amphoe.includes('เมือง')).map((d) => d.amphoe)),
      );
      console.log('Sample Mueangs:', mueangs.slice(0, 10));
      console.log(
        'Mueang Rayong:',
        data.filter((d) => d.province === 'ระยอง' && d.amphoe.includes('เมือง'))[0],
      );
    });
  },
);
