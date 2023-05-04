#!/usr/bin/env node

function run() {
  try {
    const cli = require("../dist/cli.cjs");
    cli
      .run()
      .then((status) => {
        process.exit(status);
      })
      .catch((e) => {
        console.error(e);
        process.exit(1);
      });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

run();
