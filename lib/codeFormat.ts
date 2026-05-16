const isAlreadyTerminated = (line: string) => {
  return !line || line.endsWith(";") || line.endsWith("{") || line.endsWith("}") || line.endsWith(",") || line.endsWith(":");
};

const isControlStatement = (line: string) => {
  return /^(if|for|while|switch|function|class|else|try|catch|finally)\b/.test(line);
};

const isSemicolonStatement = (line: string) => {
  return /^(return|throw|break|continue)\b/.test(line)
    || /^(const|let|var)\s+/.test(line)
    || /^[\w.$\]]+\s*(=|\+=|-=|\*=|\/=|%=)/.test(line)
    || /^[\w.$]+\([^)]*\)$/.test(line)
    || /^\w+(\+\+|--)$/.test(line);
};

const shouldAddSemicolon = (line: string) => {
  const trimmed = line.trim();
  if (isAlreadyTerminated(trimmed)) {
    return false;
  }

  if (isControlStatement(trimmed)) {
    return false;
  }

  return isSemicolonStatement(trimmed);
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
