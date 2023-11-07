import {homedir} from 'os';
import {join} from 'path';

import {commandJoin} from 'command-join';
import FSExtra from 'fs-extra';

import {StartupRun} from '../startup-run.js';

export class LinuxStartupRun extends StartupRun {
  private autoStartFilePath = join(
    homedir(),
    `.config/autostart/${this.name}.desktop`,
  );

  override async enable(): Promise<void> {
    await this.validate();

    const segments = this.buildCommandSegments();

    const line = commandJoin(segments);

    const content = `\
[Desktop Entry]
Type=Application
Version=1.0
Name=${this.name}
Comment=Startup Run
Exec=${line}
StartupNotify=false
Terminal=false
`;

    await FSExtra.outputFile(this.autoStartFilePath, content);
  }

  override async disable(): Promise<void> {
    if (!(await this.isEnabled())) {
      return;
    }

    await FSExtra.unlink(this.autoStartFilePath);
  }

  override async isEnabled(): Promise<boolean> {
    return FSExtra.exists(this.autoStartFilePath);
  }
}
