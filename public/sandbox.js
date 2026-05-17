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

const runSingleTest = async (userFunction, test, stdout = []) => {
  const inputArgs = JSON.parse(JSON.stringify(test.args));
  const args = serialize(test.args);
  try {
    const actual = await userFunction(...inputArgs);
    return {
      name: test.name,
      pass: stableEqual(actual, test.expected),
      args,
      expected: serialize(test.expected),
      actual: serialize(actual),
      stdout
    };
  } catch (error) {
    return {
      name: test.name,
      pass: false,
      args,
      expected: serialize(test.expected),
      actual: error && error.message ? error.message : String(error),
      stdout
    };
  }
};

async function handleRunTests(event) {
  const message = event.data;
  if (!message || message.type !== "run-tests") {
    return;
  }

  const { runId, code, functionName, tests } = message;
  let activeOutput = [];
  const startedAt = Date.now();
  const sandboxConsole = {
    log: (...args) => activeOutput.push(args.map(serializeLogPart).join(" "))
  };

  try {
    const userFunction = createUserFunction(code, functionName, sandboxConsole);

    if (typeof userFunction !== "function") {
      postResult({
        type: "run-result",
        runId,
        ok: false,
        error: `Expected a function named ${functionName}.`,
        results: [],
        runtimeMs: Date.now() - startedAt
      });
      return;
    }

    const results = [];
    for (const [index, test] of tests.entries()) {
      activeOutput = [];
      results.push({ ...await runSingleTest(userFunction, test, activeOutput), name: `Case ${index + 1}` });
    }

    postResult({
      type: "run-result",
      runId,
      ok: results.every((result) => result.pass),
      results,
      runtimeMs: Date.now() - startedAt
    });
  } catch (error) {
    postResult({
      type: "run-result",
      runId,
      ok: false,
      error: error && error.message ? error.message : String(error),
      results: [],
      runtimeMs: Date.now() - startedAt
    });
  }
}

async function handleRunCode(event) {
  const message = event.data;
  if (!message || message.type !== "run-code") {
    return;
  }

  const output = [];
  let activeOutput = output;
  const startedAt = Date.now();
  const sandboxConsole = {
    log: (...args) => activeOutput.push(args.map(serializeLogPart).join(" "))
  };

  try {
    const userFunction = createUserFunction(message.code, message.functionName, sandboxConsole);

    if (typeof userFunction !== "function") {
      postResult({
        type: "code-run-result",
        runId: message.runId,
        ok: false,
        error: `Expected a function named ${message.functionName}.`,
        output,
        results: [],
        runtimeMs: Date.now() - startedAt
      });
      return;
    }

    const results = [];
    for (const [index, test] of message.tests.entries()) {
      const stdout = [];
      activeOutput = stdout;
      const inputArgs = JSON.parse(JSON.stringify(test.args));
      try {
        const actual = await userFunction(...inputArgs);
        results.push({
          name: `Case ${index + 1}`,
          pass: stableEqual(actual, test.expected),
          args: serialize(test.args),
          expected: serialize(test.expected),
          actual: serialize(actual),
          stdout
        });
      } catch (error) {
        results.push({
          name: `Case ${index + 1}`,
          pass: false,
          args: serialize(test.args),
          expected: serialize(test.expected),
          actual: error && error.message ? error.message : String(error),
          stdout
        });
      }
      output.push(...stdout);
    }
    activeOutput = output;

    postResult({
      type: "code-run-result",
      runId: message.runId,
      ok: results.every((result) => result.pass),
      output,
      results,
      runtimeMs: Date.now() - startedAt
    });
  } catch (error) {
    postResult({
      type: "code-run-result",
      runId: message.runId,
      ok: false,
      error: error && error.message ? error.message : String(error),
      output,
      results: [],
      runtimeMs: Date.now() - startedAt
    });
  }
}

self.addEventListener("message", (event) => {
  if (event.data?.type === "runner-ping") {
    postResult({ type: "runner-ready" });
    return;
  }
  handleRunTests(event);
  handleRunCode(event);
});

postResult({ type: "runner-ready" });
