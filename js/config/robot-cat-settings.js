import { getAssetPath } from "./asset-paths.js";

/** Textur und Laufanimation der Roboterkatze in Level 3. */
export const ROBOT_CAT_WALK_TEXTURE = Object.freeze({
  key: "robot-cat-walk-side",
  animationKey: "robot-cat-walk",
  path: getAssetPath("sprites", "enemies/robot_cat/walk/side/spritesheet.png"),
  frameWidth: 512,
  frameHeight: 512,
  frameCount: 3,
});

/** Eindeutige Zustände der Roboterkatzen-Bewegung. */
export const ROBOT_CAT_STATES = Object.freeze({
  walking: "walking",
  takingOff: "takingOff",
  flying: "flying",
  landing: "landing",
});

/** Textur und gerichtete Start-/Landeanimation der Roboterkatze. */
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

/** Freigestellte Trefferreaktion mit gemeinsamem Fußanker aller Frames. */
export const ROBOT_CAT_HIT_TEXTURE = Object.freeze({
  key: "robot-cat-hit-side",
  animationKey: "robot-cat-hit",
  path: getAssetPath("sprites", "enemies/robot_cat/hit/side/spritesheet.png"),
  frameWidth: 512,
  frameHeight: 512,
  frameCount: 4,
  frameRate: 8,
});

/** Finale K.-o.-Sequenz der besiegten Roboterkatze. */
export const ROBOT_CAT_DEAD_TEXTURE = Object.freeze({
  key: "robot-cat-dead-side",
  animationKey: "robot-cat-dead",
  path: getAssetPath("sprites", "enemies/robot_cat/dead/side/spritesheet.png"),
  frameWidth: 512,
  frameHeight: 512,
  frameCount: 4,
  frameRate: 5,
});

/** Bodengebundene Angriffssequenz der Roboterkatze. */
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

/** Animierter Klaueneffekt, der beim Bossangriff abgefeuert wird. */
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

/** Zentrale Darstellungs- und Bewegungswerte der Roboterkatze. */
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

/** Reichweite, Schaden und Projektilbewegung des Roboterkatzen-Angriffs. */
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

/** Trefferwerte der Roboterkatze und Reichweite der Bulldoggen-Attacken. */
export const ROBOT_CAT_COMBAT = Object.freeze({
  maximumHealth: 9,
  damagePerHit: 1,
  attackHitRangeX: 155,
  attackHitRangeY: 165,
});

/** Kamerafeste Darstellung der dreiphasigen Boss-Lebensanzeige. */
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
