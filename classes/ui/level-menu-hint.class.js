import Phaser from "phaser";
import { HUD } from "../../js/config/hud-settings.js";

/**
 * Manages level menu hint behavior.
 */
export class LevelMenuHint extends Phaser.GameObjects.Text {
  /**
   * Creates a new instance.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {number} levelNumber - The level number value.
   */
  constructor(scene, levelNumber) {
    const settings = HUD.levelMenuHint;
    const text = settings.textTemplate.replace("{level}", levelNumber);
    super(scene, settings.x, settings.y, text, {
      color: settings.color,
      fontFamily: settings.fontFamily,
      fontSize: settings.fontSize,
    });
    scene.add.existing(this);
    this.setOrigin(0.5).setScrollFactor(0).setDepth(settings.depth);
  }
}
