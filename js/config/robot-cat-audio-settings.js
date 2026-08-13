import { getAssetPath } from "./asset-paths.js";

/**
 * Defines the robot cat audio configuration.
 */
export const ROBOT_CAT_AUDIO = Object.freeze({
  clawAttack: Object.freeze({
    key: "robot-cat-claw-attack-sound",
    path: getAssetPath(
      "audio",
      "sfx/enemies/robot-cat/claw-attack.ogg",
    ),
    volume: 0.65,
  }),
  thrustFlight: Object.freeze({
    key: "robot-cat-thrust-flight-sound",
    path: getAssetPath(
      "audio",
      "sfx/enemies/robot-cat/thrust-flight.ogg",
    ),
    volume: 0.36,
  }),
});
