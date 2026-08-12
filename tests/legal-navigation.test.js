import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readProjectFile = (fileName) =>
  readFile(new URL(`../${fileName}`, import.meta.url), "utf8");

test("Startbereich verlinkt das Impressum semantisch", async () => {
  const html = await readProjectFile("index.html");

  assert.match(html, /<footer[^>]*aria-label="Rechtliche Navigation"/);
  assert.match(html, /href="\.\/impressum\.html"[^>]*>Impressum<\/a>/);
  assert.match(html, /id="menu-legal-navigation"/);
  assert.match(html, /aria-hidden="true"/);
  assert.match(html, /href="\.\/impressum\.html"[^>]*tabindex="-1"/s);
});

test("Impressum wird ausschließlich mit dem Hauptmenü freigeschaltet", async () => {
  const menuScene = await readProjectFile(
    "classes/core/scenes/menu-scene.class.js",
  );
  const controller = await readProjectFile(
    "classes/core/controllers/menu-legal-navigation-controller.js",
  );

  assert.match(menuScene, /setMenuLegalNavigationVisibility\(isVisible\)/);
  assert.match(controller, /site-footer--visible/);
  assert.match(controller, /link\.tabIndex = isVisible \? 0 : -1/);
});

test("GitHub-Link startet unsichtbar und außerhalb der Tastaturreihenfolge", async () => {
  const html = await readProjectFile("index.html");

  assert.match(html, /id="github-profile-link"/);
  assert.match(html, /github-profile-link--hidden/);
  assert.match(html, /id="github-profile-link"[\s\S]*?aria-hidden="true"/);
  assert.match(html, /id="github-profile-link"[\s\S]*?tabindex="-1"/);
});

test("GitHub-Link koppelt Sichtbarkeit, ARIA und Tastaturzugriff", async () => {
  const controller = await readProjectFile(
    "classes/core/controllers/menu-social-link-controller.js",
  );

  assert.match(controller, /github-profile-link--hidden/);
  assert.match(controller, /setAttribute\("aria-hidden", String\(isHidden\)\)/);
  assert.match(controller, /link\.tabIndex = isHidden \? -1 : 0/);
  assert.match(controller, /if \(isHidden\) link\.blur\(\)/);
});

test("Menüdialoge schalten alle externen Menüaktionen gemeinsam ab", async () => {
  const menuScene = await readProjectFile(
    "classes/core/scenes/menu-scene.class.js",
  );

  assert.match(
    menuScene,
    /\(isOpen\) => this\.setExternalMenuControlsVisibility\(!isOpen\)/,
  );
  assert.match(menuScene, /setMuteButtonVisibility\(isVisible\)/);
  assert.match(menuScene, /setMenuSocialLinkVisibility\(isVisible\)/);
  assert.match(menuScene, /setMenuLegalNavigationVisibility\(isVisible\)/);
});

test("Mute-Button bleibt als einzige externe Levelaktion bedienbar", async () => {
  const [levelOne, levelTwo, levelThree] = await Promise.all([
    readProjectFile("classes/core/scenes/level-one-scene.class.js"),
    readProjectFile("classes/core/scenes/level-two-scene.class.js"),
    readProjectFile("classes/core/scenes/level-three-scene.class.js"),
  ]);

  assert.match(levelOne, /setMuteButtonGameMode\(true\)/);
  assert.match(levelOne, /setMuteButtonVisibility\(true\)/);
  assert.match(levelTwo, /setMuteButtonGameMode\(true\)/);
  assert.match(levelThree, /setMuteButtonGameMode\(true\)/);
  [levelOne, levelTwo, levelThree].forEach((scene) => {
    assert.doesNotMatch(scene, /setMenuSocialLinkVisibility\(true\)/);
    assert.doesNotMatch(scene, /setMenuLegalNavigationVisibility\(true\)/);
  });
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

test("Impressum erklärt die gespeicherten Audio- und Anzeigeeinstellungen", async () => {
  const html = await readProjectFile("impressum.html");

  assert.match(html, /bulldog-dark-city\.audio-muted/);
  assert.match(html, /bulldog-dark-city\.display-mode/);
  assert.match(html, /LocalStorage/);
  assert.match(html, /true<\/code> oder <code>false/);
  assert.match(html, /standard<\/code> oder <code>oled/);
});

test("Impressum ist eigener Einstieg im FTP-Build", async () => {
  const viteConfig = await readProjectFile("vite.config.js");

  assert.match(viteConfig, /impressum:\s*resolve\("impressum\.html"\)/);
});

test("Impressum bietet tastaturerreichbare Rückwege zum Hauptmenü", async () => {
  const html = await readProjectFile("impressum.html");

  assert.match(html, /class="legal-back-link" href="\.\/index\.html"/);
  assert.doesNotMatch(html, /legal-back-link[^>]*tabindex="-1"/);
});
