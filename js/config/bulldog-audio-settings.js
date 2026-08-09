import { getAssetPath } from "./asset-paths.js";

/**
 * Zentrale Audiodaten und Auslösewerte der normalen Bulldogge.
 */
export const BULLDOG_AUDIO = Object.freeze({
  biteAttack: Object.freeze({
    key: "bulldog-normal-bite-sound",
    path: getAssetPath("audio", "sfx/characters/bulldog/bite.ogg"),
    volume: 0.8,
    triggerFrame: 1,
  }),
  waitBreathe: Object.freeze({
    key: "bulldog-normal-wait-breathe-sound",
    path: getAssetPath(
      "audio",
      "sfx/characters/bulldog/wait-breathe-loop.ogg",
    ),
    volume: 0.55,
    loop: true,
  }),
});
