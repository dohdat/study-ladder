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
  try {
    return serialize(value);
  } catch {
    return String(value);
  }
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

let reactVendorPromise = null;
let frontendRoot = null;

const loadReactVendor = () => {
  if (!reactVendorPromise) {
    reactVendorPromise = (async () => {
      if (typeof self.__studyLadderLoadReactVendor !== "function") {
        throw new Error("React preview runtime is not loaded.");
      }
      return self.__studyLadderLoadReactVendor();
    })();
  }
  return reactVendorPromise;
};

const createUserFunction = (code, functionName, consoleTarget = console) => {
  const loadUserFunction = new Function(
    "console",
    `"use strict";\n${code}\n; return (typeof ${functionName} === "function") ? ${functionName} : undefined;`
  );
  return loadUserFunction(consoleTarget);
};

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

const resetFrontendRoot = () => {
  if (frontendRoot) {
    frontendRoot.unmount();
    frontendRoot = null;
  }
  const container = document.getElementById("frontend-root");
  if (container) {
    container.innerHTML = "";
  }
};

const prepareFrontendSource = (source) => source
  .replace(/^\s*import\s+[^;]+;\s*$/gm, "")
  .replace(/export\s+default\s+function\s+App/g, "function App")
  .replace(/export\s+default\s+function\s+\w+/g, "function App")
  .replace(/export\s+default\s+App\s*;?/g, "")
  .replace(/export\s+default\s+/g, "const App = ");

const createConsoleTarget = (output) => {
  const write = (level, args) => {
    const prefix = level === "log" ? "" : `${level}: `;
    output.push(`${prefix}${args.map(serializeLogPart).join(" ")}`);
  };
  return {
    assert(condition, ...args) {
      if (!condition) {
        write("assert", args.length ? args : ["Assertion failed"]);
      }
    },
    clear() {
      output.length = 0;
    },
    debug(...args) {
      write("debug", args);
    },
    error(...args) {
      write("error", args);
    },
    info(...args) {
      write("info", args);
    },
    log(...args) {
      write("log", args);
    },
    table(value) {
      write("table", [value]);
    },
    warn(...args) {
      write("warn", args);
    }
  };
};

const createFrontendComponent = (appTsx, React, consoleTarget = console) => {
  const compiler = self.ts;
  if (!compiler?.transpileModule) {
    throw new Error("TypeScript compiler is not loaded.");
  }
  const source = prepareFrontendSource(appTsx);
  const transpiled = compiler.transpileModule(source, {
    compilerOptions: {
      jsx: compiler.JsxEmit.React,
      module: compiler.ModuleKind.None,
      target: compiler.ScriptTarget.ES2020
    }
  }).outputText;
  const loadComponent = new Function(
    "React",
    "useCallback",
    "useEffect",
    "useMemo",
    "useRef",
    "useState",
    "console",
    `"use strict";\n${transpiled}\n; return (typeof App === "function") ? App : undefined;`
  );
  const component = loadComponent(React, React.useCallback, React.useEffect, React.useMemo, React.useRef, React.useState, consoleTarget);
  if (typeof component !== "function") {
    throw new Error("Expected App.tsx to export or define a React component named App.");
  }
  return component;
};

const renderFrontendPreview = async (files, consoleTarget = console) => {
  const { React, ReactDOMClient } = await loadReactVendor();
  resetFrontendRoot();
  const container = document.getElementById("frontend-root");
  if (!container) {
    throw new Error("Preview root is missing.");
  }
  const style = document.createElement("style");
  style.textContent = `
    html, body { background: #f1f5f9; color: #0f172a; margin: 0; min-height: 100%; }
    body { font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    *, *::before, *::after { box-sizing: border-box; }
    ${files["styles.css"] || ""}
  `;
  container.appendChild(style);
  const mount = document.createElement("div");
  mount.id = "frontend-preview-mount";
  container.appendChild(mount);
  const App = createFrontendComponent(files["App.tsx"] || "", React, consoleTarget);
  frontendRoot = ReactDOMClient.createRoot(mount);
  frontendRoot.render(React.createElement(App));
  await nextFrame();
  return container;
};

const runFrontendCheck = async (check, root) => {
  if (check.type === "count") {
    const count = root.querySelectorAll(check.selector || "").length;
    return {
      name: check.name,
      pass: count === check.value,
      args: serialize([check.selector]),
      expected: serialize(check.value),
      actual: serialize(count),
      stdout: []
    };
  }
  if (check.type === "clickCount") {
    const target = root.querySelector(check.selector || "");
    if (!target) {
      return {
        name: check.name,
        pass: false,
        args: serialize([check.selector]),
        expected: serialize(check.value),
        actual: "Element not found",
        stdout: []
      };
    }
    target.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    await nextFrame();
    const count = root.querySelectorAll(String(check.value || "")).length;
    return {
      name: check.name,
      pass: count > 0,
      args: serialize([check.selector, check.value]),
      expected: serialize("matching element after click"),
      actual: serialize(count),
      stdout: []
    };
  }
  if (check.type === "clickText") {
    const target = root.querySelector(check.selector || "");
    if (!target) {
      return {
        name: check.name,
        pass: false,
        args: serialize([check.selector]),
        expected: serialize(check.textIncludes || ""),
        actual: "Element not found",
        stdout: []
      };
    }
    target.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    await nextFrame();
    const actual = root.textContent || "";
    return {
      name: check.name,
      pass: actual.includes(check.textIncludes || ""),
      args: serialize([check.selector]),
      expected: serialize(check.textIncludes || ""),
      actual: serialize(actual.trim()),
      stdout: []
    };
  }
  if (check.type === "inputText") {
    const target = root.querySelector(check.selector || "");
    if (!target) {
      return {
        name: check.name,
        pass: false,
        args: serialize([check.selector]),
        expected: serialize(check.textIncludes || ""),
        actual: "Element not found",
        stdout: []
      };
    }
    const nextValue = String(check.value || "");
    const valueSetter = Object.getOwnPropertyDescriptor(target, "value")?.set;
    const prototypeValueSetter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(target), "value")?.set;
    if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
      prototypeValueSetter.call(target, nextValue);
    } else if (valueSetter) {
      valueSetter.call(target, nextValue);
    } else {
      target.value = nextValue;
    }
    target.dispatchEvent(new InputEvent("input", { bubbles: true, data: nextValue }));
    target.dispatchEvent(new Event("change", { bubbles: true }));
    await nextFrame();
    const actual = root.textContent || "";
    return {
      name: check.name,
      pass: actual.includes(check.textIncludes || ""),
      args: serialize([check.selector, check.value]),
      expected: serialize(check.textIncludes || ""),
      actual: serialize(actual.trim()),
      stdout: []
    };
  }
  const element = root.querySelector(check.selector || "");
  const actual = element?.textContent || "";
  const pass = Boolean(element) && (!check.textIncludes || actual.includes(check.textIncludes));
  return {
    name: check.name,
    pass,
    args: serialize([check.selector]),
    expected: serialize(check.textIncludes || "element exists"),
    actual: element ? serialize(actual.trim()) : "Element not found",
    stdout: []
  };
};

async function handleFrontendPreview(event) {
  const message = event.data;
  if (!message || message.type !== "frontend-preview") {
    return;
  }
  const startedAt = Date.now();
  const output = [];
  try {
    await renderFrontendPreview(message.files || {}, createConsoleTarget(output));
    postResult({
      type: "code-run-result",
      runId: message.runId,
      ok: true,
      output,
      results: [],
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

async function handleFrontendSubmit(event) {
  const message = event.data;
  if (!message || message.type !== "frontend-submit") {
    return;
  }
  const startedAt = Date.now();
  try {
    const root = await renderFrontendPreview(message.files || {});
    const results = [];
    for (const check of message.checks || []) {
      results.push(await runFrontendCheck(check, root));
    }
    postResult({
      type: "run-result",
      runId: message.runId,
      ok: results.every((result) => result.pass),
      results,
      runtimeMs: Date.now() - startedAt
    });
  } catch (error) {
    postResult({
      type: "run-result",
      runId: message.runId,
      ok: false,
      error: error && error.message ? error.message : String(error),
      results: [],
      runtimeMs: Date.now() - startedAt
    });
  }
}

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
  if (event.data?.type === "reset-runner") {
    resetFrontendRoot();
    return;
  }
  handleRunTests(event);
  handleRunCode(event);
  handleFrontendPreview(event);
  handleFrontendSubmit(event);
});

postResult({ type: "runner-ready" });
