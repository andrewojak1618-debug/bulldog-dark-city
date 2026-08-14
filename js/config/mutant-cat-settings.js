import { getAssetPath } from "./asset-paths.js";
import { LEVEL_TWO } from "./level-two-settings.js";

const DISPLAY_SIZE = 128;
const BODY_HEIGHT = 120;
const ATTACK_VISUAL_BOTTOM_Y = 172;
const BOX = LEVEL_TWO.nuclearBoxObstacle;
const BOX_HALF_WIDTH = BOX.displayWidth / 2;
const CAT_HALF_WIDTH = DISPLAY_SIZE / 2;
const FIRST_PATROL_MIN_X = BOX.xPositions[0] + BOX_HALF_WIDTH + CAT_HALF_WIDTH;
const FIRST_PATROL_MAX_X = BOX.xPositions[1] - BOX_HALF_WIDTH - CAT_HALF_WIDTH;
const SECOND_PATROL_MIN_X = BOX.xPositions[1] + BOX_HALF_WIDTH + CAT_HALF_WIDTH;
const SECOND_PATROL_MAX_X = BOX.xPositions[2] - BOX_HALF_WIDTH - CAT_HALF_WIDTH;
const SECOND_PATROL_SPAN = SECOND_PATROL_MAX_X - SECOND_PATROL_MIN_X;
const SECOND_PATROL_LEFT_SPAWN_X =
  SECOND_PATROL_MIN_X + SECOND_PATROL_SPAN / 4;
const SECOND_PATROL_RIGHT_SPAWN_X =
  SECOND_PATROL_MAX_X - SECOND_PATROL_SPAN / 4;
const DETECTION_HEIGHT_TOLERANCE = BOX.collisionHeight;

/**
 * Defines the mutant cat states configuration.
 */
export const MUTANT_CAT_STATES = Object.freeze({
  patrol: "patrol",
  attentive: "attentive",
  chase: "chase",
  attack: "attack",
  hit: "hit",
  dead: "dead",
});

/**
 * Defines the mutant cat texture configuration.
 */
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

/**
 * Defines the mutant cat attentive texture configuration.
 */
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

/**
 * Defines the mutant cat attack texture configuration.
 */
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

/**
 * Defines the mutant cat dead texture configuration.
 */
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

/**
 * Defines the mutant cat animation key configuration.
 */
export const MUTANT_CAT_ANIMATION_KEY = "mutant-cat-walk-v2";

/**
 * Defines the mutant cat attentive animation key configuration.
 */
export const MUTANT_CAT_ATTENTIVE_ANIMATION_KEY =
  "mutant-cat-attentive-v2";

/**
 * Defines the mutant cat attack animation key configuration.
 */
export const MUTANT_CAT_ATTACK_ANIMATION_KEY = "mutant-cat-attack-v2";

/**
 * Defines the mutant cat dead animation key configuration.
 */
export const MUTANT_CAT_DEAD_ANIMATION_KEY = "mutant-cat-dead-v2";

/**
 * Defines the mutant cat events configuration.
 */
export const MUTANT_CAT_EVENTS = Object.freeze({
  defeated: "mutant-cat-defeated",
});

/**
 * Defines the mutant cat configuration.
 */
export const MUTANT_CAT = Object.freeze({
  spawnY: 320,
  patrols: Object.freeze([
    Object.freeze({
      spawnX: (BOX.xPositions[0] + BOX.xPositions[1]) / 2,
      minX: FIRST_PATROL_MIN_X,
      maxX: FIRST_PATROL_MAX_X,
      initialDirection: 1,
    }),
    Object.freeze({
      spawnX: SECOND_PATROL_LEFT_SPAWN_X,
      minX: SECOND_PATROL_MIN_X,
      maxX: SECOND_PATROL_MAX_X,
      initialDirection: 1,
    }),
    Object.freeze({
      spawnX: SECOND_PATROL_RIGHT_SPAWN_X,
      minX: SECOND_PATROL_MIN_X,
      maxX: SECOND_PATROL_MAX_X,
      initialDirection: -1,
    }),
  ]),
  displayWidth: DISPLAY_SIZE,
  displayHeight: DISPLAY_SIZE,
  bodyWidth: 180,
  bodyHeight: BODY_HEIGHT,
  bodyOffsetX: 38,
  bodyOffsetY: 126,
  attackBodyOffsetY: ATTACK_VISUAL_BOTTOM_Y - BODY_HEIGHT,
  patrolSpeed: 48,
  chaseSpeed: 76,
  frameRate: 7,
  attentiveFrameRate: 5,
  attackFrameRate: 8,
  attackSlowFromFrame: 1,
  attackSlowDurationMultiplier: 2,
  detectionRange: 220,
  disengageRange: 300,
  detectionHeightTolerance: DETECTION_HEIGHT_TOLERANCE,
  attackRange: 95,
  attackHitRange: 120,
  attackDamage: 20,
  attackImpactFrame: 2,
  attackCooldownMs: 1_600,
  deadFrameRate: 5,
  biteHitRange: 125,
  biteGroundLevelTolerance: 100,
  biteHitsToDefeat: 7,
  hitReactionMs: 220,
});
