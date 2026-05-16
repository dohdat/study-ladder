const shouldAddSemicolon = (line: string) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.endsWith(";") || trimmed.endsWith("{") || trimmed.endsWith("}") || trimmed.endsWith(",") || trimmed.endsWith(":")) {
    return false;
  }

  if (/^(if|for|while|switch|function|class|else|try|catch|finally)\b/.test(trimmed)) {
    return false;
  }

  return /^(return|throw|break|continue)\b/.test(trimmed)
    || /^(const|let|var)\s+/.test(trimmed)
    || /^[\w.$\]]+\s*(=|\+=|-=|\*=|\/=|%=)/.test(trimmed)
    || /^[\w.$]+\([^)]*\)$/.test(trimmed)
    || /^\w+(\+\+|--)$/.test(trimmed);
};

export const beautifyCode = (source: string) => {
  const compact = source
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+$/gm, "")
    .replace(/[ \t]*([{};])[ \t]*/g, "$1\n")
    .replace(/\)\{/g, ") {")
    .replace(/\s*(\belse\b)\s*/g, " else ")
    .replace(/\n{3,}/g, "\n\n");

  let indent = 0;
  const lines = compact
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      if (line.startsWith("}") || line.startsWith("]") || line.startsWith(")")) {
        indent = Math.max(0, indent - 1);
      }

      const formattedLine = shouldAddSemicolon(line) ? `${line};` : line;
      const output = `${"  ".repeat(indent)}${formattedLine}`;
      if (line.endsWith("{")) {
        indent += 1;
      }
      return output;
    });

  return `${lines.join("\n")}\n`;
};
