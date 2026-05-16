import { spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const LENGTH_BYTES = 4;
const BUFFER_START = 0;
const PORT_AUTO = 0;
const FIRST_REQUEST_ID = 1;
const READY_STATUS = 200;
const READY_ATTEMPTS = 100;
const READY_DELAY_MS = 150;
const TURN_TIMEOUT_MS = 120000;
const STDERR_LIMIT = 8000;
const DEFAULT_NODE_PATH = "C:\\nvm4w\\nodejs\\node.exe";
const DEFAULT_CODEX_JS_PATH = "C:\\nvm4w\\nodejs\\node_modules\\@openai\\codex\\bin\\codex.js";
const CLIENT_INFO = { name: "study-ladder", title: "Study Ladder", version: "0.2.0" };
const HOST_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.dirname(HOST_DIR);
const DEVELOPER_INSTRUCTIONS = [
  "You are embedded in Study Ladder, a JavaScript interview-practice Chrome extension.",
  "Give exactly one next-step hint for the current question and code.",
  "Do not reveal the full solution, final code, or complete algorithm.",
  "Keep the hint concise and actionable."
].join("\n");

let pendingInput = Buffer.alloc(BUFFER_START);

process.stdin.on("data", handleNativeData);
process.stdin.on("end", handleNativeEnd);

function handleNativeData(chunk) {
  pendingInput = Buffer.concat([pendingInput, chunk]);
  readNativeMessages();
}

function handleNativeEnd() {
  process.exitCode = BUFFER_START;
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

  if (message?.type !== "hint" || typeof message.prompt !== "string") {
    sendNativeMessage({ type: "codex-hint-error", error: "Native host received an invalid hint request." });
    return;
  }

  runHintRequest(message.prompt).catch((error) => {
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
  if (typeof WebSocket === "undefined") {
    throw new Error("Node WebSocket support is unavailable. Use Node 22 or newer for the native host.");
  }

  const appServer = await startAppServer();
  try {
    const text = await streamCodexHint(appServer.port, prompt);
    sendNativeMessage({ type: "codex-hint-done", text });
  } finally {
    stopAppServer(appServer);
  }
}

async function startAppServer() {
  const port = await findFreePort();
  const launch = resolveCodexLaunchCommand();
  const child = spawn(launch.command, [...launch.args, "app-server", "--listen", `ws://127.0.0.1:${port}`], {
    cwd: REPO_ROOT,
    env: { ...process.env, CODEX_SUPPRESS_COMPLETION_NOTIFICATION: "1" },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true
  });
  const appServer = createAppServerHandle(child, port);
  await Promise.race([waitForReady(port), appServer.childExitPromise]);
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
    appServer.child.kill();
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

async function waitForReady(port) {
  const url = `http://127.0.0.1:${port}/readyz`;
  for (let attempt = BUFFER_START; attempt < READY_ATTEMPTS; attempt += FIRST_REQUEST_ID) {
    if (await isReady(url)) {
      return;
    }
    await delay(READY_DELAY_MS);
  }
  throw new Error("Timed out waiting for Codex app-server to become ready.");
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

async function streamCodexHint(port, prompt) {
  const ws = await connectWebSocket(`ws://127.0.0.1:${port}`);
  const turnTimeout = createTimeout(TURN_TIMEOUT_MS);
  const state = createCodexState();
  try {
    const turnCompletion = createTurnCompletion(ws, state);
    await sendCodexRequest(ws, state, "initialize", {
      capabilities: { experimentalApi: true },
      clientInfo: CLIENT_INFO
    });
    await startCodexThread(ws, state);
    await sendCodexRequest(ws, state, "turn/start", {
      approvalPolicy: "never",
      effort: "medium",
      input: [{ type: "text", text: prompt, text_elements: [] }],
      threadId: state.threadId
    });
    return await Promise.race([turnCompletion.promise, turnTimeout.promise]);
  } finally {
    turnTimeout.cancel();
    ws.close();
  }
}

function createCodexState() {
  return {
    accumulatedText: "",
    fallbackText: "",
    nextRequestId: FIRST_REQUEST_ID,
    pending: new Map(),
    threadId: "",
    turnCompleted: false
  };
}

async function startCodexThread(ws, state) {
  const result = await sendCodexRequest(ws, state, "thread/start", {
    approvalPolicy: "never",
    cwd: REPO_ROOT,
    developerInstructions: DEVELOPER_INSTRUCTIONS,
    ephemeral: true,
    experimentalRawEvents: true,
    model: null,
    persistExtendedHistory: false,
    sandbox: "read-only",
    sessionStartSource: "clear"
  });
  state.threadId = result?.thread?.id || "";
  if (!state.threadId) {
    throw new Error("Codex app-server did not return a thread id.");
  }
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
  sendNativeMessage({ type: "codex-hint-chunk", text: delta });
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
    rejectTurn(new Error(turn?.error?.message || "Codex turn failed while generating a hint."));
    return;
  }
  resolveTurn(state.accumulatedText || state.fallbackText);
}

function createTimeout(ms) {
  let timer;
  const promise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error("Timed out waiting for Codex hint.")), ms);
  });
  return {
    promise,
    cancel: () => clearTimeout(timer)
  };
}

function getErrorMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
