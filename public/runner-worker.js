"use strict";

const serialize = (value) => {
  if (typeof value === "undefined") {
    return "undefined";
  }
  if (Number.isNaN(value)) {
    return "NaN";
  }
  return JSON.stringify(value);
};

const stableEqual = (actual, expected) => {
  if (Number.isNaN(actual) && Number.isNaN(expected)) {
    return true;
  }
  return JSON.stringify(actual) === JSON.stringify(expected);
};

async function handleRunTests(event) {
  const { runId, code, functionName, tests } = event.data;

  try {
    const loadUserFunction = new Function(
      `"use strict";\n${code}\n; return (typeof ${functionName} === "function") ? ${functionName} : undefined;`
    );
    const userFunction = loadUserFunction();

    if (typeof userFunction !== "function") {
      self.postMessage({
        runId,
        ok: false,
        error: `Expected a function named ${functionName}.`,
        results: []
      });
      return;
    }

    const results = [];
    for (const test of tests) {
      const inputArgs = JSON.parse(JSON.stringify(test.args));
      try {
        const actual = await userFunction(...inputArgs);
        results.push({
          name: test.name,
          pass: stableEqual(actual, test.expected),
          args: serialize(test.args),
          expected: serialize(test.expected),
          actual: serialize(actual)
        });
      } catch (error) {
        results.push({
          name: test.name,
          pass: false,
          args: serialize(test.args),
          expected: serialize(test.expected),
          actual: error && error.message ? error.message : String(error)
        });
      }
    }

    self.postMessage({
      runId,
      ok: results.every((result) => result.pass),
      results
    });
  } catch (error) {
    self.postMessage({
      runId,
      ok: false,
      error: error && error.message ? error.message : String(error),
      results: []
    });
  }
}

self.addEventListener("message", handleRunTests);
