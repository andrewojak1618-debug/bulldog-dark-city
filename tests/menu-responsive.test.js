import assert from "node:assert/strict";
import test from "node:test";
import {
  MENU_LAYOUT,
  TOUCH_MENU_LAYOUT,
  getMenuLayout,
} from "../js/config/menu-layout.js";

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
