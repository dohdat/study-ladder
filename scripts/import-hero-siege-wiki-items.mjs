import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import https from "node:https";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, "..");
const WIKI_ORIGIN = "https://herosiege.wiki.gg";
const ITEM_INDEX_PAGE = "Items";
const OUTPUT_JSON = join(ROOT_DIR, "data", "heroSiegeWikiItems.json");
const PUBLIC_IMAGE_DIR = join(ROOT_DIR, "public", "hero_siege_wiki_items");
const PUBLIC_IMAGE_PATH = "hero_siege_wiki_items";
const REQUEST_HEADERS = {
  "User-Agent": "StudyLadderHeroSiegeImporter/1.0"
};

const PAGE_SLOT_MAP = new Map([
  ["Amulets", "headAccessory"],
  ["Axes", "mainHand"],
  ["Belts", "bodyAccessory"],
  ["Body Armors", "armor"],
  ["Books", "offHand"],
  ["Boots", "feet"],
  ["Bows", "mainHand"],
  ["Canes", "mainHand"],
  ["Chainsaws", "mainHand"],
  ["Charms", "backAccessory"],
  ["Claws", "mainHand"],
  ["Daggers", "mainHand"],
  ["Flasks", "mainHand"],
  ["Gloves", "bodyAccessory"],
  ["Glyphs", "backAccessory"],
  ["Guns", "mainHand"],
  ["Helmets", "headgear"],
  ["Maces", "mainHand"],
  ["Polearms", "mainHand"],
  ["Relics", "backAccessory"],
  ["Rings", "eyewear"],
  ["Spellblades", "mainHand"],
  ["Staves", "mainHand"],
  ["Swords", "mainHand"],
  ["Throwing Weapon", "mainHand"],
  ["Wands", "mainHand"]
]);

const SKIPPED_PAGES = new Set(["Keys", "Materials", "Potions", "Socketables", "Consumables", "Collectibles"]);

async function main() {
  await mkdir(PUBLIC_IMAGE_DIR, { recursive: true });
  const categoryPages = await getItemCategoryPages();
  const categories = [];
  const items = [];

  for (const page of categoryPages) {
    if (SKIPPED_PAGES.has(page.title)) {
      continue;
    }
    const categoryItems = await getCategoryItems(page);
    if (!categoryItems.length) {
      continue;
    }
    categories.push({
      id: slugify(page.title),
      label: page.title,
      slot: PAGE_SLOT_MAP.get(page.title) || "mainHand",
      sourcePage: page.title
    });
    items.push(...categoryItems);
    console.log(`${page.title}: ${categoryItems.length}`);
  }

  await writeFile(
    OUTPUT_JSON,
    `${JSON.stringify({ categories, generatedAt: new Date().toISOString(), items }, null, 2)}\n`,
    "utf8"
  );

  console.log(`Wrote ${items.length} items to ${OUTPUT_JSON}`);
}

async function getItemCategoryPages() {
  const html = await fetchParsedHtml(ITEM_INDEX_PAGE);
  const pages = [];
  const matches = html.matchAll(/<div class="class-item">[\s\S]*?<a href="\/wiki\/([^"]+)" title="([^"]+)">([^<]+)<\/a>[\s\S]*?<\/div>/g);
  for (const match of matches) {
    const title = decodeHtml(match[3]).trim();
    if (!title || pages.some((page) => page.title === title)) {
      continue;
    }
    pages.push({ pageName: decodeURIComponent(match[1]), title });
  }
  return pages;
}

async function getCategoryItems(page) {
  const html = await fetchParsedHtml(page.pageName);
  const slot = PAGE_SLOT_MAP.get(page.title) || "mainHand";
  const items = [];
  let currentTierGroup = "Items";
  const tokenPattern = /<h2[\s\S]*?<\/h2>|<table class="wikitable sortable"[\s\S]*?<\/table>/g;
  for (const tokenMatch of html.matchAll(tokenPattern)) {
    const token = tokenMatch[0];
    if (token.startsWith("<h2")) {
      currentTierGroup = cleanHtml(token).replace(/\[edit.*$/i, "").trim() || currentTierGroup;
      continue;
    }
    const rows = token.match(/<tr[\s\S]*?<\/tr>/g) || [];
    for (const row of rows.slice(1)) {
      const item = await parseItemRow(row, page.title, currentTierGroup, slot);
      if (item) {
        items.push(item);
      }
    }
  }
  return items;
}

async function parseItemRow(row, category, tierGroup, slot) {
  const cells = [...row.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)].map((match) => match[1]);
  if (cells.length < 2) {
    return null;
  }

  const firstCell = cells[0];
  const nameMatch = firstCell.match(/<a href="\/wiki\/[^"]+" title="[^"]+">([\s\S]*?)<\/a>/);
  const imageMatch = firstCell.match(/<img\b[^>]*\bsrc="([^"]+)"[^>]*>/);
  const name = cleanHtml(nameMatch?.[1] || firstCell);
  if (!name) {
    return null;
  }

  const imagePath = imageMatch ? await downloadImage(imageMatch[1]) : null;
  const imageWidth = getNumericAttribute(imageMatch?.[0] || "", "data-file-width") || getNumericAttribute(imageMatch?.[0] || "", "width");
  const imageHeight = getNumericAttribute(imageMatch?.[0] || "", "data-file-height") || getNumericAttribute(imageMatch?.[0] || "", "height");
  const stats = [...(cells.at(-1) || "").matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)].map((match) => cleanHtml(match[1])).filter(Boolean);
  const numericCells = cells.slice(1, -1).map((cell) => cleanHtml(cell));

  return {
    aps: numericCells[3] || "",
    category,
    damage: numericCells[2] || "",
    dps: numericCells[4] || "",
    id: slugify(`${category}-${name}`),
    imageHeight,
    imagePath,
    imageWidth,
    level: numericCells[1] || "",
    name,
    slot,
    stats,
    tier: numericCells[0] || "",
    tierGroup
  };
}

async function downloadImage(src) {
  const rawPath = src.split("?")[0];
  const rawName = decodeURIComponent(rawPath.split("/").pop() || "item.png");
  const fileName = sanitizeFileName(rawName);
  const outputPath = join(PUBLIC_IMAGE_DIR, fileName);
  if (!existsSync(outputPath)) {
    const url = src.startsWith("http") ? src : `${WIKI_ORIGIN}${src}`;
    const data = await fetchBuffer(url);
    await writeFile(outputPath, data);
  }
  return `${PUBLIC_IMAGE_PATH}/${fileName}`;
}

async function fetchParsedHtml(pageName) {
  const url = `${WIKI_ORIGIN}/api.php?action=parse&page=${encodeURIComponent(pageName)}&prop=text&format=json`;
  const json = JSON.parse(await fetchText(url));
  if (json.error) {
    throw new Error(`Wiki API error for ${pageName}: ${json.error.info || json.error.code}`);
  }
  return json.parse.text["*"];
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: REQUEST_HEADERS }, (response) => {
      if (!response.statusCode || response.statusCode >= 400) {
        reject(new Error(`HTTP ${response.statusCode} for ${url}`));
        response.resume();
        return;
      }
      response.setEncoding("utf8");
      let body = "";
      response.on("data", (chunk) => {
        body += chunk;
      });
      response.on("end", () => resolve(body));
    }).on("error", reject);
  });
}

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: REQUEST_HEADERS }, (response) => {
      if (!response.statusCode || response.statusCode >= 400) {
        reject(new Error(`HTTP ${response.statusCode} for ${url}`));
        response.resume();
        return;
      }
      const chunks = [];
      response.on("data", (chunk) => {
        chunks.push(chunk);
      });
      response.on("end", () => resolve(Buffer.concat(chunks)));
    }).on("error", reject);
  });
}

function cleanHtml(value) {
  return decodeHtml(value)
    .replace(/<span style="display:none;">[\s\S]*?<\/span>/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeHtml(value) {
  return value
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_match, code) => String.fromCharCode(Number(code)));
}

function getNumericAttribute(html, name) {
  const match = html.match(new RegExp(`${name}="(\\d+)"`));
  return match ? Number(match[1]) : null;
}

function sanitizeFileName(value) {
  return value.replace(/[<>:"/\\|?*]/g, "_");
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
