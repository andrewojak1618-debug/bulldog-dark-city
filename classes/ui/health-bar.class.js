import Phaser from "phaser";
import { HUD } from "../../js/config/hud-settings.js";

/**
 * Manages health bar behavior.
 */
export class HealthBar extends Phaser.GameObjects.Container {
  /**
   * Creates a new instance.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {import("../systems/health-system.class.js").HealthSystem} system - The associated system instance.
   */
  constructor(scene, system) {
    const settings = HUD.health;
    super(scene, settings.x, settings.y);
    scene.add.existing(this);
    this.settings = settings;
    this.fillGraphics = scene.add.graphics();
    this.frame = this.createFrame(scene);
    this.valueText = this.createValueText(scene);
    this.add([this.fillGraphics, this.frame, this.valueText]);
    this.setScrollFactor(0).setDepth(HUD.depth);
    this.bindSystem(system);
  }

  /**
   * Creates frame.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {Phaser.GameObjects.Image} The resulting data object.
   */
  createFrame(scene) {
    return scene.add
      .image(0, 0, this.settings.textureKey)
      .setOrigin(0)
      .setDisplaySize(this.settings.width, this.settings.height);
  }

  /**
   * Creates value text.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {Phaser.GameObjects.Text} The resulting data object.
   */
  createValueText(scene) {
    const { fillX, fillY, fillWidth, fillHeight } = this.settings;
    return scene.add.text(
      fillX + fillWidth / 2,
      fillY + fillHeight / 2,
      "",
      this.settings.textStyle,
    ).setOrigin(0.5);
  }

  /**
   * Binds system.
   * @param {import("../systems/health-system.class.js").HealthSystem} system - The associated system instance.
   * @returns {void} No value is returned.
   */
  bindSystem(system) {
    const unsubscribe = system.onChange((current, maximum) => {
      this.updateValue(current, maximum);
    });
    this.once("destroy", unsubscribe);
  }

  /**
   * Updates value.
   * @param {number} current - The current value.
   * @param {number} maximum - The maximum value.
   * @returns {void} No value is returned.
   */
  updateValue(current, maximum) {
    const ratio = maximum > 0 ? Phaser.Math.Clamp(current / maximum, 0, 1) : 0;
    this.fillGraphics.clear();
    this.drawFill(this.settings.fillBackgroundColor,
      this.settings.fillBackgroundAlpha, 1);
    this.drawFill(this.settings.fillColor, 1, ratio);
    this.valueText.setText(`${current} / ${maximum}`);
  }

  /**
   * Draws one health fill layer.
   * @param {number} color - The fill color.
   * @param {number} alpha - The fill opacity.
   * @param {number} ratio - The normalized fill ratio.
   * @returns {void} No value is returned.
   */
  drawFill(color, alpha, ratio) {
    const settings = this.settings;
    this.fillGraphics.fillStyle(color, alpha);
    this.fillGraphics.fillRoundedRect(
      settings.fillX,
      settings.fillY,
      settings.fillWidth * ratio,
      settings.fillHeight,
      settings.fillRadius,
    );
  }
}
