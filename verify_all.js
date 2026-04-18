const { execSync } = require('child_process');
const fs = require('fs');
let out = '';
try {
  out += execSync('npx tsc --noEmit', { cwd: 'apps/api', encoding: 'utf-8' });
  out += 'API OK\n';
} catch (e) {
  out += 'API ERROR DETECTED:\n';
  out += e.stdout;
  out += e.stderr;
}
try {
  out += execSync('npx tsc --noEmit', { cwd: 'apps/web', encoding: 'utf-8' });
  out += 'WEB OK\n';
} catch (e) {
  out += 'WEB ERROR DETECTED:\n';
  out += e.stdout;
  out += e.stderr;
}
fs.writeFileSync('check_errors.txt', out);
