import { getAssetPath } from "./asset-paths.js";
import { LEVEL_TWO } from "./level-two-settings.js";

const DISPLAY_SIZE = 128;
const BOX = LEVEL_TWO.nuclearBoxObstacle;
const BOX_HALF_WIDTH = BOX.displayWidth / 2;
const CAT_HALF_WIDTH = DISPLAY_SIZE / 2;

/** Textur und Laufanimation der mutierten Katze. */
export const MUTANT_CAT_TEXTURE = Object.freeze({
  key: "mutant-cat-walk-side-v2",
  path: getAssetPath(
    "sprites",
    "enemies/mutated_cat/walk/side_v2/spritesheet.png",
  ),
  frameWidth: 256,
  frameHeight: 256,
  frameCount: 4,
});

/** Textur der einmalig abgespielten Aufmerksamkeitsreaktion. */
export const MUTANT_CAT_ATTENTIVE_TEXTURE = Object.freeze({
  key: "mutant-cat-attentive-side-v2",
  path: getAssetPath(
    "sprites",
    "enemies/mutated_cat/attentive/side_v2/spritesheet.png",
  ),
  frameWidth: 256,
  frameHeight: 256,
  frameCount: 4,
});

/** Textur des vierphasigen Sprungangriffs. */
export const MUTANT_CAT_ATTACK_TEXTURE = Object.freeze({
  key: "mutant-cat-attack-side-v2",
  path: getAssetPath(
    "sprites",
    "enemies/mutated_cat/attack/side_v2/spritesheet.png",
  ),
  frameWidth: 256,
  frameHeight: 256,
  frameCount: 4,
});

/** Textur der Trefferpose und vollständigen Todessequenz. */
export const MUTANT_CAT_DEAD_TEXTURE = Object.freeze({
  key: "mutant-cat-dead-side-v2",
  path: getAssetPath(
    "sprites",
    "enemies/mutated_cat/dead/side_v2/spritesheet.png",
  ),
  frameWidth: 256,
  frameHeight: 256,
  frameCount: 4,
});

/** Eindeutiger Phaser-Schlüssel der Katzen-Laufanimation. */
export const MUTANT_CAT_ANIMATION_KEY = "mutant-cat-walk-v2";

/** Eindeutiger Phaser-Schlüssel der Aufmerksamkeitsreaktion. */
export const MUTANT_CAT_ATTENTIVE_ANIMATION_KEY =
  "mutant-cat-attentive-v2";

/** Eindeutiger Phaser-Schlüssel des Katzenangriffs. */
export const MUTANT_CAT_ATTACK_ANIMATION_KEY = "mutant-cat-attack-v2";

/** Eindeutiger Phaser-Schlüssel der Todesanimation. */
export const MUTANT_CAT_DEAD_ANIMATION_KEY = "mutant-cat-dead-v2";

/** Eindeutige Fachereignisse des mutierten Katzengegners. */
export const MUTANT_CAT_EVENTS = Object.freeze({
  defeated: "mutant-cat-defeated",
});

/** Zentrale Bewegungs- und Physikwerte des Level-2-Gegners. */
export const MUTANT_CAT = Object.freeze({
  spawnX: (BOX.xPositions[0] + BOX.xPositions[1]) / 2,
  spawnY: 320,
  displayWidth: DISPLAY_SIZE,
  displayHeight: DISPLAY_SIZE,
  bodyWidth: 180,
  bodyHeight: 120,
  bodyOffsetX: 38,
  bodyOffsetY: 126,
  patrolMinX: BOX.xPositions[0] + BOX_HALF_WIDTH + CAT_HALF_WIDTH,
  patrolMaxX: BOX.xPositions[1] - BOX_HALF_WIDTH - CAT_HALF_WIDTH,
  patrolSpeed: 48,
  chaseSpeed: 76,
  frameRate: 7,
  attentiveFrameRate: 5,
  attackFrameRate: 8,
  attackLastFrameSpeedMultiplier: 2,
  attackDisplayScale: 1.2,
  detectionRange: 220,
  disengageRange: 300,
  detectionHeightTolerance: 100,
  attackRange: 95,
  attackHitRange: 120,
  attackDamage: 30,
  attackImpactFrame: 2,
  attackCooldownMs: 1_500,
  deadFrameRate: 5,
  biteHitRange: 125,
  biteGroundLevelTolerance: 100,
  biteHitsToDefeat: 9,
  hitReactionMs: 220,
});
