import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { MenuInputController } from
  "../classes/input/menu-input-controller.class.js";
import { MENU_BUTTONS } from "../js/config/menu-buttons.js";
import { QUICK_ACTIONS } from "../js/config/quick-actions.js";

/** Erstellt einen minimalen Menübutton für Navigationstests. */
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

test("unfertige Hauptmenüpunkte bleiben eindeutig deaktiviert", () => {
  const unavailableActions = MENU_BUTTONS
    .filter(({ disabled }) => disabled)
    .map(({ action }) => action);

  assert.deepEqual(unavailableActions, ["upgrades", "extras"]);
});

test("Hauptmenü zeigt keine funktionslose Beenden-Aktion", () => {
  assert.equal(
    MENU_BUTTONS.some(({ action }) => action === "exit"),
    false,
  );
});

test("Schnellzugriffe zeigen keine redundante Optionen-Aktion", () => {
  const enabledActions = QUICK_ACTIONS
    .filter(({ disabled }) => !disabled)
    .map(({ action }) => action);
  const disabledActions = QUICK_ACTIONS.filter(({ disabled }) => disabled);

  assert.deepEqual(enabledActions, []);
  assert.equal(
    QUICK_ACTIONS.some(({ action }) => action === "options"),
    false,
  );
  assert.deepEqual(
    disabledActions.map(({ action }) => action),
    ["achievements", "statistics"],
  );
  disabledActions.forEach(({ unavailableLabel }) =>
    assert.equal(unavailableLabel, "BALD")
  );
});

test("Tastaturnavigation überspringt deaktivierte Menüpunkte", () => {
  const buttons = [
    createButton(false),
    createButton(true),
    createButton(false),
  ];
  const scene = { input: { keyboard: null, gamepad: null } };
  const controller = new MenuInputController(scene, buttons);

  controller.moveSelection(1);
  controller.activateCurrent();

  assert.equal(controller.activeIndex, 2);
  assert.equal(buttons[1].activationCount, 0);
  assert.equal(buttons[2].activationCount, 1);
});

test("sichtbare externe Links öffnen ausschließlich abgesichert", async () => {
  const pages = await Promise.all(
    ["index.html", "impressum.html"].map((fileName) =>
      readFile(new URL(`../${fileName}`, import.meta.url), "utf8")
    ),
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

test("Hauptmenü verlinkt das echte GitHub-Profil mit Icon", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

  assert.match(
    html,
    /href="https:\/\/github\.com\/andrewojak1618-debug"/i,
  );
  assert.match(html, /src="\/img\/ui\/menu\/social\/github\.png"/i);
  assert.match(html, /id="github-profile-link"/i);
});
