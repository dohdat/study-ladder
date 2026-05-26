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
    insertText: "const rows = ${1:grid}.length;\nconst cols = rows ? ${1:grid}[0].length : 0;\n\nfor (let ${2:r} = 0; ${2:r} < rows; ${2:r}++) {\n  for (let ${3:c} = 0; ${3:c} < cols; ${3:c}++) {\n    ${0}\n  }\n}",
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
    insertText: "let left = 0;\nlet right = ${1:arr}.length - 1;\n\nwhile (${2:left < right}) {\n  if (${3:condition}) {\n    ${0}\n  } else if (${4:moveLeft}) {\n    left++;\n  } else {\n    right--;\n  }\n}",
    kind: "relic",
    label: "twopointers"
  },
  {
    detail: RELIC_DETAIL,
    insertText: "let left = 0;\nlet ${2:windowValue} = ${3:0};\n\nfor (let right = 0; right < ${1:arr}.length; right++) {\n  ${4:// add ${1:arr}[right] to the window}\n\n  while (${5:windowInvalid}) {\n    ${6:// remove ${1:arr}[left] from the window}\n    left++;\n  }\n\n  ${0:// update answer}\n}",
    kind: "relic",
    label: "slidingwindow"
  },
  {
    detail: RELIC_DETAIL,
    insertText: "const dfs = (node) => {\n  if (${1:baseCase}) return ${2:baseValue};\n\n  ${3:// explore child / next state}\n\n  return ${0:result};\n};",
    kind: "relic",
    label: "dfs"
  },
  {
    detail: RELIC_DETAIL,
    insertText: "const stack = [${1:start}];\nconst seen = new Set([${1:start}]);\n\nwhile (${2:stack.length}) {\n  const node = stack.pop();\n\n  ${3:// process node}\n\n  for (const next of ${4:getNeighbors(node)}) {\n    ${0:// decide skip, mark seen, and push}\n  }\n}",
    kind: "relic",
    label: "dfsgraph"
  },
  {
    detail: RELIC_DETAIL,
    insertText: "const queue = [${1:start}];\nconst seen = new Set([${1:start}]);\n\nfor (let head = 0; ${2:head < queue.length}; head++) {\n  const node = queue[head];\n\n  ${3:// process node}\n\n  for (const next of ${4:getNeighbors(node)}) {\n    ${0:// decide skip, mark seen, and enqueue}\n  }\n}",
    kind: "relic",
    label: "bfs"
  },
  {
    detail: RELIC_DETAIL,
    insertText: "let left = ${1:0};\nlet right = ${2:arr.length - 1};\n\nwhile (${3:left <= right}) {\n  const mid = Math.floor((left + right) / 2);\n\n  if (${4:found / valid}) {\n    ${5:// handle mid}\n  } else if (${6:go right}) {\n    ${7:// move left bound}\n  } else {\n    ${0:// move right bound}\n  }\n}",
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
    .replaceAll("${1:arr}", `\${1:${safeWord}}`)
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
