import { Box } from "@mantine/core";

const CODE_BLOCK_BG = "#111";
const CODE_BLOCK_BORDER = "1px solid rgba(255, 255, 255, 0.12)";
const CODE_BLOCK_RADIUS = 6;
const CODE_BLOCK_PADDING = 12;
const TOKEN_PATTERN = /(`[^`]*`|"[^"]*"|'[^']*'|\/\/.*|\b\d+(?:\.\d+)?\b|\b[A-Za-z_$][\w$]*\b|\s+|.)/g;
const STRING_PATTERN = /^(`[^`]*`|"[^"]*"|'[^']*')$/;
const COMMENT_PATTERN = /^\/\//;
const NUMBER_PATTERN = /^\d/;
const IDENTIFIER_PATTERN = /^[A-Za-z_$]/;
const KEYWORD_COLOR = "#7dd3fc";
const STRING_COLOR = "#bef264";
const COMMENT_COLOR = "#94a3b8";
const NUMBER_COLOR = "#f0abfc";
const BUILTIN_COLOR = "#5eead4";
const PUNCTUATION_COLOR = "#cbd5e1";
const DEFAULT_COLOR = "#f8fafc";

const KEYWORDS = new Set([
  "break",
  "const",
  "continue",
  "else",
  "for",
  "function",
  "if",
  "let",
  "return",
  "while"
]);

const BUILTINS = new Set(["Array", "Map", "Number", "Object", "Set", "String"]);

type Token = {
  color: string;
  text: string;
};

export function HighlightedCode(props: { code: string }) {
  return (
    <Box component="pre" m={0} p={CODE_BLOCK_PADDING} style={{ background: CODE_BLOCK_BG, border: CODE_BLOCK_BORDER, borderRadius: CODE_BLOCK_RADIUS, overflowX: "auto" }}>
      <Box component="code" style={{ color: DEFAULT_COLOR, fontFamily: "monospace", whiteSpace: "pre" }}>
        {tokenizeJavaScript(props.code).map((token, index) => (
          <Box component="span" key={`${token.text}-${index}`} style={{ color: token.color }}>{token.text}</Box>
        ))}
      </Box>
    </Box>
  );
}

function tokenizeJavaScript(code: string) {
  const tokens: Token[] = [];
  for (const match of code.matchAll(TOKEN_PATTERN)) {
    const text = match[0];
    tokens.push({ color: getTokenColor(text), text });
  }
  return tokens;
}

function getTokenColor(text: string) {
  if (STRING_PATTERN.test(text)) {
    return STRING_COLOR;
  }
  if (COMMENT_PATTERN.test(text)) {
    return COMMENT_COLOR;
  }
  if (NUMBER_PATTERN.test(text)) {
    return NUMBER_COLOR;
  }
  if (KEYWORDS.has(text)) {
    return KEYWORD_COLOR;
  }
  if (IDENTIFIER_PATTERN.test(text) && BUILTINS.has(text)) {
    return BUILTIN_COLOR;
  }
  if (IDENTIFIER_PATTERN.test(text)) {
    return DEFAULT_COLOR;
  }
  return PUNCTUATION_COLOR;
}
