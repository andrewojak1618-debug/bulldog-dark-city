import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { MenuInputController } from
  "../classes/input/menu-input-controller.class.js";
import { MENU_BUTTONS } from "../js/config/menu-buttons.js";

/**
 * Creates button.
 */
function createButton(disabled = false) {
  return {
    isDisabled: disabled,
    isSelected: false,
    activationCount: 0,
    setSelected(selected) {
      this.isSelected = selected;
    },
    activate() {
      this.activationCount += 1;
    },
  };
}

test("Upgrades and Extras open explanatory menu actions", async () => {
  const source = await readFile(new URL(
    "../classes/core/controllers/menu-navigation-controller.class.js",
    import.meta.url,
  ), "utf8");
  assert.deepEqual(MENU_BUTTONS.map(({ action }) => action), [
    "start", "options", "upgrades", "extras",
  ]);
  assert.match(source, /openLockedFeatureDialog\("upgrades"\)/);
  assert.match(source, /openLockedFeatureDialog\("extras"\)/);
});

test("Main menu has no nonfunctional exit action", () => {
  assert.equal(MENU_BUTTONS.some(({ action }) => action === "exit"), false);
});

test("Main menu contains no visible BALD placeholders", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.doesNotMatch(html, />\s*BALD\s*</i);
});

test("Keyboard navigation skips disabled adapters", () => {
  const buttons = [createButton(false), createButton(true), createButton(false)];
  const scene = { input: { keyboard: null, gamepad: null } };
  const controller = new MenuInputController(scene, buttons);
  controller.moveSelection(1);
  controller.activateCurrent();
  assert.equal(controller.activeIndex, 2);
  assert.equal(buttons[1].activationCount, 0);
  assert.equal(buttons[2].activationCount, 1);
});

test("External links open only with safe new-tab protection", async () => {
  const pages = await Promise.all(
    ["index.html", "impressum.html"].map((fileName) =>
      readFile(new URL(`../${fileName}`, import.meta.url), "utf8")),
  );
  pages.forEach((html) => {
    const links = html.match(/<a\b[^>]*href="https?:\/\/[^>]+>/gi) ?? [];
    links.forEach((link) => {
      assert.match(link, /target="_blank"/i);
      assert.match(link, /rel="[^"]*noopener[^"]*"/i);
      assert.match(link, /rel="[^"]*noreferrer[^"]*"/i);
    });
  });
});

test("Main menu links the real GitHub profile with visible HTML label", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /href="https:\/\/github\.com\/andrewojak1618-debug"/i);
  assert.match(html, /src="\/img\/ui\/menu\/social\/github\.png"/i);
  assert.match(html, /class="github-profile-link__label">GITHUB<\/span>/i);
});
