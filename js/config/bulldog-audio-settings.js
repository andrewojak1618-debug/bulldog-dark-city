import { getAssetPath } from "./asset-paths.js";

/**
 * Defines the bulldog audio configuration.
 */
export const BULLDOG_AUDIO = Object.freeze({
  mutationTransform: Object.freeze({
    key: "bulldog-mutation-transform-sound",
    path: getAssetPath(
      "audio",
      "sfx/characters/bulldog/mutation-transform.ogg",
    ),
    volume: 0.8,
  }),
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
