import {homedir} from 'os';
import {join} from 'path';

import {outputFile, readFile, remove} from 'fs-extra';

export interface DaemonOptions {
  name: string;
  command: string;
  args: string[];
  cwd: string;
  env: Record<string, string>;
  log: string | false;
  respawn: number | false;
}

export class DaemonInstance {
  readonly pidFilePath: string;

  constructor(readonly name: string) {
    this.name = name;
    this.pidFilePath = join(homedir(), `.${name}/daemon.pid`);
  }

  async kill(): Promise<void> {
    const existingPId = await this.getPId();

    if (typeof existingPId === 'number') {
      try {
        process.kill(existingPId);
      } catch {}
    }
  }

  async replace(): Promise<void> {
    await this.kill();
    await this.setPId(process.pid);
  }

  async exit(): Promise<void> {
    await this.clearPId();
  }

  private async getPId(): Promise<number | undefined> {
    try {
      const content = await readFile(this.pidFilePath, 'utf8');
      return parseInt(content);
    } catch {
      return undefined;
    }
  }

  private async setPId(pid: number): Promise<void> {
    await outputFile(this.pidFilePath, pid.toString());
  }

  private async clearPId(): Promise<void> {
    await remove(this.pidFilePath);
  }
}
