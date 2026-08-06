import { getAssetPath } from "./asset-paths.js";

const BULLDOG_NORMAL_BASE_PATH = getAssetPath(
  "sprites",
  "characters/bulldog_normal",
);
const BULLDOG_MUTATION_BASE_PATH = getAssetPath(
  "sprites",
  "characters/bulldog_mutation",
);

/**
 * Zentrale Texturschlüssel und Quelldaten der normalen Bulldogge.
 */
export const BULLDOG_TEXTURES = Object.freeze({
  mutationTransform: Object.freeze({
    key: "bulldog-mutation-transform-side",
    path: `${BULLDOG_MUTATION_BASE_PATH}/transform/side/spritesheet.png`,
    frameWidth: 512,
    frameHeight: 600,
    frameCount: 5,
  }),
  mutationIdle: Object.freeze({
    key: "bulldog-mutation-idle-side",
    path: `${BULLDOG_MUTATION_BASE_PATH}/idle/side/spritesheet.png`,
    frameWidth: 512,
    frameHeight: 600,
    frameCount: 4,
  }),
  mutationWalk: Object.freeze({
    key: "bulldog-mutation-walk-side",
    path: `${BULLDOG_MUTATION_BASE_PATH}/walk/side/spritesheet.png`,
    frameWidth: 512,
    frameHeight: 600,
    frameCount: 4,
  }),
  mutationJump: Object.freeze({
    key: "bulldog-mutation-jump-side",
    path: `${BULLDOG_MUTATION_BASE_PATH}/jump/side/spritesheet.png`,
    frameWidth: 512,
    frameHeight: 600,
    frameCount: 4,
  }),
  mutationAttackLeft: Object.freeze({
    key: "bulldog-mutation-attack-left-side",
    path: `${BULLDOG_MUTATION_BASE_PATH}/attack_left/side/spritesheet.png`,
    frameWidth: 768,
    frameHeight: 600,
    frameCount: 3,
  }),
  mutationAttackRight: Object.freeze({
    key: "bulldog-mutation-attack-right-side",
    path: `${BULLDOG_MUTATION_BASE_PATH}/attack_right/side/spritesheet.png`,
    frameWidth: 768,
    frameHeight: 600,
    frameCount: 3,
  }),
  mutationKnockout: Object.freeze({
    key: "bulldog-mutation-knockout-side",
    path: `${BULLDOG_MUTATION_BASE_PATH}/knockout/side/spritesheet.png`,
    frameWidth: 512,
    frameHeight: 600,
    frameCount: 4,
  }),
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
  mutationTransform: "bulldog-mutation-transform",
  mutationIdle: "bulldog-mutation-idle",
  mutationWalk: "bulldog-mutation-walk",
  mutationJump: "bulldog-mutation-jump",
  mutationLand: "bulldog-mutation-land",
  mutationAttackLeft: "bulldog-mutation-attack-left",
  mutationAttackRight: "bulldog-mutation-attack-right",
  mutationKnockout: "bulldog-mutation-knockout",
  mutationRevert: "bulldog-mutation-revert",
  waitBreathe: "bulldog-wait-breathe",
  run: "bulldog-run",
  jump: "bulldog-jump",
  fall: "bulldog-fall",
  land: "bulldog-land",
  knockout: "bulldog-knockout",
  biteAttack: "bulldog-bite-attack",
});

/** Ordnet jeder Trefferanimation ihre zugehörigen Framedaten zu. */
export const BULLDOG_ATTACK_TEXTURES = Object.freeze({
  [BULLDOG_ANIMATION_KEYS.biteAttack]: BULLDOG_TEXTURES.biteAttack,
  [BULLDOG_ANIMATION_KEYS.mutationAttackLeft]:
    BULLDOG_TEXTURES.mutationAttackLeft,
  [BULLDOG_ANIMATION_KEYS.mutationAttackRight]:
    BULLDOG_TEXTURES.mutationAttackRight,
});

/**
 * Domänenereignisse für Reaktionen außerhalb der Bulldog-Klasse.
 */
export const BULLDOG_EVENTS = Object.freeze({
  knockedOut: "bulldog-knocked-out",
  mutationCompleted: "bulldog-mutation-completed",
  mutationReverted: "bulldog-mutation-reverted",
});

/**
 * Zeitabhängige Schwellenwerte der Bulldog-Animationen.
 */
export const BULLDOG_ANIMATION_TIMING = Object.freeze({
  waitDelayMs: 6000,
  waitSeatedPauseMs: 3000,
  hitReactionMs: 220,
  mutationFallbackMs: 1600,
  mutationFullHoldMs: 3000,
  mutationDrainMs: 8000,
});

/**
 * Zentrale Abspielwerte und Framebereiche der Bulldog-Animationen.
 */
export const BULLDOG_ANIMATIONS = Object.freeze([
  Object.freeze({
    key: BULLDOG_ANIMATION_KEYS.mutationTransform,
    textureKey: BULLDOG_TEXTURES.mutationTransform.key,
    startFrame: 0,
    endFrame: BULLDOG_TEXTURES.mutationTransform.frameCount - 1,
    frameRate: 4,
    repeat: 0,
  }),
  Object.freeze({
    key: BULLDOG_ANIMATION_KEYS.mutationRevert,
    textureKey: BULLDOG_TEXTURES.mutationTransform.key,
    startFrame: 0,
    endFrame: BULLDOG_TEXTURES.mutationTransform.frameCount - 1,
    frameRate: 4,
    repeat: 0,
    reverseFrames: true,
  }),
  Object.freeze({
    key: BULLDOG_ANIMATION_KEYS.mutationIdle,
    textureKey: BULLDOG_TEXTURES.mutationIdle.key,
    startFrame: 0,
    endFrame: BULLDOG_TEXTURES.mutationIdle.frameCount - 1,
    frameRate: 2,
    repeat: -1,
  }),
  Object.freeze({
    key: BULLDOG_ANIMATION_KEYS.mutationWalk,
    textureKey: BULLDOG_TEXTURES.mutationWalk.key,
    startFrame: 0,
    endFrame: BULLDOG_TEXTURES.mutationWalk.frameCount - 1,
    frameRate: 8,
    repeat: -1,
  }),
  Object.freeze({
    key: BULLDOG_ANIMATION_KEYS.mutationJump,
    textureKey: BULLDOG_TEXTURES.mutationJump.key,
    startFrame: 0,
    endFrame: BULLDOG_TEXTURES.mutationJump.frameCount - 2,
    frameRate: 4,
    repeat: 0,
  }),
  Object.freeze({
    key: BULLDOG_ANIMATION_KEYS.mutationLand,
    textureKey: BULLDOG_TEXTURES.mutationJump.key,
    startFrame: BULLDOG_TEXTURES.mutationJump.frameCount - 1,
    endFrame: BULLDOG_TEXTURES.mutationJump.frameCount - 1,
    frameRate: 4,
    repeat: 0,
  }),
  Object.freeze({
    key: BULLDOG_ANIMATION_KEYS.mutationAttackLeft,
    textureKey: BULLDOG_TEXTURES.mutationAttackLeft.key,
    startFrame: 0,
    endFrame: BULLDOG_TEXTURES.mutationAttackLeft.frameCount - 1,
    frameRate: 8,
    repeat: 0,
  }),
  Object.freeze({
    key: BULLDOG_ANIMATION_KEYS.mutationAttackRight,
    textureKey: BULLDOG_TEXTURES.mutationAttackRight.key,
    startFrame: 0,
    endFrame: BULLDOG_TEXTURES.mutationAttackRight.frameCount - 1,
    frameRate: 8,
    repeat: 0,
  }),
  Object.freeze({
    key: BULLDOG_ANIMATION_KEYS.mutationKnockout,
    textureKey: BULLDOG_TEXTURES.mutationKnockout.key,
    startFrame: 0,
    endFrame: BULLDOG_TEXTURES.mutationKnockout.frameCount - 1,
    frameRate: 4,
    frameDurations: Object.freeze([100, 100, 150, 500]),
    repeat: 0,
  }),
  Object.freeze({
    key: BULLDOG_ANIMATION_KEYS.waitBreathe,
    textureKey: BULLDOG_TEXTURES.waitBreathe.key,
    startFrame: 0,
    endFrame: BULLDOG_TEXTURES.waitBreathe.frameCount - 1,
    frameRate: 2.18,
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
