const { execSync } = require('child_process');
try {
  console.log(execSync('npm run build', { cwd: 'apps/web', encoding: 'utf-8' }));
} catch (e) {
  console.log('--- ERROR DETECTED ---');
  console.log(e.stdout);
  console.log(e.stderr);
}
