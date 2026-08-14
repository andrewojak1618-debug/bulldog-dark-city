import { getAssetPath } from "./asset-paths.js";

/**
 * Defines the item frame configuration.
 */
const ITEM_FRAME = Object.freeze({
  width: 128,
  height: 128,
});

/**
 * Defines the level items configuration.
 */
export const LEVEL_ITEMS = Object.freeze({
  depth: 8,
  pickupTweenMs: 140,
  feedback: Object.freeze({
    healthFull: Object.freeze({
      text: "LEBEN BEREITS VOLL",
      cooldownMs: 2_500,
      durationMs: 1_100,
      riseY: 22,
      fontFamily: "Permanent Marker",
      fontSize: 16,
      color: "#ffd6e8",
      backgroundColor: "rgba(20, 5, 18, 0.88)",
      paddingX: 8,
      paddingY: 4,
    }),
  }),
  pickupEffects: Object.freeze({
    goldenCoin: Object.freeze({
      key: "item-golden-coin-pickup-splash-animation",
      textureKey: "item-golden-coin-pickup-splash",
      path: getAssetPath(
        "sprites",
        "objects/golden_coin/pickup_splash/horizontal/spritesheet.png",
      ),
      soundKey: "item-golden-coin-pickup-sound",
      soundPath: getAssetPath(
        "audio",
        "sfx/items/golden-coin-pickup.ogg",
      ),
      soundVolume: 0.4,
      frameWidth: 256,
      frameHeight: 256,
      frames: Object.freeze([0, 1, 2, 3, 4, 5]),
      frameRate: 9,
      repeat: 0,
      displayWidth: 220,
      displayHeight: 220,
    }),
    serum: Object.freeze({
      key: "item-mutation-serum-pickup-splash-animation",
      textureKey: "item-mutation-serum-pickup-splash",
      path: getAssetPath(
        "sprites",
        "objects/mutation_serum/pickup_splash/horizontal/spritesheet.png",
      ),
      soundKey: "item-mutation-serum-pickup-sound",
      soundPath: getAssetPath(
        "audio",
        "sfx/items/serum-pickup.ogg",
      ),
      soundVolume: 0.55,
      frameWidth: 128,
      frameHeight: 64,
      frames: Object.freeze([0, 1, 2, 3]),
      frameRate: 8,
      repeat: 0,
      displayWidth: 120,
      displayHeight: 60,
      angle: 90,
      offsetY: -60,
    }),
    health: Object.freeze({
      key: "item-extra-life-pickup-splash-animation",
      textureKey: "item-extra-life-pickup-splash",
      path: getAssetPath(
        "sprites",
        "objects/extra_life/pickup_splash/horizontal/spritesheet.png",
      ),
      soundKey: "item-extra-life-pickup-sound",
      soundPaths: Object.freeze([
        getAssetPath(
          "audio",
          "sfx/items/health-heartbeat-pickup.mp3",
        ),
        getAssetPath(
          "audio",
          "sfx/items/health-heartbeat-pickup.ogg",
        ),
      ]),
      soundVolume: 0.9,
      frameWidth: 128,
      frameHeight: 64,
      frames: Object.freeze([0, 1, 2, 3]),
      frameRate: 8,
      repeat: 0,
      displayWidth: 120,
      displayHeight: 60,
    }),
    coin: Object.freeze({
      key: "item-point-coin-pickup-splash-animation",
      textureKey: "item-point-coin-pickup-splash",
      path: getAssetPath(
        "sprites",
        "objects/point_coin/pickup_splash/horizontal/spritesheet.png",
      ),
      soundKey: "item-point-coin-pickup-sound",
      soundPath: getAssetPath(
        "audio",
        "sfx/items/purple-coin-pickup.ogg",
      ),
      soundVolume: 0.6,
      frameWidth: 128,
      frameHeight: 64,
      frames: Object.freeze([0, 1, 2, 3]),
      frameRate: 8,
      repeat: 0,
      displayWidth: 96,
      displayHeight: 48,
    }),
  }),
  body: Object.freeze({
    width: 88,
    height: 88,
    offsetX: 20,
    offsetY: 20,
  }),
  effects: Object.freeze({
    health: Object.freeze({ healthAmount: 20 }),
    goldenCoin: Object.freeze({
      collectibleKey: "coins",
      amount: 100,
      maximum: 1000,
    }),
    coin: Object.freeze({
      collectibleKey: "coins",
      amount: 1,
      maximum: 1000,
    }),
    serum: Object.freeze({
      collectibleKey: "serum",
      amount: 1,
      maximum: 2,
      blockAtMaximum: true,
    }),
  }),
  textures: Object.freeze({
    goldenCoin: Object.freeze({
      key: "item-golden-coin-spin",
      path: getAssetPath(
        "sprites",
        "objects/golden_coin/spin/none/spritesheet.png",
      ),
      frameWidth: 256,
      frameHeight: 256,
    }),
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
    goldenCoin: Object.freeze({
      key: "item-golden-coin-spin-animation",
      textureKey: "item-golden-coin-spin",
      frames: Object.freeze([0, 1, 2, 3]),
      frameRate: 6,
    }),
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
  placements: Object.freeze({
    initial: Object.freeze([
      Object.freeze({ type: "coin", x: 430, y: 325, size: 50 }),
      Object.freeze({ type: "serum", x: 650, y: 235, size: 58 }),
    ]),
  }),
  drops: Object.freeze({
    dogCatcherHealth: Object.freeze({
      type: "health",
      size: 54,
      offsetX: 0,
      offsetY: -80,
      targetY: 445,
      durationMs: 480,
      ease: "Bounce.easeOut",
    }),
  }),
});
