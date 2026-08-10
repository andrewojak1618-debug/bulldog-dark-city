import assert from "node:assert/strict";
import test from "node:test";
import {
  ENDSCREEN_RESULT,
  GAME_ENDSCREEN,
  resolveEndscreenResult,
} from "../js/config/game-endscreen-settings.js";

test("Endscreen stellt Niederlage und Sieg als Varianten bereit", () => {
  assert.ok(GAME_ENDSCREEN.variants[ENDSCREEN_RESULT.gameOver]);
  assert.ok(GAME_ENDSCREEN.variants[ENDSCREEN_RESULT.victory]);
});

test("Unbekannte Abschlusswerte fallen sicher auf Game Over zurück", () => {
  assert.equal(
    resolveEndscreenResult("unbekannt"),
    ENDSCREEN_RESULT.gameOver,
  );
  assert.equal(
    resolveEndscreenResult(ENDSCREEN_RESULT.victory),
    ENDSCREEN_RESULT.victory,
  );
});

test("Endscreen-Texte halten die minimale Schriftgröße ein", () => {
  const fontSizes = [
    GAME_ENDSCREEN.title.fontSize,
    GAME_ENDSCREEN.message.fontSize,
    Number.parseInt(GAME_ENDSCREEN.buttons.fontSize, 10),
    GAME_ENDSCREEN.hint.fontSize,
  ];
  assert.ok(fontSizes.every((fontSize) => fontSize >= 16));
});
