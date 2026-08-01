import { getAssetPath } from "./asset-paths.js";

/**
 * Gemeinsame Framewerte der vorbereiteten Level-Items.
 */
const ITEM_FRAME = Object.freeze({
  width: 128,
  height: 128,
});

/**
 * Texturen, Animationen und Testpositionen der Level-Items.
 */
export const LEVEL_ITEMS = Object.freeze({
  depth: 8,
  textures: Object.freeze({
    health: Object.freeze({
      key: "item-extra-life-spin",
      path: getAssetPath(
        "sprites",
        "objects/extra_life/spin/none/spritesheet.png",
      ),
      frameWidth: ITEM_FRAME.width,
      frameHeight: ITEM_FRAME.height,
    }),
    coin: Object.freeze({
      key: "item-point-coin-spin",
      path: getAssetPath(
        "sprites",
        "objects/point_coin/spin/none/spritesheet.png",
      ),
      frameWidth: ITEM_FRAME.width,
      frameHeight: ITEM_FRAME.height,
    }),
    serum: Object.freeze({
      key: "item-mutation-serum-float",
      path: getAssetPath(
        "sprites",
        "objects/mutation_serum/float/none/spritesheet.png",
      ),
      frameWidth: ITEM_FRAME.width,
      frameHeight: ITEM_FRAME.height,
    }),
  }),
  animations: Object.freeze({
    health: Object.freeze({
      key: "item-extra-life-spin-animation",
      textureKey: "item-extra-life-spin",
      frames: Object.freeze([0, 1, 2, 3]),
      frameRate: 5,
    }),
    coin: Object.freeze({
      key: "item-point-coin-spin-animation",
      textureKey: "item-point-coin-spin",
      frames: Object.freeze([0, 1, 2, 3]),
      frameRate: 6,
    }),
    serum: Object.freeze({
      key: "item-mutation-serum-sway-animation",
      textureKey: "item-mutation-serum-float",
      frames: Object.freeze([0, 1, 2, 3, 4, 5, 6, 7]),
      frameRate: 7,
      yoyo: true,
    }),
  }),
  placements: Object.freeze([
    Object.freeze({ type: "health", x: 305, y: 445, size: 54 }),
    Object.freeze({ type: "coin", x: 430, y: 325, size: 50 }),
    Object.freeze({ type: "serum", x: 650, y: 235, size: 58 }),
  ]),
});
