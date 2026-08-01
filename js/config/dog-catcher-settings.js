import { getAssetPath } from "./asset-paths.js";

const DOG_CATCHER_BASE_PATH = getAssetPath(
  "sprites",
  "enemies/dog_catcher",
);
const DOG_CATCHER_DISPLAY_SIZE = 206;

/**
 * Zentrale Texturschlüssel und Quelldaten des Hundefängers.
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
 * Eindeutige Phaser-Schlüssel der Hundefänger-Animationen.
 */
export const DOG_CATCHER_ANIMATION_KEYS = Object.freeze({
  walk: "dog-catcher-walk",
  alert: "dog-catcher-alert",
  attack: "dog-catcher-attack",
  dead: "dog-catcher-dead",
});

/** Eindeutige Fachereignisse des Hundefängers. */
export const DOG_CATCHER_EVENTS = Object.freeze({
  defeated: "dog-catcher-defeated",
});

/**
 * Zentrale Abspielwerte der Hundefänger-Animationen.
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
 * Physik-, Wahrnehmungs- und Bewegungswerte des ersten Testgegners.
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
  attackHitRange: 145,
  attackDamage: 10,
  attackCooldownMs: 1500,
  biteHitRange: 145,
  biteGroundLevelTolerance: 48,
  biteHitsToDefeat: 4,
  hitReactionMs: 220,
});
