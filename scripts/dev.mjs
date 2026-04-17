import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const children = [];
const npmCli = process.env.npm_execpath;

if (!npmCli) {
  throw new Error('npm_execpath is not available');
}

function run(name, command, args, cwd) {
  const child = spawn(command, args, {
    cwd,
    env: {
      ...process.env,
      CI: '1',
      NG_CLI_ANALYTICS: 'false',
    },
    stdio: ['inherit', 'pipe', 'pipe'],
  });

  const prefix = `[${name}]`;
  child.stdout.on('data', (chunk) => process.stdout.write(`${prefix} ${chunk}`));
  child.stderr.on('data', (chunk) => process.stderr.write(`${prefix} ${chunk}`));
  child.on('exit', (code, signal) => {
    if (shuttingDown) {
      return;
    }
    if (signal) {
      process.stderr.write(`${prefix} exited via signal ${signal}\n`);
      shutdown(0);
    } else if (code !== 0) {
      process.stderr.write(`${prefix} exited with code ${code}\n`);
      shutdown(code ?? 1);
    } else {
      process.stderr.write(`${prefix} exited unexpectedly with code 0\n`);
      shutdown(0);
    }
  });

  children.push(child);
}

let shuttingDown = false;

function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill('SIGTERM');
    }
  }

  setTimeout(() => {
    for (const child of children) {
      if (!child.killed) {
        child.kill('SIGKILL');
      }
    }
    process.exit(exitCode);
  }, 1000).unref();
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

run('server', process.execPath, [npmCli, 'run', 'start'], fileURLToPath(new URL('../server-node', import.meta.url)));
run('ui', process.execPath, [npmCli, 'run', 'start'], fileURLToPath(new URL('../ui', import.meta.url)));
