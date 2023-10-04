# Startup Run

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

## License

MIT License.
