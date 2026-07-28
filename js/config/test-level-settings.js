/**
 * Zentrale Werte des technischen Level-One-Prototyps.
 */
export const TEST_LEVEL = Object.freeze({
  world: Object.freeze({
    width: 2400,
    height: 600,
    backgroundColor: 0x080d18,
  }),
  player: Object.freeze({
    startX: 150,
    startY: 390,
    displayWidth: 128,
    displayHeight: 128,
    bodyWidth: 104,
    bodyHeight: 64,
    bodyOffsetX: 12,
    bodyOffsetY: 60,
    moveSpeed: 250,
    jumpVelocity: -520,
    fallGravityBoost: 150,
    maxFallSpeed: 1050,
  }),
  camera: Object.freeze({
    lerpX: 0.1,
    lerpY: 0.12,
    deadzoneWidth: 220,
    deadzoneHeight: 110,
  }),
  assets: Object.freeze({
    groundPlatform: Object.freeze({
      key: "dark-city-ground-platform",
      path:
        "/img/tilesets/dark_city/layer_01_foreground/" +
        "ground_platform/spritesheet.png",
      frameWidth: 513,
      frameHeight: 306,
      frame: 0,
      surfaceOffsetY: 86,
      characterLaneOffsetY: 40,
    }),
    floatingPlatform: Object.freeze({
      key: "dark-city-floating-platform",
      path:
        "/img/tilesets/dark_city/layer_01_foreground/" +
        "floating_platforms/spritesheet.png",
      frameWidth: 320,
      frameHeight: 192,
      surfaceOffsetY: 32,
    }),
  }),
  platforms: Object.freeze([
    Object.freeze({ x: 1200, y: 570, width: 2400, height: 60 }),
    Object.freeze({
      x: 430,
      y: 415,
      width: 220,
      height: 28,
      visualFrame: 1,
    }),
    Object.freeze({
      x: 785,
      y: 331,
      width: 230,
      height: 28,
      visualFrame: 0,
      stepDown: Object.freeze({
        splitRatio: 0.43125,
        splitOffsetX: -2,
        dropY: 12,
      }),
    }),
    Object.freeze({
      x: 1110,
      y: 457,
      width: 280,
      height: 28,
      visualFrame: 3,
    }),
    Object.freeze({
      x: 1490,
      y: 359,
      width: 260,
      height: 28,
      visualFrame: 2,
      stepDown: Object.freeze({
        splitRatio: 0.45625,
        splitOffsetX: -3,
        dropY: 24,
      }),
    }),
    Object.freeze({
      x: 1850,
      y: 261,
      width: 250,
      height: 28,
      visualFrame: 1,
    }),
    Object.freeze({
      x: 2200,
      y: 429,
      width: 300,
      height: 28,
      visualFrame: 3,
    }),
  ]),
});
