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

const postResult = (message) => {
  self.parent.postMessage(message, "*");
};

const createUserFunction = (code, functionName) => {
  const loadUserFunction = new Function(
    `"use strict";\n${code}\n; return (typeof ${functionName} === "function") ? ${functionName} : undefined;`
  );
  return loadUserFunction();
};

const runSingleTest = async (userFunction, test) => {
  const inputArgs = JSON.parse(JSON.stringify(test.args));
  const args = serialize(test.args);
  try {
    const actual = await userFunction(...inputArgs);
    return {
      name: test.name,
      pass: stableEqual(actual, test.expected),
      args,
      expected: serialize(test.expected),
      actual: serialize(actual)
    };
  } catch (error) {
    return {
      name: test.name,
      pass: false,
      args,
      expected: serialize(test.expected),
      actual: error && error.message ? error.message : String(error)
    };
  }
};

async function handleRunTests(event) {
  const message = event.data;
  if (!message) {
    return;
  }
  if (message.type !== "run-tests") {
    return;
  }

  const { runId, code, functionName, tests } = message;

  try {
    const userFunction = createUserFunction(code, functionName);

    if (typeof userFunction !== "function") {
      postResult({
        type: "run-result",
        runId,
        ok: false,
        error: `Expected a function named ${functionName}.`,
        results: []
      });
      return;
    }

    const results = [];
    for (const test of tests) {
      results.push(await runSingleTest(userFunction, test));
    }

    postResult({
      type: "run-result",
      runId,
      ok: results.every((result) => result.pass),
      results
    });
  } catch (error) {
    postResult({
      type: "run-result",
      runId,
      ok: false,
      error: error && error.message ? error.message : String(error),
      results: []
    });
  }
}

self.addEventListener("message", handleRunTests);
