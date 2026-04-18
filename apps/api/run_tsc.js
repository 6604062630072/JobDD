const { execSync } = require('child_process');
const fs = require('fs');

try {
  const output = execSync('npx tsc --noEmit', { encoding: 'utf-8', stdio: 'pipe' });
  fs.writeFileSync('tsc-out.txt', 'SUCCESS:\n' + output);
} catch (e) {
  fs.writeFileSync('tsc-out.txt', 'ERROR:\n' + e.stdout + '\n' + e.stderr);
}
