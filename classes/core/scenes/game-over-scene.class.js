import Phaser from "phaser";
import { SCENES } from "../../../js/config/game-settings.js";

/**
 * Stellt die spätere Game-Over-Szene bereit.
 */
export class GameOverScene extends Phaser.Scene {
  /**
   * Erstellt die Game-Over-Szene mit ihrem eindeutigen Szenenschlüssel.
   */
  constructor() {
    super(SCENES.gameOver);
  }
}
