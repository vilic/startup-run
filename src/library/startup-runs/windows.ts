import {join} from 'path';
import {promisify} from 'util';

import {quote} from 'shell-quote';
import WinReg from 'winreg';

import {StartupRun} from '../startup-run';

const HIDEEXEC_PATH = join(__dirname, '../../../bin/hideexec.exe');

export class WindowsStartupRun extends StartupRun {
  private reg = new WinReg({
    hive: WinReg.HKCU,
    key: '\\Software\\Microsoft\\Windows\\CurrentVersion\\Run',
  });

  override async enable(): Promise<void> {
    const {name, hidden, reg} = this;

    const segments = this.buildCommandSegments();

    if (hidden) {
      segments.unshift(HIDEEXEC_PATH);
    }

    const line = quote(segments);

    await promisify(reg.set.bind(reg))(name, WinReg.REG_SZ, line);
  }

  override disable(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  override isEnabled(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}
