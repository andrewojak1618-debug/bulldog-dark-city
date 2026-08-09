import { getAssetPath } from "./asset-paths.js";

/**
 * Zentrale Musik- und Übergangswerte der Spiellevel.
 */
export const LEVEL_MUSIC = Object.freeze({
  opening: Object.freeze({
    key: "level-music-opening",
    path: getAssetPath("audio", "music/level-title-opening.mp3"),
    volume: 0.336,
    loop: true,
    fadeInMs: 1200,
    fadeOutMs: 650,
  }),
  levelTwo: Object.freeze({
    key: "level-two-gothic-storm-music",
    path: getAssetPath(
      "audio",
      "music/level-two-gothic-storm-loop.ogg",
    ),
    volume: 0.34,
    loop: true,
    fadeInMs: 1600,
    fadeOutMs: 800,
  }),
  levelThree: Object.freeze({
    key: "level-three-robot-cat-boss-music",
    path: getAssetPath(
      "audio",
      "music/level-three-robot-cat-boss-loop.ogg",
    ),
    volume: 0.32,
    loop: true,
    fadeInMs: 1_500,
    fadeOutMs: 900,
  }),
});
