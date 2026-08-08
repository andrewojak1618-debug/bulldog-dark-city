import { getAssetPath } from "./asset-paths.js";

/** Textur und Laufanimation der Roboterkatze in Level 3. */
export const ROBOT_CAT_WALK_TEXTURE = Object.freeze({
  key: "robot-cat-walk-side",
  animationKey: "robot-cat-walk",
  path: getAssetPath(
    "sprites",
    "enemies/robot_cat/walk/side/spritesheet.png",
  ),
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

/** Zentrale Darstellungswerte der vorerst passiven Roboterkatze. */
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
  obstacleTriggerDistance: 105,
  obstacleClearDistance: 125,
  obstacleResetDistance: 260,
  flightObstaclesX: Object.freeze([500, 1_650]),
  groundOffsetY: 1,
  displayWidth: 288,
  displayHeight: 288,
  collisionWidth: 115,
  collisionHeight: 256,
  walkFrameRate: 5,
  depth: 1,
});
