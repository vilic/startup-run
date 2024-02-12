import {StartupRun} from 'startup-run';

const run = StartupRun.create('startup-run-setup-example');

await run.setup({
  enable: process.argv.includes('--enable'),
  disable: process.argv.includes('--disable'),
});

setInterval(() => {
  console.info(Date.now());
}, 1000);
