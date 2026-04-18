const { execSync } = require('child_process');
try {
  console.log(execSync('node dist/main.js', { cwd: 'apps/api', encoding: 'utf-8' }));
} catch (e) {
  console.log('--- ERROR DETECTED ---');
  console.log(e.stdout);
  console.log(e.stderr);
}
