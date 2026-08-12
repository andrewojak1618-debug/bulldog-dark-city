import assert from "node:assert/strict";
import test from "node:test";
import { PLAYER_GUIDE } from "../js/config/player-guide-settings.js";

const getActions = (section) => section.controls.map(({ action }) => action);

test("Spielerklärung enthält alle zentralen Desktopaktionen", () => {
  const actions = getActions(PLAYER_GUIDE.desktop);
  assert.equal(actions.length, 6);
  assert.ok(actions.some((action) => action.includes("Laufen")));
  assert.ok(actions.some((action) => action.includes("Springen")));
  assert.ok(actions.some((action) => action.includes("Angreifen")));
  assert.ok(actions.some((action) => action.includes("Mutation")));
});

test("Desktop-Erklärung entspricht der ergonomischen Tastaturbelegung", () => {
  const controls = PLAYER_GUIDE.desktop.controls;

  assert.ok(controls.some(({ input, action }) =>
    input === "F / J / Linksklick" && action === "Angreifen"
  ));
  assert.ok(controls.some(({ input, action }) =>
    input === "M" && action.includes("Mutation")
  ));
  assert.ok(controls.some(({ input, action }) =>
    input === "K / L" && action.includes("Wurfknochen")
  ));
});

test("Touch-Erklärung nennt Mutation und beide Wurfknochen", () => {
  const controls = PLAYER_GUIDE.touch.controls;
  assert.ok(controls.some(({ input }) => input === "M"));
  assert.ok(controls.some(({ input }) => input === "K / L"));
});

test("Optionsdialog besitzt Spielziel und persistenten Tonbereich", () => {
  assert.match(PLAYER_GUIDE.goal.text, /Dark City/);
  assert.equal(PLAYER_GUIDE.audio.enabledLabel, "TON: AN");
  assert.equal(PLAYER_GUIDE.audio.mutedLabel, "TON: AUS");
});

test("Optionsabschnitte halten acht Pixel Abstand zum Inhalt", () => {
  assert.equal(PLAYER_GUIDE.contentLayout.headingContentGap, 8);
});

test("Alle Schriftgrößen der Optionsansicht sind mindestens 16 Pixel", () => {
  const fontSizes = [
    PLAYER_GUIDE.style.titleFontSize,
    PLAYER_GUIDE.style.headingFontSize,
    PLAYER_GUIDE.style.bodyFontSize,
    PLAYER_GUIDE.style.listFontSize,
    PLAYER_GUIDE.style.bulletFontSize,
    PLAYER_GUIDE.style.actionFontSize,
  ];
  assert.ok(fontSizes.every((fontSize) => fontSize >= 16));
});

test("Optionspositionen und Scrollwerte sind zentral konfiguriert", () => {
  assert.equal(PLAYER_GUIDE.dialog.bodyWidth, 540);
  assert.ok(PLAYER_GUIDE.scroll.contentHeight > 0);
  assert.ok(PLAYER_GUIDE.scroll.interactionAlpha > 0);
});
