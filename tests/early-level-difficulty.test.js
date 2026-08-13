import assert from "node:assert/strict";
import test from "node:test";
import { LevelTwoDroneCombatSystem } from
  "../classes/systems/level-two-drone-combat-system.class.js";
import {
  BULLDOG_ANIMATION_KEYS,
  BULLDOG_TEXTURES,
} from "../js/config/bulldog-animation-settings.js";
import { DOG_CATCHER } from "../js/config/dog-catcher-settings.js";
import { LEVEL_EXIT } from "../js/config/level-exit-settings.js";
import { LEVEL_TWO } from "../js/config/level-two-settings.js";
import { MUTANT_CAT } from "../js/config/mutant-cat-settings.js";
import {
  ROBOT_CAT_ATTACK,
  ROBOT_CAT_COMBAT,
} from "../js/config/robot-cat-settings.js";

test("Level eins bildet eine kurze und gut lesbare Lernbegegnung", () => {
  assert.equal(DOG_CATCHER.biteHitsToDefeat, 3);
  assert.equal(DOG_CATCHER.attackDamage, 10);
  assert.ok(DOG_CATCHER.attackCooldownMs >= 2_000);
});

test("Level zwei reduziert Schadensspitzen und lässt Erholungszeit", () => {
  assert.equal(MUTANT_CAT.patrols.length, 2);
  assert.equal(MUTANT_CAT.biteHitsToDefeat, 6);
  assert.equal(MUTANT_CAT.attackDamage, 20);
  assert.ok(MUTANT_CAT.attackCooldownMs >= 2_400);
});

test("Level zwei verteilt erreichbare Heil-Checkpoints", () => {
  const healthItems = LEVEL_TWO.itemPlacements.filter(({ type }) =>
    type === "health");
  const firstPatrol = MUTANT_CAT.patrols[0];
  const lastPatrol = MUTANT_CAT.patrols.at(-1);
  const lastBoxX = LEVEL_TWO.nuclearBoxObstacle.xPositions.at(-1);

  assert.equal(healthItems.length, 2);
  assert.ok(healthItems[0].x > firstPatrol.maxX);
  assert.ok(healthItems[1].x > lastPatrol.maxX);
  assert.ok(healthItems[1].x < lastBoxX);
  assert.ok(healthItems[1].x < LEVEL_EXIT.triggerX);
});

test("Drohnen bleiben auch ohne Mutation im Sprung besiegbar", () => {
  const player = {
    isMutated: false,
    isAttacking: true,
    attackHitConsumed: false,
    anims: {
      currentAnim: { key: BULLDOG_ANIMATION_KEYS.biteAttack },
      currentFrame: {
        textureFrame: BULLDOG_TEXTURES.biteAttack.frameCount - 1,
      },
    },
  };

  assert.equal(LevelTwoDroneCombatSystem.isImpactFrameReady(player), true);
});

test("der Bosskampf behält seine anspruchsvolleren Werte", () => {
  assert.equal(ROBOT_CAT_COMBAT.maximumHealth, 9);
  assert.equal(ROBOT_CAT_ATTACK.damage, 10);
  assert.equal(ROBOT_CAT_ATTACK.cooldownMs, 2_600);
});
