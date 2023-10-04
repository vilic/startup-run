import {StartupRun} from '../startup-run';

import {WindowsStartupRun} from './windows';

switch (process.platform) {
  case 'win32':
    StartupRun.create = options => new WindowsStartupRun(options);
    break;
  default:
    throw new Error(
      `Unsupported platform ${JSON.stringify(process.platform)}.`,
    );
}

export * from './linux';
export * from './macos';
export * from './windows';
