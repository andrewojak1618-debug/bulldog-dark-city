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
  }),
  camera: Object.freeze({
    lerpX: 0.1,
    lerpY: 0.12,
    deadzoneWidth: 220,
    deadzoneHeight: 110,
  }),
  platforms: Object.freeze([
    Object.freeze({ x: 1200, y: 570, width: 2400, height: 60 }),
    Object.freeze({ x: 430, y: 455, width: 250, height: 28 }),
    Object.freeze({ x: 785, y: 395, width: 230, height: 28 }),
    Object.freeze({ x: 1110, y: 485, width: 280, height: 28 }),
    Object.freeze({ x: 1490, y: 415, width: 260, height: 28 }),
    Object.freeze({ x: 1850, y: 345, width: 250, height: 28 }),
    Object.freeze({ x: 2200, y: 465, width: 300, height: 28 }),
  ]),
});

export const BULLDOG_TEST_TEXTURE = Object.freeze({
  key: "bulldog-test",
  path:
    "/img/sprites/characters/bulldog_normal/run/side/" +
    "bulldog_normal_run_side_01.png",
});
