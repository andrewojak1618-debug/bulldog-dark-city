/**
 * Enthält die zentralen Abmessungen des Phaser-Canvas.
 * @type {{width: number, height: number}}
 */
export const GAME_DIMENSIONS = Object.freeze({
  width: 720,
  height: 480,
});

/**
 * Enthält die eindeutigen Schlüssel aller Spielszenen.
 * @type {{boot: string, menu: string, levelOne: string, levelTwo: string,
 * levelThree: string, boss: string, gameOver: string}}
 */
export const SCENES = Object.freeze({
  boot: "BootScene",
  menu: "MenuScene",
  levelOne: "LevelOneScene",
  levelTwo: "LevelTwoScene",
  levelThree: "LevelThreeScene",
  boss: "BossScene",
  gameOver: "GameOverScene",
});
