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

const serializeLogPart = (value) => {
  if (typeof value === "string") {
    return value;
  }
  return serialize(value);
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

const createUserFunction = (code, functionName, consoleTarget = console) => {
  const loadUserFunction = new Function(
    "console",
    `"use strict";\n${code}\n; return (typeof ${functionName} === "function") ? ${functionName} : undefined;`
  );
  return loadUserFunction(consoleTarget);
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
  if (!message || message.type !== "run-tests") {
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

async function handleRunCode(event) {
  const message = event.data;
  if (!message || message.type !== "run-code") {
    return;
  }

  const output = [];
  const sandboxConsole = {
    log: (...args) => output.push(args.map(serializeLogPart).join(" "))
  };

  try {
    const userFunction = createUserFunction(message.code, message.functionName, sandboxConsole);

    if (typeof userFunction !== "function") {
      postResult({
        type: "code-run-result",
        runId: message.runId,
        ok: false,
        error: `Expected a function named ${message.functionName}.`,
        output
      });
      return;
    }

    for (const [index, test] of message.tests.entries()) {
      output.push(`Case ${index + 1}: ${test.name}`);
      const inputArgs = JSON.parse(JSON.stringify(test.args));
      const actual = await userFunction(...inputArgs);
      output.push(`return ${serialize(actual)}`);
    }

    postResult({
      type: "code-run-result",
      runId: message.runId,
      ok: true,
      output
    });
  } catch (error) {
    postResult({
      type: "code-run-result",
      runId: message.runId,
      ok: false,
      error: error && error.message ? error.message : String(error),
      output
    });
  }
}

self.addEventListener("message", (event) => {
  handleRunTests(event);
  handleRunCode(event);
});
