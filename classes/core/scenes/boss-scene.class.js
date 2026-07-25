import Phaser from "phaser";
import { SCENES } from "../../../js/config/game-settings.js";

/**
 * Stellt die spätere Bosskampfszene bereit.
 */
export class BossScene extends Phaser.Scene {
  /**
   * Erstellt die Bosskampfszene mit ihrem eindeutigen Szenenschlüssel.
   */
  constructor() {
    super(SCENES.boss);
  }
}
