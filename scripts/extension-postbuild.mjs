import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

const outDir = join(process.cwd(), "out");
const scriptPattern = /<script\b(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/gi;
const dataScriptPattern = /\bid=(["'])__NEXT_DATA__\1/i;

function jsString(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

function externalizeInlineScripts(fileName) {
  const htmlPath = join(outDir, fileName);
  const pageName = basename(fileName, ".html");
  const html = readFileSync(htmlPath, "utf8");
  let scriptIndex = 0;
  let changed = false;

  const rewritten = html.replace(scriptPattern, (fullMatch, attrs, content) => {
    if (!content.trim()) {
      return fullMatch;
    }

    changed = true;
    const isNextData = dataScriptPattern.test(attrs);
    const outputName = isNextData ? `extension-next-data-${pageName}.js` : `extension-inline-${pageName}-${scriptIndex}.js`;
    scriptIndex += 1;
    const outputPath = join(outDir, outputName);

    if (isNextData) {
      writeFileSync(
        outputPath,
        `(() => {
  const current = document.currentScript;
  const dataScript = document.createElement("script");
  dataScript.id = "__NEXT_DATA__";
  dataScript.type = "application/json";
  dataScript.textContent = ${jsString(content)};
  current.after(dataScript);
})();
`,
        "utf8"
      );
      return `<script src="./${outputName}"></script>`;
    }

    writeFileSync(outputPath, `${content.trim()}\n`, "utf8");
    return `<script${attrs} src="./${outputName}"></script>`;
  });

  if (changed) {
    writeFileSync(htmlPath, rewritten, "utf8");
  }
}

for (const entry of readdirSync(outDir)) {
  if (entry.endsWith(".html")) {
    externalizeInlineScripts(entry);
  }
}
