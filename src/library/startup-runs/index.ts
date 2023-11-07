import {StartupRun} from '../startup-run.js';

import {LinuxStartupRun} from './linux.js';
import {MacOSStartupRun} from './macos.js';
import {WindowsStartupRun} from './windows.js';

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

export * from './linux.js';
export * from './macos.js';
export * from './windows.js';
