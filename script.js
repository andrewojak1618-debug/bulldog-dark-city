import Phaser from "phaser";
import { GAME_CONFIG } from "./js/config/game-config.js";

/**
 * Wartet auf die Menüschrift, bevor Phaser seine Texturen erzeugt.
 * @returns {Promise<void>}
 */
async function startGame() {
  await document.fonts.load('20px "Permanent Marker"');
  new Phaser.Game(GAME_CONFIG);
}

startGame();
