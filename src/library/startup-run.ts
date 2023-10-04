import {join, resolve} from 'path';

import {ensureFile} from 'fs-extra';

import type {DaemonOptions} from './daemon';

export const DAEMON_PATH = join(__dirname, '../daemon/main.js');

export const RESPAWN_DELAY = 1000;

export interface StartupRunOptions {
  /**
   * The name of the startup run instance, used as identifier.
   */
  name: string;
  command: string;
  args?: string[];
  cwd?: string;
  env?: Record<string, string>;
  hidden?: boolean;
  /**
   * Log file path, defaults to `false` and `true` defaults to "<name>.log".
   */
  log?: boolean | string;
  /**
   * Respawn on exit, defaults to `true` and `true` defaults to 1000 ms.
   */
  respawn?: boolean | number;
}

export abstract class StartupRun {
  readonly command: string;

  readonly name: string;

  readonly args: string[];

  readonly cwd: string;

  readonly env: Record<string, string>;

  readonly hidden: boolean;

  readonly log: string | false;

  readonly respawn: number | false;

  constructor({
    command,
    name,
    args = [],
    cwd = process.cwd(),
    env = {},
    hidden = false,
    log = hidden,
    respawn = true,
  }: StartupRunOptions) {
    cwd = resolve(cwd);

    if (respawn === true) {
      respawn = RESPAWN_DELAY;
    }

    if (log === true) {
      log = `${name}.log`;
    }

    if (typeof log === 'string') {
      log = resolve(cwd, log);
    }

    this.name = name;
    this.command = command;
    this.args = args;
    this.cwd = cwd;
    this.env = env;
    this.hidden = hidden;
    this.log = log;
    this.respawn = respawn;
  }

  abstract enable(): Promise<void>;

  abstract disable(): Promise<void>;

  abstract isEnabled(): Promise<boolean>;

  protected async validate(): Promise<void> {
    const {log} = this;

    if (typeof log === 'string') {
      await ensureFile(log);
    }
  }

  protected buildCommandSegments(): string[] {
    const {command, args, cwd, env, log, respawn} = this;

    return [
      process.execPath,
      DAEMON_PATH,
      JSON.stringify({
        command,
        args,
        cwd,
        env,
        log,
        respawn,
      } satisfies DaemonOptions),
    ];
  }

  static create: (options: StartupRunOptions) => StartupRun = () => {
    throw new Error('Not implemented.');
  };
}
