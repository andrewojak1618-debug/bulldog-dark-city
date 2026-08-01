import { getAssetPath } from "./asset-paths.js";

const BULLDOG_NORMAL_BASE_PATH = getAssetPath(
  "sprites",
  "characters/bulldog_normal",
);

/**
 * Zentrale Texturschlüssel und Quelldaten der normalen Bulldogge.
 */
export const BULLDOG_TEXTURES = Object.freeze({
  stand: Object.freeze({
    key: "bulldog-normal-stand-v2-side",
    path: `${BULLDOG_NORMAL_BASE_PATH}/stand_v2/side/spritesheet.png`,
    frameWidth: 128,
    frameHeight: 128,
    frameCount: 1,
  }),
  sit: Object.freeze({
    key: "bulldog-normal-sit-v2-side",
    path: `${BULLDOG_NORMAL_BASE_PATH}/sit_v2/side/spritesheet.png`,
    frameWidth: 128,
    frameHeight: 128,
    frameCount: 1,
  }),
  waitBreathe: Object.freeze({
    key: "bulldog-normal-wait-breathe-v2-side",
    path:
      `${BULLDOG_NORMAL_BASE_PATH}` +
      "/wait_breathe_v2/side/spritesheet.png",
    frameWidth: 128,
    frameHeight: 128,
    frameCount: 3,
  }),
  run: Object.freeze({
    key: "bulldog-normal-run-v2-side",
    path: `${BULLDOG_NORMAL_BASE_PATH}/run_v2/side/spritesheet.png`,
    frameWidth: 128,
    frameHeight: 128,
    frameCount: 4,
  }),
  jump: Object.freeze({
    key: "bulldog-normal-jump-up-v2-side",
    path: `${BULLDOG_NORMAL_BASE_PATH}/jump_up_v2/side/spritesheet.png`,
    frameWidth: 128,
    frameHeight: 128,
    frameCount: 4,
  }),
  fall: Object.freeze({
    key: "bulldog-normal-fall-side",
    path: `${BULLDOG_NORMAL_BASE_PATH}/fall/side/spritesheet.png`,
    frameWidth: 128,
    frameHeight: 128,
    frameCount: 3,
  }),
  land: Object.freeze({
    key: "bulldog-normal-land-v2-side",
    path: `${BULLDOG_NORMAL_BASE_PATH}/land_v2/side/spritesheet.png`,
    frameWidth: 128,
    frameHeight: 128,
    frameCount: 2,
  }),
  knockout: Object.freeze({
    key: "bulldog-normal-knockout-side",
    path: `${BULLDOG_NORMAL_BASE_PATH}/knockout/side/spritesheet.png`,
    frameWidth: 128,
    frameHeight: 128,
    frameCount: 4,
  }),
  biteAttack: Object.freeze({
    key: "bulldog-normal-bite-attack-v2-side",
    path:
      `${BULLDOG_NORMAL_BASE_PATH}` +
      "/bite_attack_v2/side/spritesheet.png",
    frameWidth: 192,
    frameHeight: 128,
    frameCount: 4,
  }),
});

/**
 * Eindeutige Phaser-Schlüssel für die Bewegungsanimationen.
 */
export const BULLDOG_ANIMATION_KEYS = Object.freeze({
  waitBreathe: "bulldog-wait-breathe",
  run: "bulldog-run",
  jump: "bulldog-jump",
  fall: "bulldog-fall",
  land: "bulldog-land",
  knockout: "bulldog-knockout",
  biteAttack: "bulldog-bite-attack",
});

/**
 * Domänenereignisse für Reaktionen außerhalb der Bulldog-Klasse.
 */
export const BULLDOG_EVENTS = Object.freeze({
  knockedOut: "bulldog-knocked-out",
});

/**
 * Zeitabhängige Schwellenwerte der Bulldog-Animationen.
 */
export const BULLDOG_ANIMATION_TIMING = Object.freeze({
  waitDelayMs: 6000,
  waitSeatedPauseMs: 3000,
  hitReactionMs: 220,
});

/**
 * Zentrale Abspielwerte und Framebereiche der Bulldog-Animationen.
 */
export const BULLDOG_ANIMATIONS = Object.freeze([
  Object.freeze({
    key: BULLDOG_ANIMATION_KEYS.waitBreathe,
    textureKey: BULLDOG_TEXTURES.waitBreathe.key,
    startFrame: 0,
    endFrame: BULLDOG_TEXTURES.waitBreathe.frameCount - 1,
    frameRate: 3,
    repeat: -1,
  }),
  Object.freeze({
    key: BULLDOG_ANIMATION_KEYS.run,
    textureKey: BULLDOG_TEXTURES.run.key,
    startFrame: 0,
    endFrame: BULLDOG_TEXTURES.run.frameCount - 1,
    frameRate: 12,
    repeat: -1,
  }),
  Object.freeze({
    key: BULLDOG_ANIMATION_KEYS.jump,
    textureKey: BULLDOG_TEXTURES.jump.key,
    startFrame: 0,
    endFrame: BULLDOG_TEXTURES.jump.frameCount - 1,
    frameRate: 4,
    repeat: 0,
  }),
  Object.freeze({
    key: BULLDOG_ANIMATION_KEYS.fall,
    textureKey: BULLDOG_TEXTURES.fall.key,
    startFrame: 0,
    endFrame: BULLDOG_TEXTURES.fall.frameCount - 1,
    frameRate: 6,
    repeat: -1,
  }),
  Object.freeze({
    key: BULLDOG_ANIMATION_KEYS.land,
    textureKey: BULLDOG_TEXTURES.land.key,
    startFrame: 0,
    endFrame: BULLDOG_TEXTURES.land.frameCount - 1,
    frameRate: 8,
    frameDurations: Object.freeze([0, 175]),
    repeat: 0,
  }),
  Object.freeze({
    key: BULLDOG_ANIMATION_KEYS.biteAttack,
    textureKey: BULLDOG_TEXTURES.biteAttack.key,
    startFrame: 0,
    endFrame: BULLDOG_TEXTURES.biteAttack.frameCount - 1,
    frameRate: 8,
    frameDurations: Object.freeze([0, 0, 0, 100]),
    repeat: 0,
  }),
  Object.freeze({
    key: BULLDOG_ANIMATION_KEYS.knockout,
    textureKey: BULLDOG_TEXTURES.knockout.key,
    startFrame: 0,
    endFrame: BULLDOG_TEXTURES.knockout.frameCount - 1,
    frameRate: 5,
    repeat: 0,
  }),
]);
