[![NPM version](https://img.shields.io/npm/v/startup-run?color=%23cb3837&style=flat-square)](https://www.npmjs.com/package/startup-run)
[![Repository package.json version](https://img.shields.io/github/package-json/v/vilic/startup-run?color=%230969da&label=repo&style=flat-square)](./package.json)
[![MIT License](https://img.shields.io/badge/license-MIT-999999?style=flat-square)](./LICENSE)

# startup-run

Run **scripts** at startup with ease.

## Features

- Run non-GUI scripts at startup.
- Run as current user on Windows.

## Implementations

- Windows: `HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run`
- macOS: `~/Library/LaunchAgents`
- Linux: `~/.config/autostart`

## Installation

```bash
npm install startup-run
```

## Usage

```js
import {StartupRun} from 'startup-run';

const run = StartupRun.create('awesome-script');

await run.enable();

await run.disable();

await run.isEnabled(); // boolean
```

### Default Options

```js
const run = StartupRun.create('<name>', {
  command: process.execPath,
  args: process.argv.slice(1),
  cwd: process.cwd(),
  env: {},
  log: true,
  respawn: true,
});
```

## Third Parties

### node-auto-launch

Package **startup-run** is inspired by [node-auto-launch](https://github.com/Teamwork/node-auto-launch) but for different scenarios. While `node-auto-launch` focuses on GUI applications, **startup-run** focuses on scripts instead.

It refers some implementation details from `node-auto-launch`, but is overall refactored or rewritten to better serve its own design goals.

## License

MIT License.
