import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const triviaDir = path
  .resolve(__dirname, '..')
  .replace(/^[a-z]:/, (drive) => drive.toUpperCase());
const nodeDir = path.dirname(process.execPath);
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const env = {
  ...process.env,
  PATH: `${nodeDir}${path.delimiter}${process.env.PATH || ''}`,
};

function runStep(label, args) {
  console.log(`\n==> ${label}`);
  const result = spawnSync(npmCmd, args, {
    cwd: triviaDir,
    env,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

runStep('Running Trivia unit tests', ['test']);
runStep('Building Trivia frontend & Cloudflare Worker', ['run', 'build']);
console.log('\nAll Trivia checks passed.');
