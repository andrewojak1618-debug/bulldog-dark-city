import { getAssetPath } from "./asset-paths.js";

/** Zentrale Grundwerte des vorbereiteten dritten Levels. */
export const LEVEL_THREE = Object.freeze({
  world: Object.freeze({
    width: 2_400,
    height: 600,
    backgroundColor: 0x160805,
  }),
  background: Object.freeze({
    key: "dark-city-level-three-background-orange-main-01",
    path: getAssetPath(
      "backgrounds",
      "dark_city_level_3/composites/level-three-orange-main-01.png",
    ),
    depth: -10,
  }),
  playerSpawn: Object.freeze({
    startX: 150,
    startY: 390,
  }),
  levelEntry: Object.freeze({
    startX: 30,
    targetX: 150,
    runSpeed: 190,
    groundSnapInsetY: 1,
    groundingVelocityY: 1,
  }),
  ground: Object.freeze({
    surfaceY: 536,
    collisionHeight: 60,
  }),
  menuHint: Object.freeze({
    x: 360,
    y: 24,
    text: "LEVEL 3 · ESC · ZURÜCK ZUM MENÜ",
    color: "#d7d2dc",
    fontFamily: "Arial",
    fontSize: "14px",
    depth: 100,
  }),
});
