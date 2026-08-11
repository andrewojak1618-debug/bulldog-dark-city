import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const PROJECT_ROOT = fileURLToPath(new URL("../", import.meta.url));
const SOURCE_DIRECTORIES = Object.freeze(["classes", "js", "styles"]);
const ROOT_SOURCE_FILES = Object.freeze([
  "script.js",
  "index.html",
  "impressum.html",
]);
const CODE_EXTENSIONS = new Set([".js", ".css"]);
const MAXIMUM_LINES_PER_FILE = 400;

/** Sammelt relevante Code-Dateien rekursiv ein. */
async function collectCodeFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(entries.map((entry) =>
    collectEntryFiles(directory, entry)
  ));
  return nestedFiles.flat();
}

/** Liefert Dateien eines Verzeichniseintrags oder steigt rekursiv hinab. */
async function collectEntryFiles(directory, entry) {
  const path = join(directory, entry.name);
  if (entry.isDirectory()) return collectCodeFiles(path);
  return CODE_EXTENSIONS.has(extname(entry.name)) ? [path] : [];
}

/** Liest alle produktiven JavaScript- und CSS-Dateien ein. */
async function readProductionFiles() {
  const files = await Promise.all(SOURCE_DIRECTORIES.map((directory) =>
    collectCodeFiles(join(PROJECT_ROOT, directory))
  ));
  const paths = [
    ...files.flat(),
    ...ROOT_SOURCE_FILES.map((file) => join(PROJECT_ROOT, file)),
  ];
  return Promise.all(paths.map(async (path) => ({
    path,
    content: await readFile(path, "utf8"),
  })));
}

test("Produktionsdateien bleiben innerhalb der 400-Zeilen-Regel", async () => {
  const files = await readProductionFiles();
  const violations = files.filter(({ content }) =>
    content.replace(/\r?\n$/, "").split(/\r?\n/).length >
      MAXIMUM_LINES_PER_FILE
  );

  assert.deepEqual(
    violations.map(({ path }) => path.replace(PROJECT_ROOT, "")),
    [],
  );
});

test("Produktionscode enthält keine finalen Debug-Ausgaben", async () => {
  const files = await readProductionFiles();
  const debugPattern = /\bconsole\.(?:log|debug|info)\s*\(|\bdebugger\s*;/;
  const violations = files.filter(({ content }) => debugPattern.test(content));

  assert.deepEqual(
    violations.map(({ path }) => path.replace(PROJECT_ROOT, "")),
    [],
  );
});

test("Produktionsdateien verwenden konsistente Kebab-Case-Namen", async () => {
  const files = await readProductionFiles();
  const allowedRootFiles = new Set(ROOT_SOURCE_FILES);
  const namingPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\.class)?\.[a-z]+$/;
  const violations = files.filter(({ path }) => {
    const name = basename(path);
    return !allowedRootFiles.has(name) && !namingPattern.test(name);
  });

  assert.deepEqual(
    violations.map(({ path }) => path.replace(PROJECT_ROOT, "")),
    [],
  );
});

test("Produktionscode enthält keine Merge-Konfliktmarker", async () => {
  const files = await readProductionFiles();
  const conflictPattern = /^(?:<{7}|={7}|>{7})/m;
  const violations = files.filter(({ content }) =>
    conflictPattern.test(content)
  );

  assert.deepEqual(
    violations.map(({ path }) => path.replace(PROJECT_ROOT, "")),
    [],
  );
});
