import assert from "node:assert/strict";
import test from "node:test";
import {
  GAME_DIMENSIONS,
  RENDER_SETTINGS,
  getTextRenderResolution,
} from "../js/config/game-settings.js";

test("logical game coordinates remain 720 by 480", () => {
  assert.deepEqual(GAME_DIMENSIONS, { width: 720, height: 480 });
});

test("text resolution follows DPR but never exceeds the performance cap", () => {
  assert.equal(getTextRenderResolution(1), 1);
  assert.equal(getTextRenderResolution(1.5), 1.5);
  assert.equal(getTextRenderResolution(3), RENDER_SETTINGS.maxTextResolution);
  assert.equal(getTextRenderResolution(Number.NaN), 1);
});
