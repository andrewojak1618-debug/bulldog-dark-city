import { getAssetPath } from "./asset-paths.js";

/** Zentrale Audiodaten der mutierten Katze. */
export const MUTANT_CAT_AUDIO = Object.freeze({
  attentive: Object.freeze({
    key: "mutant-cat-attentive-sound",
    path: getAssetPath(
      "audio",
      "sfx/enemies/mutant-cat/attentive.ogg",
    ),
    volume: 0.6,
  }),
});
