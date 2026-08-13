import { getAssetPath } from "./asset-paths.js";

/**
 * Defines the dog catcher audio configuration.
 */
export const DOG_CATCHER_AUDIO = Object.freeze({
  alert: Object.freeze({
    key: "dog-catcher-alert-sound",
    path: getAssetPath(
      "audio",
      "sfx/enemies/dog-catcher/alert.ogg",
    ),
    volume: 0.7,
  }),
});
