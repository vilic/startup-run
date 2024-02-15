#!/usr/bin/env node

import type {ChildProcess} from 'child_process';
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

  await info('daemon started:');
  await info({
    pid: process.pid,
    ppid: process.ppid,
    command,
    args,
    cwd,
    env,
    log,
    respawn,
  });

  let exiting = false;
  let daemonExitCode: number | undefined;

  let cp: ChildProcess | undefined;

  void SIGNAL(['SIGINT', 'SIGTERM']).finally(() => {
    cp?.kill();
    exiting = true;
  });

  let unstableLaunches = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const startedAt = Date.now();

    cp = spawn(command, args, {
      cwd,
      env: {
        ...process.env,
        ...env,
        STARTUP_RUN_DAEMON: process.pid.toString(),
      },
      stdio: logStream ? ['inherit', logStream, logStream] : 'inherit',
    });

    await info(`started process:`);
    await info({pid: cp.pid});

    const [exitCode, signal] = (await once(cp, 'exit')) as [
      number | null,
      string | null,
    ];

    const upTime = Date.now() - startedAt;

    await info(`process exited:`);
    await info({exitCode, signal});

    if (upTime < MIN_STABLE_UP_TIME) {
      if (++unstableLaunches >= MAX_UNSTABLE_LAUNCHES) {
        await info('too many unstable launches, daemon will exit.');
        daemonExitCode = 1;
        break;
      }
    } else {
      unstableLaunches = 0;
    }

    if (respawn === false || exiting) {
      daemonExitCode = exitCode === 0 ? 0 : 1;
      break;
    }

    await setTimeout(respawn);
  }

  await instance.beforeExit();

  await info('daemon exiting:');
  await info({exitCode: daemonExitCode});

  return daemonExitCode;
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
