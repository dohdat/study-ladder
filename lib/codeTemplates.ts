import type * as Monaco from "monaco-editor";

export type CodeTemplateKind = "basic" | "relic";

export type CodeTemplate = {
  detail: string;
  insertText: string;
  kind: CodeTemplateKind;
  label: string;
};

const BASIC_DETAIL = "Basic template";
const RELIC_DETAIL = "Relic template";

export const CODE_TEMPLATES: CodeTemplate[] = [
  {
    detail: BASIC_DETAIL,
    insertText: "for (let ${1:i} = 0; ${1:i} < ${2:arr}.length; ${1:i}++) {\n  const ${3:item} = ${2:arr}[${1:i}];\n  ${0}\n}",
    kind: "basic",
    label: "fori"
  },
  {
    detail: BASIC_DETAIL,
    insertText: "const ${1:freq} = new Map();\nfor (const ${2:x} of ${3:arr}) {\n  ${1:freq}.set(${2:x}, (${1:freq}.get(${2:x}) || 0) + 1);\n}\n${0}",
    kind: "basic",
    label: "hashmap"
  },
  {
    detail: BASIC_DETAIL,
    insertText: "const ${1:seen} = new Set();\nfor (const ${2:x} of ${3:arr}) {\n  ${1:seen}.add(${2:x});\n}\n${0}",
    kind: "basic",
    label: "set"
  },
  {
    detail: BASIC_DETAIL,
    insertText: "${1:arr}.sort((a, b) => a - b);\n${0}",
    kind: "basic",
    label: "sortasc"
  },
  {
    detail: BASIC_DETAIL,
    insertText: "for (const [${1:key}, ${2:value}] of ${3:map}) {\n  ${0}\n}",
    kind: "basic",
    label: "forentries"
  },
  {
    detail: BASIC_DETAIL,
    insertText: "for (let ${1:r} = 0; ${1:r} < ${2:rows}; ${1:r}++) {\n  for (let ${3:c} = 0; ${3:c} < ${4:cols}; ${3:c}++) {\n    ${0}\n  }\n}",
    kind: "basic",
    label: "grid"
  },
  {
    detail: BASIC_DETAIL,
    insertText: "const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];\n${0}",
    kind: "basic",
    label: "dirs4"
  },
  {
    detail: RELIC_DETAIL,
    insertText: "const dfs = (node) => {\n  if (!node) return ${1:0};\n  const left = dfs(node.left);\n  const right = dfs(node.right);\n  return ${2:Math.max(left, right) + 1};\n};\n${0}",
    kind: "relic",
    label: "dfs"
  },
  {
    detail: RELIC_DETAIL,
    insertText: "const stack = [${1:start}];\nconst seen = new Set([${1:start}]);\nwhile (stack.length) {\n  const node = stack.pop();\n  for (const next of ${2:getNeighbors(node)}) {\n    if (seen.has(next)) continue;\n    seen.add(next);\n    stack.push(next);\n  }\n}\n${0}",
    kind: "relic",
    label: "dfsgraph"
  },
  {
    detail: RELIC_DETAIL,
    insertText: "const queue = [${1:start}];\nconst seen = new Set([${1:start}]);\nfor (let head = 0; head < queue.length; head++) {\n  const node = queue[head];\n  for (const next of ${2:getNeighbors(node)}) {\n    if (seen.has(next)) continue;\n    seen.add(next);\n    queue.push(next);\n  }\n}\n${0}",
    kind: "relic",
    label: "bfs"
  },
  {
    detail: RELIC_DETAIL,
    insertText: "let left = ${1:0};\nlet right = ${2:arr.length - 1};\nwhile (left <= right) {\n  const mid = Math.floor((left + right) / 2);\n  if (${3:condition}) {\n    ${0:return mid;}\n  } else if (${4:goRight}) {\n    left = mid + 1;\n  } else {\n    right = mid - 1;\n  }\n}",
    kind: "relic",
    label: "binarysearch"
  }
];

export function applyCodeTemplateContext(insertText: string, contextWord: string) {
  const safeWord = contextWord.trim();
  if (!/^[A-Za-z_$][\w$]*$/.test(safeWord)) {
    return insertText;
  }
  return insertText
    .replaceAll("${2:arr}", `\${2:${safeWord}}`)
    .replaceAll("${3:arr}", `\${3:${safeWord}}`);
}

let nextCodeTemplateContextWord = "";

export function setNextCodeTemplateContextWord(word: string) {
  nextCodeTemplateContextWord = word;
}

function consumeNextCodeTemplateContextWord() {
  const word = nextCodeTemplateContextWord;
  nextCodeTemplateContextWord = "";
  return word;
}

export function getSlashTemplateCommandRange(model: { getLineContent: (lineNumber: number) => string }, position: { column: number; lineNumber: number }) {
  const prefix = model.getLineContent(position.lineNumber).slice(0, position.column - 1);
  const match = /^(\s*)\/[\w$]*$/.exec(prefix);
  if (!match) {
    return null;
  }
  return {
    endColumn: position.column,
    endLineNumber: position.lineNumber,
    startColumn: match[1].length + 1,
    startLineNumber: position.lineNumber
  };
}

export function registerCodeTemplateCompletions(monaco: typeof Monaco) {
  const languages = ["javascript", "typescript"];
  return languages.map((language) => monaco.languages.registerCompletionItemProvider(language, {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const slashCommandRange = getSlashTemplateCommandRange(model, position);
      const rightClickContextWord = consumeNextCodeTemplateContextWord();
      const currentPrefix = word.word.toLowerCase();
      const shouldReplacePrefix = currentPrefix.length > 0 && CODE_TEMPLATES.some((template) => template.label.startsWith(currentPrefix));
      const contextWord = shouldReplacePrefix ? "" : rightClickContextWord || word.word;
      const range = slashCommandRange || (shouldReplacePrefix ? {
        endColumn: word.endColumn,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        startLineNumber: position.lineNumber
      } : {
        endColumn: position.column,
        endLineNumber: position.lineNumber,
        startColumn: position.column,
        startLineNumber: position.lineNumber
      });
      return {
        suggestions: CODE_TEMPLATES.map((template, index) => ({
          detail: template.detail,
          documentation: template.kind === "relic" ? "Larger algorithm template for common interview patterns." : "Small JavaScript building block.",
          filterText: slashCommandRange ? `/${template.label}` : template.label,
          insertText: applyCodeTemplateContext(template.insertText, contextWord),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          kind: monaco.languages.CompletionItemKind.Snippet,
          label: template.label,
          range,
          sortText: `${template.kind === "basic" ? "0" : "1"}-${String(index).padStart(2, "0")}-${template.label}`
        }))
      };
    }
  }));
}
