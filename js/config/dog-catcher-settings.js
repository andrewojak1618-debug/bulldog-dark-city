import { getAssetPath } from "./asset-paths.js";

const DOG_CATCHER_BASE_PATH = getAssetPath("sprites", "enemies/dog_catcher");
const DOG_CATCHER_DISPLAY_SIZE = 206;

/**
 * Defines the dog catcher textures configuration.
 */
export const DOG_CATCHER_TEXTURES = Object.freeze({
  walk: Object.freeze({
    key: "dog-catcher-walk-side",
    path: `${DOG_CATCHER_BASE_PATH}/walk/side/spritesheet.png`,
    frameWidth: 256,
    frameHeight: 256,
    frameCount: 6,
  }),
  alert: Object.freeze({
    key: "dog-catcher-alert-side",
    path: `${DOG_CATCHER_BASE_PATH}/alert/side/spritesheet.png`,
    frameWidth: 256,
    frameHeight: 256,
    frameCount: 4,
  }),
  attack: Object.freeze({
    key: "dog-catcher-attack-side",
    path: `${DOG_CATCHER_BASE_PATH}/attack/side/spritesheet.png`,
    frameWidth: 256,
    frameHeight: 256,
    frameCount: 4,
  }),
  dead: Object.freeze({
    key: "dog-catcher-dead-side",
    path: `${DOG_CATCHER_BASE_PATH}/dead/side/spritesheet.png`,
    frameWidth: 256,
    frameHeight: 256,
    frameCount: 4,
  }),
});

/**
 * Defines the dog catcher animation keys configuration.
 */
export const DOG_CATCHER_ANIMATION_KEYS = Object.freeze({
  walk: "dog-catcher-walk",
  alert: "dog-catcher-alert",
  attack: "dog-catcher-attack",
  dead: "dog-catcher-dead",
});

/**
 * Defines the dog catcher events configuration.
 */
export const DOG_CATCHER_EVENTS = Object.freeze({
  defeated: "dog-catcher-defeated",
});

/**
 * Defines the dog catcher animations configuration.
 */
export const DOG_CATCHER_ANIMATIONS = Object.freeze([
  Object.freeze({
    key: DOG_CATCHER_ANIMATION_KEYS.walk,
    textureKey: DOG_CATCHER_TEXTURES.walk.key,
    endFrame: DOG_CATCHER_TEXTURES.walk.frameCount - 1,
    frameOrder: Object.freeze([5, 4, 0, 1, 0, 4, 5, 2, 3, 2]),
    frameRate: 9,
    repeat: -1,
  }),
  Object.freeze({
    key: DOG_CATCHER_ANIMATION_KEYS.alert,
    textureKey: DOG_CATCHER_TEXTURES.alert.key,
    endFrame: DOG_CATCHER_TEXTURES.alert.frameCount - 1,
    frameRate: 5,
    repeat: 0,
  }),
  Object.freeze({
    key: DOG_CATCHER_ANIMATION_KEYS.attack,
    textureKey: DOG_CATCHER_TEXTURES.attack.key,
    endFrame: DOG_CATCHER_TEXTURES.attack.frameCount - 1,
    frameRate: 8.4,
    repeat: 0,
  }),
  Object.freeze({
    key: DOG_CATCHER_ANIMATION_KEYS.dead,
    textureKey: DOG_CATCHER_TEXTURES.dead.key,
    endFrame: DOG_CATCHER_TEXTURES.dead.frameCount - 1,
    frameRate: 5,
    repeat: 0,
  }),
]);

/**
 * Defines the dog catcher configuration.
 */
export const DOG_CATCHER = Object.freeze({
  spawnX: 1830,
  spawnY: 390,
  displayWidth: DOG_CATCHER_DISPLAY_SIZE,
  displayHeight: DOG_CATCHER_DISPLAY_SIZE,
  bodyWidth: 84,
  bodyHeight: 164,
  bodyOffsetX: 86,
  bodyOffsetY: 92,
  patrolMinX: 1669,
  patrolMaxX: 1990,
  patrolSpeed: 42,
  chaseSpeed: 58,
  detectionRange: 300,
  rearDetectionRange: 100,
  groundLevelTolerance: 48,
  attackRange: 130,
  attackHitRange: 130,
  attackDamage: 10,
  attackCooldownMs: 2_200,
  biteHitRange: 145,
  biteGroundLevelTolerance: 48,
  biteHitsToDefeat: 3,
  hitReactionMs: 220,
});

/**
 * Defines the dog catcher range debug configuration.
 */
export const DOG_CATCHER_RANGE_DEBUG = Object.freeze({
  queryParameter: "debugDogCatcherRanges",
  queryValue: "1",
  playerStartPadding: 20,
  depth: 950,
  frontColor: 0x35d7ff,
  rearColor: 0xffd35a,
  attackColor: 0xff4068,
  areaAlpha: 0.18,
  lineAlpha: 0.95,
  frontOffsetY: 12,
  rearOffsetY: 24,
  attackOffsetY: 36,
  rangeHeight: 7,
  markerHeight: 24,
  legendX: 12,
  legendY: 78,
  legendDepth: 1_100,
  legendText: [
    "ENTWICKLUNGSANSICHT: HUNDEFÄNGER-REICHWEITEN",
    "Cyan: Sicht vorn 300 px",
    "Gelb: Sicht hinten 100 px",
    "Rot: Angriff und Treffer 130 px",
  ].join("\n"),
});
