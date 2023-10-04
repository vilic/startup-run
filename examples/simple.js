const {StartupRun} = require('startup-run');

const run = StartupRun.create('simple-script');

void run.enable();

setInterval(() => {
  console.info(Date.now());
}, 1000);
