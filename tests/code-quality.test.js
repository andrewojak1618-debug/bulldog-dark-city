import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { basename, dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { parseAst } from "rollup/parseAst";

const PROJECT_ROOT = fileURLToPath(new URL("../", import.meta.url));
const SOURCE_DIRECTORIES = Object.freeze(["classes", "js", "styles"]);
const ROOT_SOURCE_FILES = Object.freeze([
  "script.js",
  "index.html",
  "impressum.html",
]);
const CODE_EXTENSIONS = new Set([".js", ".css"]);
const MAXIMUM_LINES_PER_FILE = 400;
const MAXIMUM_LINES_PER_FUNCTION = 14;
const APPLICATION_ENTRY = join(PROJECT_ROOT, "script.js");
const FUNCTION_TYPES = new Set([
  "FunctionDeclaration",
  "FunctionExpression",
  "ArrowFunctionExpression",
]);

/**
 * Collects code files.
 */
async function collectCodeFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(entries.map((entry) =>
    collectEntryFiles(directory, entry)
  ));
  return nestedFiles.flat();
}

/**
 * Collects entry files.
 */
async function collectEntryFiles(directory, entry) {
  const path = join(directory, entry.name);
  if (entry.isDirectory()) return collectCodeFiles(path);
  return CODE_EXTENSIONS.has(extname(entry.name)) ? [path] : [];
}

/**
 * Reads production files.
 */
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

/**
 * Collects named imports.
 * @param {string} content - The source content to process.
 * @returns {Set<string>} The resulting string value.
 */
function collectNamedImports(content) {
  const imports = new Set();
  const pattern = /import\s*\{([^}]*)\}\s*from/gs;
  for (const match of content.matchAll(pattern)) {
    match[1].split(",").forEach((entry) => {
      const localName = entry.trim().split(/\s+as\s+/).at(-1);
      if (localName) imports.add(localName);
    });
  }
  return imports;
}

/**
 * Removes java script comments.
 * @param {string} content - The source content to process.
 * @returns {string} The resulting string value.
 */
function removeJavaScriptComments(content) {
  return content.replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "");
}

/**
 * Finds missing architecture imports.
 * @param {string} content - The source content to process.
 * @returns {string[]} The resulting string value.
 */
function findMissingArchitectureImports(content) {
  const executableContent = removeJavaScriptComments(content);
  const references = new Set(
    [...executableContent.matchAll(
      /\b([A-Z][A-Za-z0-9]*(?:System|Controller))\s*\./g,
    )]
      .map((match) => match[1]),
  );
  const imports = collectNamedImports(content);
  return [...references].filter((name) => {
    const declaration = new RegExp(
      `\\b(?:class|function|const|let|var)\\s+${name}\\b`,
    );
    return !imports.has(name) && !declaration.test(executableContent);
  });
}

/**
 * Collects local module paths.
 * @param {string} path - The target file or module path.
 * @param {string} content - The source content to process.
 * @returns {string[]} The resulting string value.
 */
function collectLocalModulePaths(path, content) {
  const pattern = /(?:import|export)\s+(?:[\s\S]*?\s+from\s+)?["'](\.[^"']+)["']/g;
  return [...content.matchAll(pattern)].map((match) =>
    resolve(dirname(path), match[1]));
}

/**
 * Collects reachable modules.
 * @param {Map<string, string>} modules - The modules value.
 * @returns {Set<string>} The resulting string value.
 */
function collectReachableModules(modules) {
  const reachable = new Set();
  const visit = (path) => {
    if (reachable.has(path) || !modules.has(path)) return;
    reachable.add(path);
    collectLocalModulePaths(path, modules.get(path)).forEach(visit);
  };
  visit(APPLICATION_ENTRY);
  return reachable;
}

/**
 * Walks an abstract syntax tree.
 * @param {object} node - The current syntax node.
 * @param {Function} visit - The visitor callback.
 * @returns {void} No value is returned.
 */
function walkSyntaxTree(node, visit) {
  if (!node || typeof node !== "object") return;
  if (FUNCTION_TYPES.has(node.type)) visit(node);
  Object.entries(node).forEach(([key, value]) => {
    if (["start", "end", "loc"].includes(key)) return;
    if (Array.isArray(value)) value.forEach((child) =>
      walkSyntaxTree(child, visit));
    else if (value?.type) walkSyntaxTree(value, visit);
  });
}

/**
 * Counts meaningful source lines in one function.
 * @param {string} source - The function source.
 * @returns {number} The meaningful line count.
 */
function countFunctionLines(source) {
  return source.split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !/^[\[\]{}(),;]+$/.test(line))
    .length;
}

/**
 * Finds functions that exceed the project guideline.
 * @param {string} path - The source file path.
 * @param {string} content - The source content.
 * @returns {object[]} The function-length violations.
 */
function findLongFunctions(path, content) {
  const violations = [];
  walkSyntaxTree(parseAst(content), (node) => {
    const source = content.slice(node.start, node.end);
    const lineCount = countFunctionLines(source);
    const isHtmlTemplate = /`[\s\S]*<[^>]+>/.test(source);
    if (lineCount > MAXIMUM_LINES_PER_FUNCTION && !isHtmlTemplate) {
      violations.push({ file: path.replace(PROJECT_ROOT, ""), lineCount });
    }
  });
  return violations;
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

test("Produktionsfunktionen bleiben innerhalb der 14-Zeilen-Regel", async () => {
  const files = await readProductionFiles();
  const javascriptFiles = files.filter(({ path }) => extname(path) === ".js");
  const configPath = join(PROJECT_ROOT, "vite.config.js");
  javascriptFiles.push({ path: configPath,
    content: await readFile(configPath, "utf8") });
  const violations = javascriptFiles.flatMap(({ path, content }) =>
    findLongFunctions(path, content)
  );

  assert.deepEqual(violations, []);
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

test("verwendete Systeme und Controller sind lokal importiert", async () => {
  const files = await readProductionFiles();
  const violations = files.flatMap(({ path, content }) => {
    if (extname(path) !== ".js") return [];
    return findMissingArchitectureImports(content).map((name) => ({
      file: path.replace(PROJECT_ROOT, ""),
      name,
    }));
  });

  assert.deepEqual(violations, []);
});

test("Produktionsmodule sind vom Anwendungseinstieg erreichbar", async () => {
  const files = await readProductionFiles();
  const modules = new Map(files
    .filter(({ path }) => extname(path) === ".js")
    .map(({ path, content }) => [resolve(path), content]));
  const reachable = collectReachableModules(modules);
  const violations = [...modules.keys()]
    .filter((path) => !reachable.has(path))
    .map((path) => path.replace(PROJECT_ROOT, ""));

  assert.deepEqual(violations, []);
});
