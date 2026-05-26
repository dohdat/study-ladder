import { describe, expect, it } from "vitest";

import { CODE_TEMPLATES, applyCodeTemplateContext, getSlashTemplateCommandRange, registerCodeTemplateCompletions, setNextCodeTemplateContextWord } from "../lib/codeTemplates";

describe("codeTemplates", () => {
  it("keeps keyboard template triggers unique", () => {
    const labels = CODE_TEMPLATES.map((template) => template.label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it("includes basic snippets and algorithm relic snippets", () => {
    expect(CODE_TEMPLATES.filter((template) => template.kind === "basic").map((template) => template.label)).toEqual(expect.arrayContaining(["fori", "hashmap", "set", "sortasc", "forentries", "grid", "dirs4"]));
    expect(CODE_TEMPLATES.filter((template) => template.kind === "relic").map((template) => template.label)).toEqual(expect.arrayContaining(["dfs", "bfs", "binarysearch", "twopointers", "slidingwindow"]));
    expect(CODE_TEMPLATES.map((template) => template.label)).not.toContain("unionfind");
    expect(CODE_TEMPLATES.map((template) => template.label)).not.toContain("forof");
    expect(CODE_TEMPLATES.map((template) => template.label)).not.toEqual(expect.arrayContaining(["sortdesc", "forrev", "guard"]));
  });

  it("keeps dfs as a learning scaffold instead of a completed tree template", () => {
    const dfs = CODE_TEMPLATES.find((template) => template.label === "dfs");
    expect(dfs?.insertText).toContain("${1:baseCase}");
    expect(dfs?.insertText).toContain("${3:// explore child / next state}");
    expect(dfs?.insertText).not.toContain("const left = dfs(node.left)");
    expect(dfs?.insertText).not.toContain("Math.max(left, right) + 1");
  });

  it("defines safe row and column counts in the grid template", () => {
    const grid = CODE_TEMPLATES.find((template) => template.label === "grid");
    expect(grid?.insertText).toContain("const rows = ${1:grid}.length;");
    expect(grid?.insertText).toContain("const cols = rows ? ${1:grid}[0].length : 0;");
  });

  it("uses the word under the cursor as the default array placeholder", () => {
    const forLoop = CODE_TEMPLATES.find((template) => template.label === "fori");
    const hashmap = CODE_TEMPLATES.find((template) => template.label === "hashmap");
    const twoPointers = CODE_TEMPLATES.find((template) => template.label === "twopointers");

    expect(applyCodeTemplateContext(forLoop?.insertText || "", "nums")).toContain("${2:nums}.length");
    expect(applyCodeTemplateContext(hashmap?.insertText || "", "nums")).toContain("of ${3:nums}");
    expect(applyCodeTemplateContext(twoPointers?.insertText || "", "nums")).toContain("${1:nums}.length");
  });

  it("keeps the two pointers and sliding window templates fill-in-the-blank oriented", () => {
    const twoPointers = CODE_TEMPLATES.find((template) => template.label === "twopointers");
    const slidingWindow = CODE_TEMPLATES.find((template) => template.label === "slidingwindow");

    expect(twoPointers?.insertText).toContain("${3:condition}");
    expect(twoPointers?.insertText).toContain("${4:moveLeft}");
    expect(slidingWindow?.insertText).toContain("${4:// add ${1:arr}[right] to the window}");
    expect(slidingWindow?.insertText).toContain("${6:// remove ${1:arr}[left] from the window}");
  });

  it("keeps graph search and binary search templates scaffolded for practice", () => {
    const dfsGraph = CODE_TEMPLATES.find((template) => template.label === "dfsgraph");
    const bfs = CODE_TEMPLATES.find((template) => template.label === "bfs");
    const binarySearch = CODE_TEMPLATES.find((template) => template.label === "binarysearch");

    expect(dfsGraph?.insertText).toContain("${0:// decide skip, mark seen, and push}");
    expect(dfsGraph?.insertText).not.toContain("if (seen.has(next)) continue;");
    expect(dfsGraph?.insertText).not.toContain("stack.push(next);");
    expect(bfs?.insertText).toContain("${0:// decide skip, mark seen, and enqueue}");
    expect(bfs?.insertText).not.toContain("if (seen.has(next)) continue;");
    expect(bfs?.insertText).not.toContain("queue.push(next);");
    expect(binarySearch?.insertText).toContain("${7:// move left bound}");
    expect(binarySearch?.insertText).toContain("${0:// move right bound}");
    expect(binarySearch?.insertText).not.toContain("left = mid + 1;");
    expect(binarySearch?.insertText).not.toContain("right = mid - 1;");
  });

  it("uses the captured right-click word when suggestions run at another cursor position", () => {
    const providers: Array<{ provideCompletionItems: (model: unknown, position: { column: number; lineNumber: number }) => { suggestions: Array<{ insertText: string; label: string }> } }> = [];
    const monaco = {
      languages: {
        CompletionItemInsertTextRule: { InsertAsSnippet: 4 },
        CompletionItemKind: { Snippet: 27 },
        registerCompletionItemProvider: (_language: string, provider: (typeof providers)[number]) => {
          providers.push(provider);
          return { dispose: () => undefined };
        }
      }
    };
    registerCodeTemplateCompletions(monaco as never);
    setNextCodeTemplateContextWord("nums");

    const completions = providers[0].provideCompletionItems({
      getLineContent: () => "",
      getWordUntilPosition: () => ({ endColumn: 5, word: "", startColumn: 5 })
    }, { column: 5, lineNumber: 3 });

    expect(completions.suggestions.find((suggestion) => suggestion.label === "fori")?.insertText).toContain("${2:nums}.length");
  });

  it("treats slash as a template command only at a blank or indented command position", () => {
    const model = {
      getLineContent: (lineNumber: number) => lineNumber === 1 ? "  /df" : "const x = a / b"
    };

    expect(getSlashTemplateCommandRange(model, { column: 6, lineNumber: 1 })).toEqual({
      endColumn: 6,
      endLineNumber: 1,
      startColumn: 3,
      startLineNumber: 1
    });
    expect(getSlashTemplateCommandRange(model, { column: 14, lineNumber: 2 })).toBeNull();
  });

  it("lets slash-prefixed template text match snippet suggestions", () => {
    const providers: Array<{ provideCompletionItems: (model: { getLineContent: (lineNumber: number) => string; getWordUntilPosition: () => { endColumn: number; word: string; startColumn: number } }, position: { column: number; lineNumber: number }) => { suggestions: Array<{ filterText?: string; label: string; range: unknown }> } }> = [];
    const monaco = {
      languages: {
        CompletionItemInsertTextRule: { InsertAsSnippet: 4 },
        CompletionItemKind: { Snippet: 27 },
        registerCompletionItemProvider: (_language: string, provider: (typeof providers)[number]) => {
          providers.push(provider);
          return { dispose: () => undefined };
        }
      }
    };
    registerCodeTemplateCompletions(monaco as never);

    const completions = providers[0].provideCompletionItems({
      getLineContent: () => "  /hashmap",
      getWordUntilPosition: () => ({ endColumn: 11, word: "hashmap", startColumn: 4 })
    }, { column: 11, lineNumber: 1 });

    expect(completions.suggestions.find((suggestion) => suggestion.label === "hashmap")?.filterText).toBe("/hashmap");
  });
});
