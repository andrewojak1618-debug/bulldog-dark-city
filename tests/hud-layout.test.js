import assert from "node:assert/strict";
import test from "node:test";
import { HUD } from "../js/config/hud-settings.js";
import { ROBOT_CAT_HEALTH_BAR } from "../js/config/robot-cat-settings.js";

test("Lebensanzeige ist gegenüber ihrer großen Variante 25 Prozent kleiner", () => {
  assert.equal(HUD.health.width, 154.6875);
  assert.ok(Math.abs(HUD.health.height - 31.55625) < 1e-9);
  assert.ok(Math.abs(HUD.health.fillWidth - 109.51875) < 1e-9);
  assert.equal(HUD.health.textStyle.fontSize, "10.125px");
});

test("Lebensanzeige behält linken Rand und Abstand zur Coin-Bar", () => {
  assert.equal(HUD.health.x, HUD.coin.x);
  assert.equal(HUD.coin.y - (HUD.health.y + HUD.health.height), 5);
});

test("Lebensanzeige bleibt vollständig links neben der Bossanzeige", () => {
  const healthRight = HUD.health.x + HUD.health.width;
  const bossLeft = ROBOT_CAT_HEALTH_BAR.x -
    ROBOT_CAT_HEALTH_BAR.width / 2;

  assert.ok(bossLeft - healthRight >= 40);
});

test("nachfolgende HUD-Zeilen behalten ihre vertikalen Abstände", () => {
  assert.equal(HUD.serum.y - (HUD.coin.y + HUD.coin.height), 5);
  assert.equal(HUD.mutationReady.y - HUD.serum.y, 4.6875);
});

test("Coin- und Serum-Anzeige sind vollständig um 25 Prozent vergrößert", () => {
  assert.equal(HUD.coin.width, 112.5);
  assert.equal(HUD.coin.height, 39);
  assert.equal(HUD.serum.width, 118.5);
  assert.equal(HUD.serum.height, 39);
  assert.equal(HUD.collectibleTextStyle.fontSize, "15px");
});

test("Mutationshinweis bleibt rechts neben der vergrößerten Serum-Bar", () => {
  const serumRight = HUD.serum.x + HUD.serum.width;
  assert.ok(Math.abs(HUD.mutationReady.x - serumRight - 5.2) < 1e-9);
});
