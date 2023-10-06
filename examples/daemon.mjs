import {StartupRun} from 'startup-run';

setInterval(() => {
  console.info(Date.now());
}, 1000);

const run = StartupRun.create('daemon-script');

run.setup({
  enable: process.argv.includes('--enable'),
  disable: process.argv.includes('--disable'),
});
