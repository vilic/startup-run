# startup-run

Run **scripts** at startup with ease.

## Installation

```bash
npm install startup-run
```

## Usage

```js
import {StartupRun} from 'startup-run';

const run = StartupRun.create({
  name: 'awesome-script',
  command: process.execPath,
});

await run.enable();
```

## Third Parties

### node-auto-launch

Package **startup-run** is inspired by [node-auto-launch](https://github.com/Teamwork/node-auto-launch) but for different scenarios. While `node-auto-launch` focuses on GUI applications, **startup-run** focuses on scripts instead.

It refers some implementation details from `node-auto-launch`, but is overall refactored or rewritten to better serve its own design goals.

## License

MIT License.
