import { getAssetPath } from "./asset-paths.js";

/** Konfiguration der einsammelbaren und werfbaren Knochen. */
export const THROW_BONES = Object.freeze({
  depth: 12,
  projectileSpeed: 430,
  projectileLifetimeMs: 2_400,
  pickupSize: 81,
  projectileSize: 72,
  hitRangeX: 70,
  hitRangeY: 150,
  inventoryHud: Object.freeze({
    x: 706,
    y: 50,
    depth: 210,
    fontFamily: "Permanent Marker",
    fontSize: "14px",
    iconSize: 28,
    rowGap: 32,
    normalColor: "#e5c5b8",
    nuclearColor: "#83ff35",
    stroke: "#08050a",
    strokeThickness: 3,
  }),
  types: Object.freeze({
    normal: Object.freeze({
      key: "normal-throw-bone",
      animationKey: "normal-throw-bone-spin",
      path: getAssetPath(
        "sprites",
        "objects/normal_bone/throw/side/spritesheet.png",
      ),
      frameWidth: 256,
      frameHeight: 256,
      frameCount: 4,
      frameRate: 8,
      damage: 1,
      inputKey: "K",
    }),
    nuclear: Object.freeze({
      key: "nuclear-throw-bone",
      animationKey: "nuclear-throw-bone-spin",
      path: getAssetPath(
        "sprites",
        "objects/nuclear_bone/throw/side/spritesheet.png",
      ),
      frameWidth: 256,
      frameHeight: 256,
      frameCount: 4,
      frameRate: 8,
      damage: 2,
      inputKey: "L",
    }),
  }),
  placements: Object.freeze([
    Object.freeze({ type: "normal", x: 900, y: 445 }),
    Object.freeze({ type: "nuclear", x: 1_800, y: 445 }),
  ]),
});
