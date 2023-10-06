#!/usr/bin/env node

import {spawn} from 'child_process';
import {once} from 'events';
import {setTimeout} from 'timers/promises';
import {inspect} from 'util';

import Chalk, {supportsColor} from 'chalk';
import type {WriteStream} from 'fs-extra';
import {createWriteStream, ensureFile} from 'fs-extra';
import main, {SIGNAL} from 'main-function';

import {DaemonInstance, type DaemonOptions} from 'startup-run';

const COLORS = supportsColor !== false;

main(async ([optionsJSON]) => {
  const {name, command, args, cwd, env, log, respawn} = JSON.parse(
    optionsJSON,
  ) as DaemonOptions;

  const instance = new DaemonInstance(name);

  await instance.replace();

  let info: (message: unknown) => void;

  let logStream: WriteStream | undefined;

  if (typeof log === 'string') {
    // Print log file path.
    console.info(log);

    await ensureFile(log);

    logStream = createWriteStream(log);

    await once(logStream, 'open');

    info = message => {
      logStream!.write(`${format(message, false)}\n`);
    };
  } else {
    info = message => console.info(format(message, true));
  }

  info('options:');
  info({command, args, cwd, env, log, respawn});

  const child = (async () => {
    while (true) {
      const cp = spawn(command, args, {
        cwd,
        env: {
          ...process.env,
          ...env,
          STARTUP_RUN_DAEMON: process.pid.toString(),
        },
        stdio: logStream ? ['inherit', logStream, logStream] : 'inherit',
      });

      info(`started process ${cp.pid ?? 'n/a'}.`);

      const [code] = (await once(cp, 'exit')) as [number];

      info(`exited with code 0x${code.toString(16)}.`);

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
