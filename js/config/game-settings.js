/** @type {{width: number, height: number}} */
export const GAME_DIMENSIONS = Object.freeze({
  width: 720,
  height: 480,
});

/**
 * Defines the render settings configuration.
 */
export const RENDER_SETTINGS = Object.freeze({
  maxTextResolution: 2,
});

/**
 * Returns text render resolution.
 * @param {number} [pixelRatio=globalThis.devicePixelRatio] - The pixel ratio value.
 * @returns {number} The resulting numeric value.
 */
export function getTextRenderResolution(
  pixelRatio = globalThis.devicePixelRatio ?? 1,
) {
  const safeRatio = Number.isFinite(pixelRatio) ? pixelRatio : 1;
  return Math.min(Math.max(safeRatio, 1), RENDER_SETTINGS.maxTextResolution);
}

/** @type {{boot: string, menu: string, levelOne: string, levelTwo: string, levelThree: string, gameOver: string, victory: string, endscreen: string}} */
export const SCENES = Object.freeze({
  boot: "BootScene",
  menu: "MenuScene",
  levelOne: "LevelOneScene",
  levelTwo: "LevelTwoScene",
  levelThree: "LevelThreeScene",
  gameOver: "GameOverScene",
  victory: "VictoryScene",
  endscreen: "GameEndscreenScene",
});
