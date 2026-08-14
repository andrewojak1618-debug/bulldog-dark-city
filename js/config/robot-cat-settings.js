import { getAssetPath } from "./asset-paths.js";

/**
 * Defines the robot cat walk texture configuration.
 */
export const ROBOT_CAT_WALK_TEXTURE = Object.freeze({
  key: "robot-cat-walk-side",
  animationKey: "robot-cat-walk",
  path: getAssetPath("sprites", "enemies/robot_cat/walk/side/spritesheet.png"),
  frameWidth: 512,
  frameHeight: 512,
  frameCount: 3,
});

/**
 * Defines the robot cat states configuration.
 */
export const ROBOT_CAT_STATES = Object.freeze({
  walking: "walking",
  takingOff: "takingOff",
  flying: "flying",
  landing: "landing",
});

/**
 * Defines the robot cat flight texture configuration.
 */
export const ROBOT_CAT_FLIGHT_TEXTURE = Object.freeze({
  key: "robot-cat-flight-side",
  takeoffAnimationKey: "robot-cat-takeoff",
  path: getAssetPath(
    "sprites",
    "enemies/robot_cat/flight/side/spritesheet.png",
  ),
  frameWidth: 640,
  frameHeight: 640,
  frameCount: 4,
  takeoffSequence: Object.freeze([3, 0, 1, 2]),
  landingSequence: Object.freeze([2, 1, 0, 3]),
  landingFrameDurations: Object.freeze([140, 180, 140, 250]),
});

/**
 * Defines the robot cat hit texture configuration.
 */
export const ROBOT_CAT_HIT_TEXTURE = Object.freeze({
  key: "robot-cat-hit-side",
  animationKey: "robot-cat-hit",
  path: getAssetPath("sprites", "enemies/robot_cat/hit/side/spritesheet.png"),
  frameWidth: 512,
  frameHeight: 512,
  frameCount: 4,
  frameRate: 8,
});

/**
 * Defines the robot cat dead texture configuration.
 */
export const ROBOT_CAT_DEAD_TEXTURE = Object.freeze({
  key: "robot-cat-dead-side",
  animationKey: "robot-cat-dead",
  path: getAssetPath("sprites", "enemies/robot_cat/dead/side/spritesheet.png"),
  frameWidth: 512,
  frameHeight: 512,
  frameCount: 4,
  frameRate: 5,
});

/**
 * Defines the robot cat attack texture configuration.
 */
export const ROBOT_CAT_ATTACK_TEXTURE = Object.freeze({
  key: "robot-cat-attack-side",
  animationKey: "robot-cat-attack",
  path: getAssetPath(
    "sprites",
    "enemies/robot_cat/attack/side/spritesheet.png",
  ),
  frameWidth: 512,
  frameHeight: 512,
  frameCount: 4,
  frameRate: 6,
  launchFrame: 2,
});

/**
 * Defines the robot cat shooting texture configuration.
 */
export const ROBOT_CAT_SHOOT_TEXTURE = Object.freeze({
  key: "robot-cat-shoot-side",
  animationKey: "robot-cat-shoot",
  path: getAssetPath(
    "sprites",
    "enemies/robot_cat/shoot/side/spritesheet.png",
  ),
  frameWidth: 512,
  frameHeight: 512,
  frameCount: 4,
  frameRate: 5,
});

/**
 * Defines the robot cat claws texture configuration.
 */
export const ROBOT_CAT_CLAWS_TEXTURE = Object.freeze({
  key: "robot-cat-claws-attack-side",
  animationKey: "robot-cat-claws-attack",
  path: getAssetPath(
    "sprites",
    "effects/robot_cat_claws/attack/side/spritesheet.png",
  ),
  frameWidth: 512,
  frameHeight: 512,
  frameCount: 3,
  frameRate: 8,
});

/**
 * Defines the robot cat homing rocket texture configuration.
 */
export const ROBOT_CAT_ROCKET_TEXTURE = Object.freeze({
  key: "robot-cat-homing-rocket",
  animationKey: "robot-cat-homing-rocket-fly",
  path: getAssetPath(
    "sprites",
    "environment/vehicles/drones/rocket/rocket-fly-spritesheet.png",
  ),
  frameWidth: 512,
  frameHeight: 512,
  frameCount: 4,
  frameRate: 8,
});

/**
 * Defines the robot cat rocket explosion texture configuration.
 */
export const ROBOT_CAT_ROCKET_EXPLOSION_TEXTURE = Object.freeze({
  key: "robot-cat-rocket-explosion",
  animationKey: "robot-cat-rocket-explode",
  path: getAssetPath(
    "sprites",
    "environment/vehicles/drones/rocket/rocket-explosion-spritesheet.png",
  ),
  frameWidth: 512,
  frameHeight: 512,
  frameCount: 4,
  frameRate: 10,
  startFrame: 1,
});

/**
 * Defines the robot cat configuration.
 */
export const ROBOT_CAT = Object.freeze({
  spawnX: 2_100,
  patrolMinX: 150,
  patrolMaxX: 2_250,
  patrolSpeed: 45,
  flightSpeed: 95,
  flightHeight: 150,
  flightDisplaySize: 360,
  flightFrameRate: 6,
  takeoffDuration: 670,
  thrustFadeBeforeGroundMs: 160,
  obstacleTriggerDistance: 105,
  obstacleClearDistance: 125,
  obstacleResetDistance: 260,
  playerObstacleId: "bulldog",
  playerObstacleTriggerDistance: 126,
  playerObstacleGroundTolerance: 18,
  flightObstaclesX: Object.freeze([500, 1_650]),
  groundOffsetY: 1,
  displayWidth: 288,
  displayHeight: 288,
  collisionWidth: 115,
  collisionHeight: 256,
  groundCollisionTolerance: 12,
  walkFrameRate: 5,
  depth: 1,
});

/**
 * Defines the robot cat attack configuration.
 */
export const ROBOT_CAT_ATTACK = Object.freeze({
  triggerRangeX: 400,
  triggerRangeY: 180,
  initialDelayMs: 900,
  cooldownMs: 2_600,
  damage: 10,
  projectileDistance: 400,
  projectileSpeed: 320,
  projectileDisplaySize: 128,
  projectileHitboxInset: 26,
  launchOffsetX: 72,
  launchOffsetY: 150,
  dissolveScale: 0.75,
  dissolveDurationMs: 160,
  depth: 3,
});

/**
 * Defines the robot cat rocket barrage configuration.
 */
export const ROBOT_CAT_ROCKET_ATTACK = Object.freeze({
  shotCount: 4,
  firstShotDelayMs: 600,
  shotIntervalMs: 300,
  recoveryMs: 400,
  launchOffsetX: 60,
  launchOffsetY: 58,
  displaySize: 92,
  explosionDisplaySize: 150,
  speed: 185,
  maximumTurnRate: 1.35,
  lifetimeMs: 4_500,
  bodyRadius: 55,
  bodyOffsetX: 200,
  bodyOffsetY: 201,
  depth: 8,
  explosionSoundKey: "robot-cat-rocket-explosion-sound",
  explosionSoundPath: getAssetPath(
    "audio",
    "sfx/level-two-rocket-explosion.ogg",
  ),
  explosionSoundVolume: 0.62,
});

/**
 * Defines the three robot cat combat phases.
 */
export const ROBOT_CAT_PHASES = Object.freeze([
  Object.freeze({
    patrolSpeedMultiplier: 1,
    attackCooldownMs: 2_600,
    attackDamage: 10,
    rocketEnabled: false,
    rocketSpeedMultiplier: 1,
  }),
  Object.freeze({
    patrolSpeedMultiplier: 1.2,
    attackCooldownMs: 2_100,
    attackDamage: 15,
    rocketEnabled: true,
    rocketSpeedMultiplier: 1,
  }),
  Object.freeze({
    patrolSpeedMultiplier: 1.4,
    attackCooldownMs: 1_600,
    attackDamage: 20,
    rocketEnabled: true,
    rocketSpeedMultiplier: 1.2,
  }),
]);

/**
 * Defines the robot cat combat configuration.
 */
export const ROBOT_CAT_COMBAT = Object.freeze({
  maximumHealth: 9,
  damagePerHit: 1,
  attackHitRangeX: 155,
  attackHitRangeY: 165,
});

/**
 * Defines the robot cat health bar configuration.
 */
export const ROBOT_CAT_HEALTH_BAR = Object.freeze({
  x: 360,
  y: 50,
  width: 300,
  height: 14,
  padding: 2.5,
  groupGap: 12,
  segmentGap: 3,
  radius: 3,
  depth: 210,
  backgroundColor: 0x09070d,
  backgroundAlpha: 0.88,
  borderColor: 0xcbb8df,
  borderAlpha: 0.9,
  emptyColor: 0x211c27,
  emptyAlpha: 0.9,
  phaseColors: Object.freeze([0xe63243, 0xf58b2a, 0x2e8cff]),
});
