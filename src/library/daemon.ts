export interface DaemonOptions {
  command: string;
  args: string[];
  cwd: string;
  env: Record<string, string>;
  log: string | false;
  respawn: number | false;
}
