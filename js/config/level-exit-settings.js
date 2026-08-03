import { getAssetPath } from "./asset-paths.js";

/**
 * Zentrale Darstellung und Ablaufwerte des Ausgangs von Level eins.
 */
export const LEVEL_EXIT = Object.freeze({
  textureKey: "level-one-exit-sign",
  postTextureKey: "level-one-exit-post",
  animationKey: "level-one-exit-sign-active",
  path: getAssetPath(
    "sprites",
    "environment/level-exit/side/sign-spritesheet.png",
  ),
  postPath: getAssetPath(
    "sprites",
    "environment/level-exit/side/level-exit-post.png",
  ),
  frameWidth: 444,
  frameHeight: 887,
  frameSequence: Object.freeze([0, 1, 0, 3, 0, 2]),
  frameRate: 5,
  x: 2280,
  groundY: 565,
  displayWidth: 100,
  displayHeight: 200,
  depth: -0.25,
  unlockFadeMs: 350,
  triggerX: 2310,
  leaveWorldX: 2465,
  exitSpeed: 190,
  sceneFadeOutMs: 500,
});
