export const ASSET_PATHS = Object.freeze({
  images: '/img/images',
  sprites: '/img/sprites',
  tilesets: '/img/tilesets',
  backgrounds: '/img/backgrounds',
  ui: '/img/ui',
  fonts: '/img/fonts',
  audio: '/audio',
});

export const getAssetPath = (group, fileName) =>
  `${ASSET_PATHS[group]}/${fileName}`;
