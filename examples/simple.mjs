import {StartupRun} from 'startup-run';

setInterval(() => {
  console.info(Date.now());
}, 1000);

const run = StartupRun.create('simple-script');

if (process.argv.includes('--enable')) {
  await run.enable();
} else if (process.argv.includes('--disable')) {
  await run.disable();
}
