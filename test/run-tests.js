const suites = [
  require("./flowService.test"),
  require("./progressService.test"),
  require("./http.test"),
  require("./ollamaClient.test")
];

async function run() {
  let failures = 0;

  for (const suite of suites) {
    for (const testCase of suite) {
      try {
        await testCase.run();
        console.log(`PASS ${testCase.name}`);
      } catch (error) {
        failures += 1;
        console.error(`FAIL ${testCase.name}`);
        console.error(error && error.stack ? error.stack : error);
      }
    }
  }

  if (failures > 0) {
    process.exitCode = 1;
    return;
  }

  console.log("All tests passed.");
}

run().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exitCode = 1;
});
