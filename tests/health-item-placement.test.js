import test from "node:test";
import assert from "node:assert/strict";
import { LEVEL_ITEMS } from "../js/config/level-item-settings.js";
import { LEVEL_TWO } from "../js/config/level-two-settings.js";
import { LEVEL_THREE } from "../js/config/level-three-settings.js";
import { DOG_CATCHER } from "../js/config/dog-catcher-settings.js";
import { LEVEL_EXIT } from "../js/config/level-exit-settings.js";
import { ItemFeedbackSystem } from
  "../classes/systems/item-feedback-system.class.js";
import { LevelItemSystem } from
  "../classes/systems/level-item-system.class.js";

test("Level One health items follow combat and remain before the exit", () => {
  const initialHealthItems = LEVEL_ITEMS.placements.initial.filter(({ type }) =>
    type === "health");
  const healthItems = LEVEL_ITEMS.placements.afterFirstCombat.filter(({ type }) =>
    type === "health");
  assert.equal(initialHealthItems.length, 0);
  assert.equal(healthItems.length, 2);
  healthItems.forEach(({ x, y, size }) => {
    assert.ok(x > DOG_CATCHER.patrolMaxX);
    assert.ok(x < LEVEL_EXIT.triggerX);
    assert.ok(x + size / 2 < LEVEL_EXIT.x - LEVEL_EXIT.displayWidth / 2);
    assert.equal(y, 445);
  });
});

test("later levels contain no misleading full-health item at their start", () => {
  [LEVEL_TWO.itemPlacements, LEVEL_THREE.itemPlacements].forEach(
    (placements) => {
      assert.equal(placements.some(({ type, x }) =>
        type === "health" && x < 400), false);
    },
  );
});

test("health item remains collectible only after the player loses health", () => {
  const effect = LEVEL_ITEMS.effects.health;
  const collectibles = { getCount: () => 0 };
  assert.equal(LevelItemSystem.canCollect(
    effect,
    { isFull: () => true },
    collectibles,
  ), false);
  assert.equal(LevelItemSystem.canCollect(
    effect,
    { isFull: () => false },
    collectibles,
  ), true);
});

test("full-health feedback is readable and throttled", () => {
  const data = new Map();
  let createdMessages = 0;
  const message = {
    y: 400,
    setOrigin() { return this; },
    setDepth() { return this; },
    destroy() {},
  };
  const scene = {
    time: { now: 1_000 },
    add: {
      text(_x, _y, text, style) {
        createdMessages += 1;
        assert.equal(text, "LEBEN BEREITS VOLL");
        assert.equal(style.fontSize, "16px");
        return message;
      },
    },
    tweens: { add: (config) => config },
  };
  const item = {
    x: 500,
    y: 445,
    displayHeight: 54,
    getData: (key) => data.get(key),
    setData: (key, value) => data.set(key, value),
  };

  assert.equal(ItemFeedbackSystem.showFullHealth(scene, item), true);
  assert.equal(ItemFeedbackSystem.showFullHealth(scene, item), false);
  scene.time.now += LEVEL_ITEMS.feedback.healthFull.cooldownMs;
  assert.equal(ItemFeedbackSystem.showFullHealth(scene, item), true);
  assert.equal(createdMessages, 2);
});
