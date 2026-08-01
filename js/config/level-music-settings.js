import { getAssetPath } from "./asset-paths.js";

/**
 * Zentrale Musik- und Übergangswerte des ersten Levels.
 */
export const LEVEL_MUSIC = Object.freeze({
  opening: Object.freeze({
    key: "level-music-opening",
    path: getAssetPath("audio", "music/level-title-opening.mp3"),
    volume: 0.42,
    loop: true,
    fadeInMs: 1200,
    fadeOutMs: 650,
  }),
});
