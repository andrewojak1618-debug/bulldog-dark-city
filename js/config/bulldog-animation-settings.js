const BULLDOG_NORMAL_BASE_PATH =
  "/img/sprites/characters/bulldog_normal";

/**
 * Zentrale Texturschlüssel und Quelldaten der normalen Bulldogge.
 */
export const BULLDOG_TEXTURES = Object.freeze({
  idle: Object.freeze({
    key: "bulldog-normal-idle-breathe-side",
    path: `${BULLDOG_NORMAL_BASE_PATH}/idle_breathe/side/spritesheet.png`,
    frameWidth: 128,
    frameHeight: 128,
    frameCount: 7,
  }),
  run: Object.freeze({
    key: "bulldog-normal-run-side",
    path: `${BULLDOG_NORMAL_BASE_PATH}/run/side/spritesheet.png`,
    frameWidth: 128,
    frameHeight: 128,
    frameCount: 8,
  }),
  jump: Object.freeze({
    key: "bulldog-normal-jump-side",
    path: `${BULLDOG_NORMAL_BASE_PATH}/jump/side/spritesheet.png`,
    frameWidth: 128,
    frameHeight: 128,
    frameCount: 6,
  }),
  land: Object.freeze({
    key: "bulldog-normal-land-side",
    path: `${BULLDOG_NORMAL_BASE_PATH}/land/side/spritesheet.png`,
    frameWidth: 128,
    frameHeight: 128,
    frameCount: 4,
  }),
});

/**
 * Eindeutige Phaser-Schlüssel für die Bewegungsanimationen.
 */
export const BULLDOG_ANIMATION_KEYS = Object.freeze({
  idle: "bulldog-idle",
  run: "bulldog-run",
  jump: "bulldog-jump",
  fall: "bulldog-fall",
  land: "bulldog-land",
});

/**
 * Zeitabhängige Schwellenwerte der Bulldog-Animationen.
 */
export const BULLDOG_ANIMATION_TIMING = Object.freeze({
  idleDelayMs: 6000,
  idleActiveDurationMs: 4000,
  idlePauseDurationMs: 3000,
});

/**
 * Übergangslösungen für noch nicht vorhandene Animations-Assets.
 * Der vierte Sprungframe zeigt die Bulldogge bereits abwärts geneigt
 * und wird ersetzt, sobald das eigene Fall-Asset verfügbar ist.
 */
export const BULLDOG_PLACEHOLDER_FRAMES = Object.freeze({
  fall: Object.freeze({
    textureKey: BULLDOG_TEXTURES.jump.key,
    frame: 3,
  }),
});

/**
 * Zentrale Abspielwerte und Framebereiche der Bulldog-Animationen.
 */
export const BULLDOG_ANIMATIONS = Object.freeze([
  Object.freeze({
    key: BULLDOG_ANIMATION_KEYS.idle,
    textureKey: BULLDOG_TEXTURES.idle.key,
    startFrame: 0,
    endFrame: BULLDOG_TEXTURES.idle.frameCount - 1,
    frameRate: 6,
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
    endFrame: 2,
    frameRate: 10,
    repeat: 0,
  }),
  Object.freeze({
    key: BULLDOG_ANIMATION_KEYS.fall,
    textureKey: BULLDOG_PLACEHOLDER_FRAMES.fall.textureKey,
    startFrame: BULLDOG_PLACEHOLDER_FRAMES.fall.frame,
    endFrame: BULLDOG_PLACEHOLDER_FRAMES.fall.frame,
    frameRate: 1,
    repeat: -1,
  }),
  Object.freeze({
    key: BULLDOG_ANIMATION_KEYS.land,
    textureKey: BULLDOG_TEXTURES.land.key,
    startFrame: 0,
    endFrame: BULLDOG_TEXTURES.land.frameCount - 1,
    frameRate: 12,
    repeat: 0,
  }),
]);
