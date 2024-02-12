#!/usr/bin/env node

import {spawn} from 'child_process';
import {once} from 'events';
import {type WriteStream} from 'fs';
import {setTimeout} from 'timers/promises';
import {inspect} from 'util';

import Chalk, {supportsColor} from 'chalk';
import FSExtra from 'fs-extra';
import {SIGNAL, main} from 'main-function';

import {DaemonInstance, type DaemonOptions} from 'startup-run';

const COLORS = supportsColor !== false;

const MIN_STABLE_UP_TIME = 3000;

const MAX_UNSTABLE_LAUNCHES = 3;

main(async ([optionsJSON]) => {
  let options: DaemonOptions;

  try {
    // Compatibility.
    options = JSON.parse(optionsJSON);
  } catch {
    options = JSON.parse(
      (optionsJSON = Buffer.from(optionsJSON, 'base64').toString()),
    );
  }

  const {name, command, args, cwd, env, log, respawn} = options;

  const instance = new DaemonInstance(name);

  await instance.replace();

  let info: (message: unknown) => Promise<void>;

  let logStream: WriteStream | undefined;

  if (typeof log === 'string') {
    // Print log file path.
    console.info(log);

    await FSExtra.ensureFile(log);

    logStream = FSExtra.createWriteStream(log);

    await once(logStream, 'open');

    info = async message =>
      new Promise<void>((resolve, reject) =>
        logStream!.write(`${format(message, false)}\n`, error => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        }),
      );
  } else {
    info = async message => console.info(format(message, true));
  }

  await info('daemon started.');
  await info({pid: process.pid, ppid: process.ppid});

  await info('options:');
  await info({command, args, cwd, env, log, respawn});

  const child = (async () => {
    let unstableLaunches = 0;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const startedAt = Date.now();

      const cp = spawn(command, args, {
        cwd,
        env: {
          ...process.env,
          ...env,
          STARTUP_RUN_DAEMON: process.pid.toString(),
        },
        stdio: logStream ? ['inherit', logStream, logStream] : 'inherit',
        detached: true,
      });

      await info(`started process ${cp.pid ?? 'n/a'}.`);

      const [code] = (await once(cp, 'exit')) as [number];

      const upTime = Date.now() - startedAt;

      await info(`exited with code 0x${code.toString(16)}.`);

      if (upTime < MIN_STABLE_UP_TIME) {
        if (++unstableLaunches >= MAX_UNSTABLE_LAUNCHES) {
          await info('too many unstable launches, daemon will exit.');

          process.exit(code);
        }
      } else {
        unstableLaunches = 0;
      }

      if (respawn === false) {
        process.exit(code);
      }

      await setTimeout(respawn);
    }
  })();

  await Promise.race([child, SIGNAL('SIGINT')]);

  await instance.exit();
});

function format(message: unknown, colors: boolean): string {
  colors &&= COLORS;

  if (typeof message !== 'string') {
    message = inspect(message, {colors});
  }

  let prefix = '[daemon] ';

  if (colors) {
    prefix = Chalk.cyan(prefix);
  }

  message = (message as string).replace(/^/gm, prefix);

  return message as string;
}
