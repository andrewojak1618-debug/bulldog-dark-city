import Phaser from "phaser";
import { SCENES } from "../../../js/config/game-settings.js";

/**
 * Stellt die spätere erste Spielszene bereit.
 */
export class LevelOneScene extends Phaser.Scene {
  /**
   * Erstellt Level eins mit seinem eindeutigen Szenenschlüssel.
   */
  constructor() {
    super(SCENES.levelOne);
  }
}
