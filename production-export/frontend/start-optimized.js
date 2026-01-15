const { spawn } = require('child_process');

const env = {
  ...process.env,
  BROWSER: 'none',
  FAST_REFRESH: 'true',
  SKIP_PREFLIGHT_CHECK: 'true'
};

const child = spawn('npx', ['react-scripts', 'start'], {
  stdio: 'inherit',
  shell: true,
  env
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
