const isAlreadyTerminated = (line: string) => {
  return !line || line.endsWith(";") || line.endsWith("{") || line.endsWith("}") || line.endsWith(",") || line.endsWith(":");
};

const FOR_HEADER_SEMICOLON = "__STUDY_LADDER_FOR_SEMICOLON__";
const INLINE_OBJECT_LITERAL_PREFIX = "__STUDY_LADDER_INLINE_OBJECT_LITERAL_";

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

const getInlineClosedLine = (line: string) => {
  const closers: string[] = [];
  for (const char of line) {
    if (char === "(") {
      closers.push(")");
    } else if (char === "[") {
      closers.push("]");
    } else if (char === ")" || char === "]") {
      closers.pop();
    }
  }
  return `${line}${closers.reverse().join("")}`;
};

const completeConstructorCall = (line: string) => {
  return line.replace(/\bnew\s+([A-Z][\w.$]*)(?=\s*(?:[;,)}\]]|$))/g, "new $1()");
};

const normalizeDeclarationAssignmentSpacing = (line: string) => {
  return line.replace(/^((?:const|let|var)\s+[^=]+?)\s*=\s*/, "$1 = ");
};

const shouldAddSemicolon = (line: string) => {
  const trimmed = line.trim();
  if (trimmed.endsWith("}") && isSemicolonStatement(trimmed)) {
    return true;
  }

  if (isAlreadyTerminated(trimmed)) {
    return false;
  }

  if (isControlStatement(trimmed)) {
    return false;
  }

  return isSemicolonStatement(trimmed);
};

const protectForHeaderSemicolons = (source: string) => {
  return source.replace(/\bfor\s*\(([^)]*)\)/g, (_match, header: string) => {
    return `for (${header.replace(/;/g, FOR_HEADER_SEMICOLON)})`;
  });
};

const restoreForHeaderSemicolons = (line: string) => {
  return line.replace(new RegExp(FOR_HEADER_SEMICOLON, "g"), ";");
};

const splitTopLevel = (source: string, separator: string) => {
  const parts: string[] = [];
  let current = "";
  let quote: string | null = null;
  let escaped = false;
  let depth = 0;
  for (const char of source) {
    if (quote) {
      current += char;
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === "\"" || char === "'" || char === "`") {
      quote = char;
      current += char;
      continue;
    }
    if (char === "(" || char === "[") {
      depth += 1;
    } else if (char === ")" || char === "]") {
      depth = Math.max(0, depth - 1);
    } else if (char === separator && depth === 0) {
      parts.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  parts.push(current.trim());
  return parts;
};

const formatInlineObjectLiteral = (literal: string) => {
  const body = literal.slice(1, -1).trim();
  if (!body) {
    return "{}";
  }

  const entries = splitTopLevel(body, ",")
    .filter(Boolean)
    .map((entry) => {
      const colonParts = splitTopLevel(entry, ":");
      if (colonParts.length < 2) {
        return entry.trim();
      }
      return `${colonParts[0].trim()}: ${colonParts.slice(1).join(":").trim()}`;
    });
  return `{ ${entries.join(", ")} }`;
};

const protectInlineObjectLiterals = (source: string) => {
  const literals: string[] = [];
  const protectedSource = source.replace(/\{[^{}\n]*:[^{}\n]*\}/g, (literal) => {
    const key = `${INLINE_OBJECT_LITERAL_PREFIX}${literals.length}__`;
    literals.push(formatInlineObjectLiteral(literal));
    return key;
  });
  return { literals, protectedSource };
};

const restoreInlineObjectLiterals = (line: string, literals: string[]) => {
  return line.replace(new RegExp(`${INLINE_OBJECT_LITERAL_PREFIX}(\\d+)__`, "g"), (_match, index: string) => literals[Number(index)] || _match);
};

export const beautifyCode = (source: string) => {
  const protectedInlineObjects = protectInlineObjectLiterals(protectForHeaderSemicolons(source));
  const compact = protectedInlineObjects.protectedSource
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+$/gm, "")
    .replace(/[ \t]*([{};])[ \t]*/g, "$1\n")
    .replace(/}\n;/g, "};")
    .replace(/\)\{/g, ") {")
    .replace(/\s*=>\s*\{/g, " => {")
    .replace(/\s*(\belse\b)\s*/g, " else ")
    .replace(/\n{3,}/g, "\n\n");

  let indent = 0;
  const lines = compact
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const restoredLine = normalizeDeclarationAssignmentSpacing(restoreInlineObjectLiterals(restoreForHeaderSemicolons(line), protectedInlineObjects.literals));
      const closedLine = completeConstructorCall(getInlineClosedLine(restoredLine));
      if (closedLine.startsWith("}") || closedLine.startsWith("]") || closedLine.startsWith(")")) {
        indent = Math.max(0, indent - 1);
      }

      const formattedLine = shouldAddSemicolon(closedLine) ? `${closedLine};` : closedLine;
      const output = `${"  ".repeat(indent)}${formattedLine}`;
      if (closedLine.endsWith("{")) {
        indent += 1;
      }
      return output;
    });

  while (indent > 0) {
    indent -= 1;
    lines.push(`${"  ".repeat(indent)}}`);
  }

  return `${lines.join("\n")}\n`;
};
