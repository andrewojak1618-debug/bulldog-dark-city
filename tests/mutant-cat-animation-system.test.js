import assert from "node:assert/strict";
import test from "node:test";
import { MutantCatAnimationSystem } from
  "../classes/systems/mutant-cat-animation-system.class.js";
import {
  MUTANT_CAT,
  MUTANT_CAT_ATTACK_ANIMATION_KEY,
  MUTANT_CAT_ATTACK_TEXTURE,
} from "../js/config/mutant-cat-settings.js";

test("Katzenattacke zeigt auf langsamen Geräten jedes Einzelbild", () => {
  let animation = null;
  const scene = {
    anims: {
      exists: () => false,
      create: (settings) => {
        animation = settings;
      },
    },
  };

  MutantCatAnimationSystem.registerAttackAnimation(scene);

  assert.equal(animation.key, MUTANT_CAT_ATTACK_ANIMATION_KEY);
  assert.equal(animation.skipMissedFrames, false);
  assert.equal(animation.frames.length, MUTANT_CAT_ATTACK_TEXTURE.frameCount);
});

test("Katzenattacke verwendet die abgestimmte Bildrate", () => {
  assert.equal(MUTANT_CAT.attackFrameRate, 8);
});

test("Angriffshitbox endet an der sichtbaren Pfotenkante", () => {
  assert.equal(
    MUTANT_CAT.attackBodyOffsetY + MUTANT_CAT.bodyHeight,
    172,
  );
});

test("Angriffsframes zwei bis vier laufen fünfzig Prozent langsamer", () => {
  const frames = MutantCatAnimationSystem.createAttackFrames();
  const baseFrameDuration = 1000 / MUTANT_CAT.attackFrameRate;
  const visibleDurations = frames.map(({ duration }) =>
    baseFrameDuration + duration);

  assert.equal(visibleDurations[0], baseFrameDuration);
  assert.equal(visibleDurations[1], visibleDurations[0] * 2);
  assert.equal(visibleDurations[2], visibleDurations[0] * 2);
  assert.equal(visibleDurations[3], visibleDurations[0] * 2);
});
