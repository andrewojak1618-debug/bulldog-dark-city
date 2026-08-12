import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  MENU_LAYOUT,
  TOUCH_MENU_LAYOUT,
  getMenuLayout,
} from "../js/config/menu-layout.js";

const GAME_CSS = readFileSync(
  new URL("../styles/game.css", import.meta.url),
  "utf8",
);
const RESPONSIVE_CSS = readFileSync(
  new URL("../styles/responsive.css", import.meta.url),
  "utf8",
);

test("Desktopmenü behält seine bisherige Anordnung", () => {
  assert.equal(getMenuLayout(false), MENU_LAYOUT);
  assert.equal(MENU_LAYOUT.mainMenu.buttonWidth, 176);
  assert.equal(MENU_LAYOUT.mainMenu.buttonHeight, 38);
});

test("Touchmenü verwendet mindestens 16 CSS-Pixel große Texte", () => {
  const smallestLandscapeScale = 320 / 480;
  const effectiveFontSize = TOUCH_MENU_LAYOUT.mainMenu.fontSize
    .replace("px", "") * smallestLandscapeScale;

  assert.equal(getMenuLayout(true), TOUCH_MENU_LAYOUT);
  assert.ok(effectiveFontSize >= 16);
  assert.ok(TOUCH_MENU_LAYOUT.version.fontSize * smallestLandscapeScale >= 16);
  assert.ok(TOUCH_MENU_LAYOUT.inputHint.fontSize * smallestLandscapeScale >= 16);
  assert.ok(
    TOUCH_MENU_LAYOUT.unavailableLabel.fontSize * smallestLandscapeScale >= 16,
  );
});

test("Touchmenü bietet mindestens 44 CSS-Pixel große Bedienflächen", () => {
  const smallestLandscapeScale = 320 / 480;
  const mainMenuHitSize = TOUCH_MENU_LAYOUT.mainMenu.hitHeight *
    smallestLandscapeScale;

  assert.ok(mainMenuHitSize >= 44);
});

test("Touchhinweis bleibt drei Sekunden sichtbar", () => {
  assert.equal(TOUCH_MENU_LAYOUT.inputHint.popupDurationMs, 3000);
  assert.ok(TOUCH_MENU_LAYOUT.inputHint.fadeDurationMs > 0);
});

test("iPad-Mini-Menüelemente erfüllen Größe und gemeinsame Ausrichtung", () => {
  assert.match(
    GAME_CSS,
    /body\.is-touch-layout \.mute-toggle,[\s\S]*?width: 44px;[\s\S]*?height: 44px;/,
  );
  assert.match(
    GAME_CSS,
    /body\.is-touch-layout \.github-profile-link \{[\s\S]*?right: 22px;/,
  );
  assert.match(
    GAME_CSS,
    /body\.is-touch-layout \.github-profile-link::before \{[\s\S]*?font-size: 16px;/,
  );
  assert.match(
    GAME_CSS,
    /body\.is-touch-layout \.legal-navigation-link \{[\s\S]*?min-height: 44px;/,
  );
  assert.match(GAME_CSS, /\.legal-navigation-link \{[\s\S]*?font-size: 16px;/);
});

test("iPad Mini erhält ein deutlich größeres Tablet-UI-Profil", () => {
  assert.match(
    GAME_CSS,
    /@media \(min-width: 960px\) and \(min-height: 600px\)/,
  );
  assert.match(
    GAME_CSS,
    /body\.is-touch-layout \.mute-toggle,[\s\S]*?width: 56px;[\s\S]*?height: 56px;/,
  );
  assert.match(
    GAME_CSS,
    /body\.is-touch-layout \.github-profile-link::before \{[\s\S]*?font-size: 20px;/,
  );
  assert.match(
    GAME_CSS,
    /body\.is-touch-layout \.legal-navigation-link \{[\s\S]*?font-size: 20px;/,
  );
});

test("iPad Pro erhält ein eigenständiges Large-Tablet-Profil", () => {
  assert.match(
    GAME_CSS,
    /@media \(min-width: 1280px\) and \(min-height: 800px\)/,
  );
  assert.match(
    GAME_CSS,
    /body\.is-touch-layout \.mute-toggle,[\s\S]*?width: 68px;[\s\S]*?height: 68px;/,
  );
  assert.match(
    GAME_CSS,
    /body\.is-touch-layout \.github-profile-link::before \{[\s\S]*?font-size: 24px;/,
  );
  assert.match(
    GAME_CSS,
    /body\.is-touch-layout \.legal-navigation-link \{[\s\S]*?font-size: 24px;/,
  );
});

test("4K-Touchmenü skaliert externe Aktionen wie das Phaser-Canvas", () => {
  assert.match(
    RESPONSIVE_CSS,
    /@media \(min-width: 1920px\) and \(min-height: 1080px\)/,
  );
  assert.match(
    RESPONSIVE_CSS,
    /body\.is-touch-layout \.mute-toggle,[\s\S]*?width: min\(6\.1111vw, 9\.1667svh\);/,
  );
  assert.match(
    RESPONSIVE_CSS,
    /body\.is-touch-layout \.github-profile-link::before \{[\s\S]*?font-size: min\(2\.2222vw, 3\.3333svh\);/,
  );
  assert.match(
    RESPONSIVE_CSS,
    /body\.is-touch-layout \.legal-navigation-link \{[\s\S]*?font-size: min\(3\.3333vw, 5svh\);/,
  );
  assert.match(
    RESPONSIVE_CSS,
    /body\.is-touch-layout \.site-footer \{[\s\S]*?transform: translate\(58px, -50%\);/,
  );
});

test("4K-Desktop skaliert Canvas und externe Menüelemente gemeinsam", () => {
  assert.match(
    RESPONSIVE_CSS,
    /body:not\(\.is-touch-layout\) #game \{[\s\S]*?width: min\(84\.375vw, 150svh, 2160px\);/,
  );
  assert.match(
    RESPONSIVE_CSS,
    /body:not\(\.is-touch-layout\) \.mute-toggle \{[\s\S]*?width: min\(2\.5781vw, 4\.5833svh, 66px\);/,
  );
  assert.match(
    RESPONSIVE_CSS,
    /body:not\(\.is-touch-layout\) \.legal-navigation-link \{[\s\S]*?font-size: min\(1\.1719vw, 2\.0833svh, 30px\);/,
  );
});
