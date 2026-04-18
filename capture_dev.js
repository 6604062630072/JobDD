const { spawn } = require('child_process');
const fs = require('fs');

const child = spawn('bun', ['run', 'dev'], { cwd: 'd:/JobSabuy', shell: true });
let output = '';

child.stdout.on('data', (data) => (output += data.toString()));
child.stderr.on('data', (data) => (output += data.toString()));

setTimeout(() => {
  fs.writeFileSync('d:/JobSabuy/turbo_log.txt', output);
  child.kill();
  process.exit(0);
}, 6000);
