import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { MENU_LAYOUT, TOUCH_MENU_LAYOUT, getMenuLayout } from
  "../js/config/menu-layout.js";

const GAME_CSS = readFileSync(new URL("../styles/game.css", import.meta.url), "utf8");
const RESPONSIVE_CSS = readFileSync(
  new URL("../styles/responsive.css", import.meta.url),
  "utf8",
);
const MENU_CSS = readFileSync(
  new URL("../styles/menu-interface.css", import.meta.url),
  "utf8",
);
const MENU_INTERFACE = readFileSync(
  new URL("../classes/ui/html-menu-interface.class.js", import.meta.url),
  "utf8",
);

test("Desktop menu keeps its established left-side arrangement", () => {
  assert.equal(getMenuLayout(false), MENU_LAYOUT);
  assert.match(MENU_CSS, /\.menu-interface__actions \{[\s\S]*?left: 4\.1667%;/);
  assert.match(MENU_CSS, /width: 24\.4444%;/);
});

test("Touch menu uses at least 16 CSS pixels for readable text", () => {
  assert.equal(getMenuLayout(true), TOUCH_MENU_LAYOUT);
  assert.match(MENU_CSS, /font-size: max\(16px, 3\.3333cqw\);/);
  assert.match(MENU_CSS, /font-size: max\(16px, 1\.3889cqw\);/);
});

test("Touch menu exposes thumb-friendly semantic button surfaces", () => {
  assert.match(MENU_CSS, /min-height: 9\.1667cqw;/);
  assert.match(MENU_CSS, /touch-action: manipulation;/);
});

test("Input hint gives way to the centered version after its device delay", () => {
  assert.match(MENU_INTERFACE, /keyboard: 5000/);
  assert.match(MENU_INTERFACE, /touch: 3000/);
  assert.match(MENU_INTERFACE, /version\.classList\.remove/);
  assert.match(MENU_CSS, /menu-interface__input-hint--hidden/);
  assert.match(MENU_CSS, /\.menu-interface__version \{[\s\S]*?left: 50%;/);
  assert.match(MENU_CSS, /menu-interface__version--hidden/);
});

test("iPad Mini menu actions meet size and alignment requirements", () => {
  assert.match(GAME_CSS, /body\.is-touch-layout \.mute-toggle,[\s\S]*?width: 44px;[\s\S]*?height: 44px;/);
  assert.match(GAME_CSS, /body\.is-touch-layout \.github-profile-link__label \{[\s\S]*?font-size: 16px;/);
  assert.match(GAME_CSS, /\.legal-navigation-link \{[\s\S]*?font-size: 16px;/);
});

test("iPad Mini receives a dedicated tablet UI profile", () => {
  assert.match(GAME_CSS, /@media \(min-width: 960px\) and \(min-height: 600px\)/);
  assert.match(GAME_CSS, /body\.is-touch-layout \.github-profile-link__label \{[\s\S]*?font-size: 20px;/);
  assert.match(GAME_CSS, /body\.is-touch-layout \.legal-navigation-link \{[\s\S]*?font-size: 20px;/);
});

test("iPad Pro receives a dedicated large-tablet UI profile", () => {
  assert.match(GAME_CSS, /@media \(min-width: 1280px\) and \(min-height: 800px\)/);
  assert.match(GAME_CSS, /body\.is-touch-layout \.github-profile-link__label \{[\s\S]*?font-size: 24px;/);
  assert.match(GAME_CSS, /body\.is-touch-layout \.legal-navigation-link \{[\s\S]*?font-size: 24px;/);
});

test("4K touch menu scales external actions with the canvas", () => {
  assert.match(RESPONSIVE_CSS, /@media \(min-width: 1920px\) and \(min-height: 1080px\)/);
  assert.match(RESPONSIVE_CSS, /body\.is-touch-layout \.github-profile-link__label \{[\s\S]*?font-size: min\(2\.2222vw, 3\.3333svh\);/);
  assert.match(RESPONSIVE_CSS, /body\.is-touch-layout \.site-footer \{[\s\S]*?right: calc\(/);
});

test("Impressum stays directly left of the GitHub action", () => {
  assert.match(GAME_CSS, /#game \{[\s\S]*?--menu-footer-bottom: 22px;/);
  assert.match(GAME_CSS, /\.site-footer \{[\s\S]*?right: 62px;[\s\S]*?bottom: var\(--menu-footer-bottom\);/);
  assert.match(GAME_CSS, /body\.is-touch-layout #game \{[\s\S]*?--menu-footer-bottom: 12px;/);
  assert.match(GAME_CSS, /body\.is-touch-layout \.site-footer \{[\s\S]*?right: 76px;[\s\S]*?bottom: var\(--menu-footer-bottom\);/);
  assert.match(GAME_CSS, /\.site-footer \{[\s\S]*?align-items: flex-end;/);
  assert.match(GAME_CSS, /\.legal-navigation-link \{[\s\S]*?line-height: 1;/);
  assert.match(GAME_CSS, /body\.is-touch-layout \.legal-navigation-link \{[\s\S]*?place-items: end center;/);
});

test("Centered version shares the legal navigation bottom edge", () => {
  assert.match(MENU_CSS, /\.menu-interface__version \{[\s\S]*?bottom: var\(--menu-footer-bottom\);[\s\S]*?left: 50%;[\s\S]*?line-height: 1;/);
  assert.match(RESPONSIVE_CSS, /body:not\(\.is-touch-layout\) #game \{[\s\S]*?--menu-footer-bottom: min\(3\.0556vw, 4\.5833svh, 44px\);/);
  assert.match(RESPONSIVE_CSS, /body\.is-touch-layout #game \{[\s\S]*?--menu-footer-bottom: min\(1\.6667vw, 2\.5svh\);/);
});

test("4K desktop scales canvas and external actions together", () => {
  assert.match(GAME_CSS, /width: min\([^;]*var\(--game-content-max-width\)\);/);
  assert.doesNotMatch(RESPONSIVE_CSS, /width: min\([^;]*2160px/);
  assert.match(RESPONSIVE_CSS, /body:not\(\.is-touch-layout\) \.mute-toggle \{[\s\S]*?width: min\(3\.0556vw, 4\.5833svh, 44px\);/);
});
