import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readProjectFile = (fileName) =>
  readFile(new URL(`../${fileName}`, import.meta.url), "utf8");

test("Startbereich verlinkt das Impressum semantisch", async () => {
  const html = await readProjectFile("index.html");

  assert.match(html, /<footer[^>]*aria-label="Rechtliche Navigation"/);
  assert.match(html, /href="\.\/impressum\.html"[^>]*>Impressum<\/a>/);
});

test("Impressum enthält reale Anbieter- und Kontaktangaben", async () => {
  const html = await readProjectFile("impressum.html");

  assert.match(html, /<h1>Impressum<\/h1>/);
  assert.match(html, /Andre Wojak/);
  assert.match(html, /Königsallee 12/);
  assert.match(html, /40212 Düsseldorf/);
  assert.match(html, /mailto:ai\.viralreelcreator@gmail\.com/);
  assert.doesNotMatch(html, /Muster(?:mann|straße)|PLATZHALTER|TODO/i);
});

test("Impressum erklärt die tatsächlich gespeicherte Audioeinstellung", async () => {
  const html = await readProjectFile("impressum.html");

  assert.match(html, /bulldog-dark-city\.audio-muted/);
  assert.match(html, /LocalStorage/);
  assert.match(html, /true<\/code> oder <code>false/);
});

test("Impressum ist eigener Einstieg im FTP-Build", async () => {
  const viteConfig = await readProjectFile("vite.config.js");

  assert.match(viteConfig, /impressum:\s*resolve\("impressum\.html"\)/);
});
