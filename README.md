[![NPM version](https://img.shields.io/npm/v/startup-run?color=%23cb3837&style=flat-square)](https://www.npmjs.com/package/startup-run)
[![Repository package.json version](https://img.shields.io/github/package-json/v/vilic/startup-run?color=%230969da&label=repo&style=flat-square)](./package.json)
[![MIT License](https://img.shields.io/badge/license-MIT-999999?style=flat-square)](./LICENSE)

# startup-run

Run **scripts** at startup with ease.

Supports **Windows**, **macOS** and **Linux** (Desktop).

## Features

- Run non-GUI scripts at startup, **hidden**.
- Run as **current user** on Windows (running as service would cause problems for scripts with UI interactions).
- Log to file.
- Auto restart (respawn) on exit.

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

run.start(); // start daemon now.

StartupRun.daemonSpawned; // boolean
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

## Implementations

### Windows

On Windows, it adds a startup item to registry at `HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run`, thus starting the script at login as current user.

> Solutions like `pm2` run scripts as service, which would cause problems for scripts with UI interactions.

Tested on:

- Windows 11

### macOS

On macOS, it adds a `.plist` file to `~/Library/LaunchAgents`.

Tested on:

- macOS Sonoma 14

### Linux

On Linux, it adds a `.desktop` file to `~/.config/autostart`.

Tested on:

- Ubuntu 22.04 (Desktop)

## Third Parties

### node-auto-launch

Package **startup-run** is inspired by [node-auto-launch](https://github.com/Teamwork/node-auto-launch) but for different scenarios. While `node-auto-launch` focuses on GUI applications, **startup-run** focuses on scripts instead.

It refers some implementation details from `node-auto-launch`, but is overall refactored or rewritten to better serve its own design goals.

## License

MIT License.
