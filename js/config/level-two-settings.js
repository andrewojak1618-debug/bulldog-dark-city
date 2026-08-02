import { getAssetPath } from "./asset-paths.js";

/**
 * Zentrale Darstellungseinstellungen des zweiten Levels.
 */
export const LEVEL_TWO = Object.freeze({
  background: Object.freeze({
    key: "dark-city-level-two-background-green-main-01",
    path: getAssetPath(
      "backgrounds",
      "dark_city_level_2/composites/level-two-green-main-01.png",
    ),
    depth: -10,
  }),
  skyscrapers: Object.freeze({
    key: "dark-city-level-two-skyscrapers",
    path: getAssetPath(
      "backgrounds",
      "dark_city_level_2/layer_01_skyscrapers/spritesheet.png",
    ),
    frameWidth: 512,
    frameHeight: 512,
    frameSequence: Object.freeze([0, 1, 2, 3]),
    displayHeight: 320,
    bottomY: 480,
    startX: -20,
    seamOverlap: 12,
    scrollFactor: 0.12,
    depth: -5,
  }),
  industrialMidground: Object.freeze({
    key: "dark-city-level-two-industrial-midground",
    path: getAssetPath(
      "backgrounds",
      "dark_city_level_2/layer_02_industrial_midground/spritesheet.png",
    ),
    frameWidth: 512,
    frameHeight: 512,
    frameSequence: Object.freeze([0, 1, 2, 3]),
    displayHeight: 285,
    bottomY: 480,
    startX: -10,
    seamOverlap: 14,
    scrollFactor: 0.24,
    depth: -3,
  }),
  elevatedRoads: Object.freeze({
    key: "dark-city-level-two-elevated-roads",
    path: getAssetPath(
      "backgrounds",
      "dark_city_level_2/layer_03_elevated_roads/spritesheet.png",
    ),
    frameWidth: 512,
    frameHeight: 512,
    frameSequence: Object.freeze([0, 1, 2, 3]),
    displayHeight: 330,
    bottomY: 480,
    startX: -8,
    seamOverlap: 16,
    scrollFactor: 0.38,
    depth: -1,
  }),
  fenceObjects: Object.freeze({
    key: "dark-city-level-two-fence-objects",
    path: getAssetPath(
      "backgrounds",
      "dark_city_level_2/layer_04_foreground_fences/spritesheet.png",
    ),
    frameWidth: 512,
    frameHeight: 512,
    frameSequence: Object.freeze([0, 2, 1, 3]),
    displayHeight: 135,
    bottomY: 480,
    startX: 0,
    seamOverlap: 2,
    scrollFactor: 1,
    depth: -0.5,
  }),
  groundPlatform: Object.freeze({
    key: "dark-city-level-two-ground-platform",
    path: getAssetPath(
      "backgrounds",
      "dark_city_level_2/layer_05_ground_platform/spritesheet.png",
    ),
    frameWidth: 512,
    frameHeight: 512,
    frameSequence: Object.freeze([0, 1, 2, 3]),
    displayHeight: 220,
    bottomY: 650,
    startX: 0,
    seamOverlap: 12,
    scrollFactor: 1,
    depth: 0,
    surfaceOffsetY: 166,
  }),
});
