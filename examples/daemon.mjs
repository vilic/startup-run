import {StartupRun} from 'startup-run';

setInterval(() => {
  console.info(Date.now());
}, 1000);

const run = StartupRun.create('daemon-script');

if (!StartupRun.daemonSpawned) {
  if (process.argv.includes('--enable')) {
    await run.enable();

    run.start();

    process.exit();
  } else if (process.argv.includes('--disable')) {
    await run.disable();

    process.exit();
  }
}
