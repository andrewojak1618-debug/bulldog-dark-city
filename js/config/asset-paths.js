export const ASSET_PATHS = Object.freeze({
  images: "img/images",
  sprites: "img/sprites",
  tilesets: "img/tilesets",
  backgrounds: "img/backgrounds",
  environment: "img/environment",
  ui: "img/ui",
  fonts: "fonts",
  audio: "audio",
  data: "data",
});

/**
 * Defines the get asset path configuration.
 * @param {keyof typeof ASSET_PATHS} group - The Phaser group to process.
 * @param {string} fileName - The file name or relative path.
 * @returns {string} The resulting string value.
 */
export const getAssetPath = (group, fileName) =>
  `${import.meta.env?.BASE_URL ?? "/"}${ASSET_PATHS[group]}/${fileName}`;
