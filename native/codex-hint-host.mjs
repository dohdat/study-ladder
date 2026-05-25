import { spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const LENGTH_BYTES = 4;
const BUFFER_START = 0;
const PORT_AUTO = 0;
const FIRST_REQUEST_ID = 1;
const SECOND_MS = 1000;
const READY_STATUS = 200;
const READY_ATTEMPTS = 100;
const READY_DELAY_MS = 150;
const HINT_TOTAL_TIMEOUT_MS = 12000;
const QUESTION_VARIANT_TOTAL_TIMEOUT_MS = 60000;
const EXAMPLE_EXPLANATION_TOTAL_TIMEOUT_MS = 45000;
const SOLUTION_REVEAL_TOTAL_TIMEOUT_MS = 75000;
const SYSTEM_DESIGN_SCORE_TOTAL_TIMEOUT_MS = 90000;
const SESSION_REQUEST_TIMEOUT_MS = 20000;
const TURN_TIMEOUT_MS = 120000;
const STDERR_LIMIT = 8000;
const HINT_EFFORT = "low";
const DEFAULT_HINT_MODEL = "gpt-5.3-codex-spark-preview";
const DEFAULT_NODE_PATH = "C:\\nvm4w\\nodejs\\node.exe";
const DEFAULT_CODEX_JS_PATH = "C:\\nvm4w\\nodejs\\node_modules\\@openai\\codex\\bin\\codex.js";
const CLIENT_INFO = { name: "study-ladder", title: "Study Ladder", version: "0.2.0" };
const HOST_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.dirname(HOST_DIR);
const DEVELOPER_INSTRUCTIONS = [
  "You are embedded in Study Ladder, a JavaScript interview-practice Chrome extension.",
  "Follow each turn's requested output format exactly.",
  "When asked for a hint, give exactly one fast next step: one short sentence and up to 2 lines of partial JavaScript.",
  "Hint code must be incomplete, not a runnable implementation.",
  "When asked for a question variant, return valid JSON only and preserve the original function contract.",
  "When asked to explain an example, explain only that example's output calculation without implementation code.",
  "When asked to reveal a solution, return the requested Markdown sections and one complete JavaScript function.",
  "When asked to score a system-design answer, return the requested score format only."
].join("\n");

let pendingInput = Buffer.alloc(BUFFER_START);
let appServerHandle = null;
let appServerPromise = null;
let codexSessionPromise = null;
let codexQueue = Promise.resolve();

process.stdin.on("data", handleNativeData);
process.stdin.on("end", handleNativeEnd);
process.once("exit", cleanupNativeHost);
process.once("SIGINT", handleSignalExit);
process.once("SIGTERM", handleSignalExit);

function handleNativeData(chunk) {
  pendingInput = Buffer.concat([pendingInput, chunk]);
  readNativeMessages();
}

function handleNativeEnd() {
  cleanupNativeHost();
  process.exitCode = BUFFER_START;
}

function handleSignalExit() {
  cleanupNativeHost();
  process.exit(BUFFER_START);
}

function readNativeMessages() {
  while (pendingInput.length >= LENGTH_BYTES) {
    const messageLength = pendingInput.readUInt32LE(BUFFER_START);
    const totalLength = LENGTH_BYTES + messageLength;
    if (pendingInput.length < totalLength) {
      return;
    }
    const payload = pendingInput.subarray(LENGTH_BYTES, totalLength).toString("utf8");
    pendingInput = pendingInput.subarray(totalLength);
    handleNativeMessage(payload);
  }
}

function handleNativeMessage(payload) {
  let message;
  try {
    message = JSON.parse(payload);
  } catch (error) {
    sendNativeMessage({ type: "codex-hint-error", error: getErrorMessage(error) });
    return;
  }

  if (message?.type === "warm") {
    warmCodexSession({ streamType: "warm" }).catch((error) => {
      sendNativeMessage({ type: "codex-hint-error", error: getErrorMessage(error) });
    });
    return;
  }

  if (message?.type === "question-variant" && typeof message.prompt === "string") {
    codexQueue = codexQueue.then(() => runQuestionVariantRequest(message.requestId, message.prompt)).catch((error) => {
      sendNativeMessage({ type: "codex-question-variant-error", requestId: message.requestId, error: getErrorMessage(error) });
    });
    return;
  }

  if (message?.type === "example-explanation" && typeof message.prompt === "string") {
    codexQueue = codexQueue.then(() => runExampleExplanationRequest(message.requestId, message.prompt)).catch((error) => {
      sendNativeMessage({ type: "codex-example-explanation-error", requestId: message.requestId, error: getErrorMessage(error) });
    });
    return;
  }

  if (message?.type === "solution-reveal" && typeof message.prompt === "string") {
    codexQueue = codexQueue.then(() => runSolutionRevealRequest(message.requestId, message.prompt)).catch((error) => {
      sendNativeMessage({ type: "codex-solution-reveal-error", requestId: message.requestId, error: getErrorMessage(error) });
    });
    return;
  }

  if (message?.type === "system-design-score" && typeof message.prompt === "string") {
    codexQueue = codexQueue.then(() => runSystemDesignScoreRequest(message.requestId, message.prompt)).catch((error) => {
      sendNativeMessage({ type: "codex-system-design-score-error", requestId: message.requestId, error: getErrorMessage(error) });
    });
    return;
  }

  if (message?.type !== "hint" || typeof message.prompt !== "string") {
    sendNativeMessage({ type: "codex-hint-error", error: "Native host received an invalid hint request." });
    return;
  }

  codexQueue = codexQueue.then(() => runHintRequest(message.prompt)).catch((error) => {
    sendNativeMessage({ type: "codex-hint-error", error: getErrorMessage(error) });
  });
}

function sendNativeMessage(message) {
  const json = JSON.stringify(message);
  const body = Buffer.from(json, "utf8");
  const header = Buffer.alloc(LENGTH_BYTES);
  header.writeUInt32LE(body.length, BUFFER_START);
  process.stdout.write(Buffer.concat([header, body]));
}

async function runHintRequest(prompt) {
  const requestTimeout = createTimeout(HINT_TOTAL_TIMEOUT_MS, "Timed out waiting for Codex hint.");
  try {
    const text = await Promise.race([runCodexTurn(prompt, { streamType: "hint" }), requestTimeout.promise]);
    sendNativeMessage({ type: "codex-hint-done", text });
  } catch (error) {
    resetCodexConnection();
    sendNativeMessage({ type: "codex-hint-error", error: getErrorMessage(error) });
  } finally {
    requestTimeout.cancel();
  }
}

async function runQuestionVariantRequest(requestId, prompt) {
  const requestTimeout = createTimeout(QUESTION_VARIANT_TOTAL_TIMEOUT_MS, "Timed out waiting for Codex question variant.");
  try {
    const text = await Promise.race([runCodexTurn(prompt, { requestId, streamType: "question-variant" }), requestTimeout.promise]);
    sendNativeMessage({ type: "codex-question-variant-done", requestId, text });
  } catch (error) {
    resetCodexConnection();
    sendNativeMessage({ type: "codex-question-variant-error", requestId, error: getErrorMessage(error) });
  } finally {
    requestTimeout.cancel();
  }
}

async function runExampleExplanationRequest(requestId, prompt) {
  const requestTimeout = createTimeout(EXAMPLE_EXPLANATION_TOTAL_TIMEOUT_MS, "Timed out waiting for Codex example explanation.");
  try {
    const text = await Promise.race([runCodexTurn(prompt, { requestId, streamType: "example-explanation" }), requestTimeout.promise]);
    sendNativeMessage({ type: "codex-example-explanation-done", requestId, text });
  } catch (error) {
    resetCodexConnection();
    sendNativeMessage({ type: "codex-example-explanation-error", requestId, error: getErrorMessage(error) });
  } finally {
    requestTimeout.cancel();
  }
}

async function runSolutionRevealRequest(requestId, prompt) {
  const requestTimeout = createTimeout(SOLUTION_REVEAL_TOTAL_TIMEOUT_MS, "Timed out waiting for Codex solution.");
  try {
    const text = await Promise.race([runCodexTurn(prompt, { requestId, streamType: "solution-reveal" }), requestTimeout.promise]);
    sendNativeMessage({ type: "codex-solution-reveal-done", requestId, text });
  } catch (error) {
    resetCodexConnection();
    sendNativeMessage({ type: "codex-solution-reveal-error", requestId, error: getErrorMessage(error) });
  } finally {
    requestTimeout.cancel();
  }
}

async function runSystemDesignScoreRequest(requestId, prompt) {
  const requestTimeout = createTimeout(SYSTEM_DESIGN_SCORE_TOTAL_TIMEOUT_MS, "Timed out waiting for Codex system design score.");
  try {
    const text = await Promise.race([runCodexTurn(prompt, { requestId, streamType: "system-design-score" }), requestTimeout.promise]);
    sendNativeMessage({ type: "codex-system-design-score-done", requestId, text });
  } catch (error) {
    resetCodexConnection();
    sendNativeMessage({ type: "codex-system-design-score-error", requestId, error: getErrorMessage(error) });
  } finally {
    requestTimeout.cancel();
  }
}

async function runCodexTurn(prompt, options) {
  if (typeof WebSocket === "undefined") {
    throw new Error("Node WebSocket support is unavailable. Use Node 22 or newer for the native host.");
  }

  sendCodexProgress(options, "Connecting to Codex app-server...\n");
  const session = await warmCodexSession(options);
  sendCodexProgress(options, "Codex session ready. Submitting rewrite prompt...\n");
  return await streamCodexTurn(session, prompt, options);
}

function sendCodexProgress(options, text) {
  if (options.streamType === "question-variant") {
    sendNativeMessage({ type: "codex-question-variant-chunk", requestId: options.requestId, text });
  }
}

async function warmHintServer(options = {}) {
  if (!appServerPromise) {
    appServerPromise = startAppServer(options).then((appServer) => {
      appServerHandle = appServer;
      appServer.childExitPromise.catch(() => {
        if (appServerPromise) {
          appServerPromise = null;
        }
        appServerHandle = null;
        codexSessionPromise = null;
      });
      return appServer;
    }).catch((error) => {
      appServerPromise = null;
      throw error;
    });
  } else {
    sendCodexProgress(options, "Waiting for existing Codex app-server startup...\n");
  }
  return await appServerPromise;
}

async function warmCodexSession(options = {}) {
  if (!codexSessionPromise) {
    codexSessionPromise = createCodexSession(options).catch((error) => {
      codexSessionPromise = null;
      throw error;
    });
  } else {
    sendCodexProgress(options, "Waiting for existing Codex session startup...\n");
  }
  return await codexSessionPromise;
}

async function createCodexSession(options = {}) {
  const appServer = await warmHintServer(options);
  sendCodexProgress(options, "Codex app-server is ready. Opening websocket...\n");
  const ws = await connectWebSocket(`ws://127.0.0.1:${appServer.port}`);
  sendCodexProgress(options, "Websocket connected. Initializing Codex session...\n");
  const state = createCodexState();
  attachCodexRpcListener(ws, state);
  ws.addEventListener("close", resetCodexSession);
  ws.addEventListener("error", resetCodexSession);
  await withTimeout(sendCodexRequest(ws, state, "initialize", {
    capabilities: { experimentalApi: true },
    clientInfo: CLIENT_INFO
  }), SESSION_REQUEST_TIMEOUT_MS, "Timed out initializing Codex app-server session.");
  sendCodexProgress(options, "Codex initialized. Starting rewrite thread...\n");
  await startCodexThread(ws, state, options);
  return { state, ws };
}

function resetCodexSession() {
  codexSessionPromise = null;
}

async function startAppServer(options = {}) {
  const port = await findFreePort();
  const launch = resolveCodexLaunchCommand();
  sendCodexProgress(options, "Launching Codex app-server process...\n");
  const child = spawn(launch.command, [...launch.args, "app-server", "--listen", `ws://127.0.0.1:${port}`], {
    cwd: REPO_ROOT,
    env: { ...process.env, CODEX_SUPPRESS_COMPLETION_NOTIFICATION: "1" },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true
  });
  const appServer = createAppServerHandle(child, port);
  await Promise.race([waitForReady(port, options, appServer), appServer.childExitPromise]);
  return appServer;
}

function createAppServerHandle(child, port) {
  let stderrBuffer = "";
  function handleStderr(chunk) {
    stderrBuffer += chunk.toString();
    if (stderrBuffer.length > STDERR_LIMIT) {
      stderrBuffer = stderrBuffer.slice(-STDERR_LIMIT);
    }
  }
  child.stderr?.on("data", handleStderr);
  return {
    child,
    port,
    childExitPromise: createChildExitPromise(child, () => stderrBuffer),
    getStderrBuffer: () => stderrBuffer
  };
}

function createChildExitPromise(child, getStderrBuffer) {
  return new Promise((_, reject) => {
    function handleError(error) {
      reject(new Error(`Failed to launch Codex app-server. ${error.message}`));
    }
    function handleExit(code, signal) {
      reject(new Error(`Codex app-server exited unexpectedly (code=${code}, signal=${signal}). ${getStderrBuffer()}`));
    }
    child.once("error", handleError);
    child.once("exit", handleExit);
  });
}

function stopAppServer(appServer) {
  if (!appServer.child.killed) {
    if (process.platform === "win32") {
      spawn("taskkill.exe", ["/pid", String(appServer.child.pid), "/t", "/f"], {
        stdio: "ignore",
        windowsHide: true
      }).once("error", () => appServer.child.kill());
      return;
    }
    appServer.child.kill();
  }
}

function resetCodexConnection() {
  const currentAppServer = appServerHandle;
  const currentAppServerPromise = appServerPromise;
  codexSessionPromise = null;
  appServerPromise = null;
  appServerHandle = null;
  if (currentAppServer) {
    stopAppServer(currentAppServer);
    return;
  }
  currentAppServerPromise?.then(stopAppServer).catch(() => undefined);
}

function cleanupNativeHost() {
  const currentAppServer = appServerHandle;
  appServerHandle = null;
  appServerPromise = null;
  codexSessionPromise = null;
  if (currentAppServer) {
    stopAppServer(currentAppServer);
  }
}

function resolveCodexLaunchCommand() {
  const nodePath = process.env.CODEX_NODE_PATH || DEFAULT_NODE_PATH;
  const codexJsPath = process.env.CODEX_CLI_JS_PATH || DEFAULT_CODEX_JS_PATH;
  if (fs.existsSync(nodePath) && fs.existsSync(codexJsPath)) {
    return { command: nodePath, args: [codexJsPath] };
  }
  const codexCmdPath = path.join(path.dirname(nodePath), "codex.cmd");
  if (fs.existsSync(codexCmdPath)) {
    return { command: codexCmdPath, args: [] };
  }
  return { command: "codex.cmd", args: [] };
}

async function findFreePort() {
  return await new Promise((resolve, reject) => {
    const server = net.createServer();
    function handleListen() {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close();
        reject(new Error("Could not find a free Codex app-server port."));
        return;
      }
      server.close(() => resolve(address.port));
    }
    server.once("error", reject);
    server.listen(PORT_AUTO, "127.0.0.1", handleListen);
  });
}

async function waitForReady(port, options = {}, appServer = null) {
  const url = `http://127.0.0.1:${port}/readyz`;
  for (let attempt = BUFFER_START; attempt < READY_ATTEMPTS; attempt += FIRST_REQUEST_ID) {
    if (await isReady(url)) {
      sendCodexProgress(options, "Codex app-server readyz passed.\n");
      return;
    }
    if (attempt > BUFFER_START && attempt % 20 === BUFFER_START) {
      const elapsedMs = attempt * READY_DELAY_MS;
      const stderr = appServer?.getStderrBuffer?.().trim();
      sendCodexProgress(options, `Waiting for Codex app-server readyz (${Math.round(elapsedMs / SECOND_MS)}s)...${stderr ? ` Recent stderr: ${stderr.slice(-240)}` : ""}\n`);
    }
    await delay(READY_DELAY_MS);
  }
  const stderr = appServer?.getStderrBuffer?.().trim();
  throw new Error(`Timed out waiting for Codex app-server to become ready.${stderr ? ` Recent stderr: ${stderr}` : ""}`);
}

async function isReady(url) {
  try {
    const response = await fetch(url);
    return response.status === READY_STATUS;
  } catch {
    return false;
  }
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function streamCodexTurn(session, prompt, options) {
  const turnTimeout = createTimeout(TURN_TIMEOUT_MS, "Timed out waiting for Codex.");
  const { state, ws } = session;
  resetTurnState(state);
  state.requestId = options.requestId;
  state.streamType = options.streamType;
  try {
    const turnCompletion = createTurnCompletion(ws, state);
    await sendCodexRequest(ws, state, "turn/start", {
      approvalPolicy: "never",
      effort: HINT_EFFORT,
      input: [{ type: "text", text: prompt, text_elements: [] }],
      threadId: state.threadId
    });
    sendCodexProgress(options, "Rewrite turn submitted. Waiting for Codex response...\n");
    return await Promise.race([turnCompletion.promise, turnTimeout.promise]);
  } finally {
    turnTimeout.cancel();
  }
}

function createCodexState() {
  return {
    accumulatedText: "",
    fallbackText: "",
    nextRequestId: FIRST_REQUEST_ID,
    pending: new Map(),
    threadId: "",
    turnCompleted: false,
    requestId: null,
    streamType: null
  };
}

function resetTurnState(state) {
  state.accumulatedText = "";
  state.fallbackText = "";
  state.requestId = null;
  state.streamType = null;
  state.turnCompleted = false;
}

async function startCodexThread(ws, state, options = {}) {
  const result = await withTimeout(sendCodexRequest(ws, state, "thread/start", {
    approvalPolicy: "never",
    cwd: REPO_ROOT,
    developerInstructions: DEVELOPER_INSTRUCTIONS,
    ephemeral: true,
    experimentalRawEvents: true,
    model: process.env.CODEX_HINT_MODEL || DEFAULT_HINT_MODEL,
    persistExtendedHistory: false,
    sandbox: "read-only",
    sessionStartSource: "clear"
  }), SESSION_REQUEST_TIMEOUT_MS, "Timed out starting Codex rewrite thread.");
  state.threadId = result?.thread?.id || "";
  if (!state.threadId) {
    throw new Error("Codex app-server did not return a thread id.");
  }
  sendCodexProgress(options, "Codex rewrite thread ready.\n");
}

function connectWebSocket(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    function cleanup() {
      ws.removeEventListener("open", handleOpen);
      ws.removeEventListener("error", handleError);
    }
    function handleOpen() {
      cleanup();
      resolve(ws);
    }
    function handleError() {
      cleanup();
      reject(new Error("Could not connect to Codex app-server websocket."));
    }
    ws.addEventListener("open", handleOpen);
    ws.addEventListener("error", handleError);
  });
}

function attachCodexRpcListener(ws, state) {
  function handleMessage(event) {
    const message = parseCodexMessage(event.data);
    if (message && typeof message.id === "number") {
      resolvePendingRequest(message, state);
    }
  }
  ws.addEventListener("message", handleMessage);
  ws.addEventListener("close", () => {
    ws.removeEventListener("message", handleMessage);
  }, { once: true });
}

function sendCodexRequest(ws, state, method, params) {
  const id = state.nextRequestId;
  state.nextRequestId += FIRST_REQUEST_ID;
  const payload = { jsonrpc: "2.0", id, method, params };
  const responsePromise = new Promise((resolve, reject) => {
    state.pending.set(id, { resolve, reject });
  });
  ws.send(JSON.stringify(payload));
  return responsePromise;
}

function createTurnCompletion(ws, state) {
  let resolveTurn;
  let rejectTurn;
  const promise = new Promise((resolve, reject) => {
    resolveTurn = resolve;
    rejectTurn = reject;
  });
  function handleMessage(event) {
    const message = parseCodexMessage(event.data);
    if (message) {
      routeCodexMessage(message, state, resolveTurn, rejectTurn);
    }
  }
  function handleClose() {
    if (!state.turnCompleted) {
      rejectTurn(new Error("Codex app-server connection closed before the hint completed."));
    }
  }
  function handleError() {
    rejectTurn(new Error("Failed to communicate with Codex app-server."));
  }
  ws.addEventListener("message", handleMessage);
  ws.addEventListener("close", handleClose);
  ws.addEventListener("error", handleError);
  promise.finally(() => {
    ws.removeEventListener("message", handleMessage);
    ws.removeEventListener("close", handleClose);
    ws.removeEventListener("error", handleError);
  });
  return { promise };
}

function parseCodexMessage(data) {
  try {
    return JSON.parse(String(data));
  } catch {
    return null;
  }
}

function routeCodexMessage(message, state, resolveTurn, rejectTurn) {
  if (typeof message.id === "number") {
    resolvePendingRequest(message, state);
    return;
  }
  if (message.method === "item/agentMessage/delta") {
    handleAgentDelta(message, state);
    return;
  }
  if (message.method === "item/completed") {
    handleCompletedItem(message, state);
    return;
  }
  if (message.method === "rawResponseItem/completed") {
    handleRawCompletedItem(message, state);
    return;
  }
  if (message.method === "turn/completed") {
    handleTurnCompleted(message, state, resolveTurn, rejectTurn);
    return;
  }
  if (message.method === "error") {
    rejectTurn(new Error(message.params?.message || "Codex app-server emitted an error."));
  }
}

function resolvePendingRequest(message, state) {
  const pending = state.pending.get(message.id);
  if (!pending) {
    return;
  }
  state.pending.delete(message.id);
  if (message.error) {
    pending.reject(new Error(message.error.message || "Codex app-server request failed."));
    return;
  }
  pending.resolve(message.result);
}

function handleAgentDelta(message, state) {
  const delta = message.params?.delta || "";
  if (!delta) {
    return;
  }
  state.accumulatedText += delta;
  if (state.streamType === "hint") {
    sendNativeMessage({ type: "codex-hint-chunk", text: delta });
    return;
  }
  if (state.streamType === "question-variant") {
    sendNativeMessage({ type: "codex-question-variant-chunk", requestId: state.requestId, text: delta });
    return;
  }
  if (state.streamType === "example-explanation") {
    sendNativeMessage({ type: "codex-example-explanation-chunk", requestId: state.requestId, text: delta });
  }
}

function handleCompletedItem(message, state) {
  const item = message.params?.item;
  if (item?.type === "agentMessage" && typeof item.text === "string") {
    state.fallbackText = item.text;
  }
}

function handleRawCompletedItem(message, state) {
  const item = message.params?.item;
  if (item?.type !== "message" || !Array.isArray(item.content)) {
    return;
  }
  const outputText = item.content
    .filter((entry) => entry?.type === "output_text")
    .map((entry) => entry?.text || "")
    .join("");
  if (outputText) {
    state.fallbackText = outputText;
  }
}

function handleTurnCompleted(message, state, resolveTurn, rejectTurn) {
  if (message.params?.threadId !== state.threadId) {
    return;
  }
  state.turnCompleted = true;
  const turn = message.params?.turn;
  if (turn?.status === "failed") {
    rejectTurn(new Error(turn?.error?.message || "Codex turn failed."));
    return;
  }
  resolveTurn(state.accumulatedText || state.fallbackText);
}

function createTimeout(ms, message) {
  let timer;
  const promise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), ms);
  });
  return {
    promise,
    cancel: () => clearTimeout(timer)
  };
}

async function withTimeout(promise, ms, message) {
  const timeout = createTimeout(ms, message);
  try {
    return await Promise.race([promise, timeout.promise]);
  } finally {
    timeout.cancel();
  }
}

function getErrorMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
