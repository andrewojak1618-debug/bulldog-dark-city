import Phaser from "phaser";
import { ViewportController } from
  "./classes/core/controllers/viewport-controller.class.js";
import { MuteButtonController } from
  "./classes/core/controllers/mute-button-controller.class.js";
import { globalMuteSystem } from
  "./classes/systems/global-mute-system.class.js";
import { GAME_CONFIG } from "./js/config/game-config.js";

/**
 * Wartet auf die Menüschrift, bevor Phaser seine Texturen erzeugt.
 * @returns {Promise<void>}
 */
async function startGame() {
  await document.fonts.load('20px "Permanent Marker"');
  const game = new Phaser.Game(GAME_CONFIG);
  globalMuteSystem.attachGame(game);
  new MuteButtonController(globalMuteSystem);
  new ViewportController(game);
}

startGame();
