import {homedir} from 'os';
import {join} from 'path';

import {exists, outputFile, unlink} from 'fs-extra';

import {StartupRun} from '../startup-run';

export class MacOSStartupRun extends StartupRun {
  private launchAgentFilePath = join(
    homedir(),
    `Library/LaunchAgents/${this.name}.plist`,
  );

  override async enable(): Promise<void> {
    await this.validate();

    const segments = this.buildCommandSegments();

    const content = `\
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${this.name}</string>
  <key>ProgramArguments</key>
  <array>
${segments
  .map(
    segment => `\
    <string>${escapeXML(segment)}</string>`,
  )
  .join('\n')}
  </array>
  <key>RunAtLoad</key>
  <true/>
</dict>
</plist>
`;

    await outputFile(this.launchAgentFilePath, content);
  }

  override async disable(): Promise<void> {
    if (!(await this.isEnabled())) {
      return;
    }

    await unlink(this.launchAgentFilePath);
  }

  override async isEnabled(): Promise<boolean> {
    return exists(this.launchAgentFilePath);
  }
}

function escapeXML(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
