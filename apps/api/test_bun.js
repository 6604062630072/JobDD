const { execSync } = require('child_process');
const fs = require('fs');

try {
  console.log('Running...');
  fs.writeFileSync('bun-out.txt', 'Starting...\n');
  const output = execSync('bun src/main.ts', { encoding: 'utf-8', stdio: 'pipe' });
  fs.writeFileSync('bun-out.txt', output);
} catch (e) {
  fs.writeFileSync('bun-out.txt', e.stdout + '\n' + e.stderr);
}
console.log('Done');
