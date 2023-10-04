import {join} from 'path';

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

  readonly respawn: number | false;

  constructor({
    command,
    name,
    args = [],
    cwd = process.cwd(),
    env = {},
    hidden = false,
    respawn = true,
  }: StartupRunOptions) {
    if (respawn === true) {
      respawn = RESPAWN_DELAY;
    }

    this.name = name;
    this.command = command;
    this.args = args;
    this.cwd = cwd;
    this.env = env;
    this.hidden = hidden;
    this.respawn = respawn;
  }

  abstract enable(): Promise<void>;

  abstract disable(): Promise<void>;

  abstract isEnabled(): Promise<boolean>;

  protected buildCommandSegments(): string[] {
    const {command, args, cwd, env} = this;

    return [
      process.execPath,
      DAEMON_PATH,
      JSON.stringify({
        command,
        args,
        cwd,
        env,
      }),
    ];
  }
}
