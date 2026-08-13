import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const PROJECT_ROOT = fileURLToPath(new URL("../", import.meta.url));
const JAVASCRIPT_DIRECTORIES = Object.freeze(["classes", "js", "tests"]);
const ROOT_JAVASCRIPT_FILES = Object.freeze(["script.js", "vite.config.js"]);
const GERMAN_JSDOC_PATTERN = new RegExp(
  "[ÄÖÜäöüß]|\\b(?:erstellt|prüft|aktualisiert|steuert|lädt|zeigt|gibt|" +
    "setzt|entfernt|berechnet|verarbeitet|bindet|fügt|erkennt|meldet|" +
    "startet|stoppt|spielt|zeichnet|bewegt|verbindet|übernimmt|liefert|" +
    "schützt|erlaubt|verwirft|öffnet|schließt|für|zur|zum)\\b",
  "i",
);

/**
 * Collects JavaScript files recursively.
 * @param {string} directory - The directory to scan.
 * @returns {Promise<string[]>} The resulting collection.
 */
async function collectJavaScriptFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return collectJavaScriptFiles(path);
    return extname(entry.name) === ".js" ? [path] : [];
  }));
  return nestedFiles.flat();
}

/**
 * Extracts every JSDoc block from source content.
 * @param {string} content - The source content to process.
 * @returns {string[]} The resulting collection.
 */
function extractJsdocBlocks(content) {
  return [...content.matchAll(/\/\*\*[\s\S]*?\*\//g)]
    .map((match) => match[0]);
}

test("all project JSDoc comments are written in English", async () => {
  const paths = [
    ...(await Promise.all(JAVASCRIPT_DIRECTORIES.map((directory) =>
      collectJavaScriptFiles(join(PROJECT_ROOT, directory))
    ))).flat(),
    ...ROOT_JAVASCRIPT_FILES.map((fileName) => join(PROJECT_ROOT, fileName)),
  ];
  const violations = [];

  for (const path of paths) {
    const content = await readFile(path, "utf8");
    extractJsdocBlocks(content).forEach((block) => {
      if (GERMAN_JSDOC_PATTERN.test(block)) {
        violations.push(path.replace(PROJECT_ROOT, ""));
      }
    });
  }

  assert.deepEqual([...new Set(violations)], []);
});
