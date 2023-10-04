import {StartupRun} from '../startup-run';

import {LinuxStartupRun} from './linux';
import {MacOSStartupRun} from './macos';
import {WindowsStartupRun} from './windows';

switch (process.platform) {
  case 'win32':
    StartupRun.create = (...args) => new WindowsStartupRun(...args);
    break;
  case 'darwin':
    StartupRun.create = (...args) => new MacOSStartupRun(...args);
    break;
  case 'linux':
    StartupRun.create = (...args) => new LinuxStartupRun(...args);
    break;
  default:
    throw new Error(
      `Unsupported platform ${JSON.stringify(process.platform)}.`,
    );
}

export * from './linux';
export * from './macos';
export * from './windows';
