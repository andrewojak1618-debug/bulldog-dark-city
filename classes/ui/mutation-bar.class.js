import Phaser from "phaser";
import { HUD } from "../../js/config/hud-settings.js";

/**
 * Manages mutation bar behavior.
 */
export class MutationBar extends Phaser.GameObjects.Container {
  /**
   * Creates a new instance.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   */
  constructor(scene) {
    const settings = HUD.mutation;
    super(scene, settings.hiddenX, settings.y);
    scene.add.existing(this);
    this.energy = { value: 0 };
    this.energyTween = null;
    this.energyGraphics = scene.add.graphics();
    const frame = scene.add.image(0, 0, settings.textureKey)
      .setOrigin(0)
      .setDisplaySize(settings.width, settings.height);
    this.add([this.energyGraphics, frame]);
    this.setAlpha(0).setScrollFactor(0).setDepth(HUD.depth);
    this.once("destroy", () => this.energyTween?.stop());
  }

  /**
   * Shows the current state.
   * @returns {Phaser.Tweens.Tween} The resulting value.
   */
  show() {
    const settings = HUD.mutation;
    this.setVisible(true);
    return this.scene.tweens.add({
      targets: this,
      x: settings.x,
      alpha: 1,
      delay: settings.entryDelayMs,
      duration: settings.entryDurationMs,
      ease: "Back.easeOut",
    });
  }

  /**
   * Draws energy.
   * @param {number} value - The value to process.
   * @returns {void} No value is returned.
   */
  drawEnergy(value) {
    const settings = HUD.mutation;
    const ratio = Phaser.Math.Clamp(value, 0, 1);
    const width = settings.fillWidth * ratio;
    this.energyGraphics.clear();
    if (width <= 0) return;
    this.drawEnergyGlow(width);
    this.drawEnergyCore(width);
  }

  /**
   * Draws energy glow.
   * @param {number} width - The width in pixels.
   * @returns {void} No value is returned.
   */
  drawEnergyGlow(width) {
    const settings = HUD.mutation;
    this.energyGraphics.fillStyle(settings.fillGlowColor, 0.3);
    this.energyGraphics.fillRoundedRect(
      settings.fillX - 2,
      settings.fillY - 2,
      width + 4,
      settings.fillHeight + 4,
      settings.fillRadius,
    );
  }

  /**
   * Draws energy core.
   * @param {number} width - The width in pixels.
   * @returns {void} No value is returned.
   */
  drawEnergyCore(width) {
    const settings = HUD.mutation;
    this.energyGraphics.fillStyle(settings.fillColor, settings.fillAlpha);
    this.energyGraphics.fillRoundedRect(
      settings.fillX,
      settings.fillY,
      width,
      settings.fillHeight,
      settings.fillRadius,
    );
  }

  /**
   * Handles fill.
   */
  fill() {
    this.energyTween?.stop();
    this.energy.value = 1;
    this.drawEnergy(1);
  }

  /**
   * Handles drain.
   * @param {number} duration - The duration in milliseconds.
   * @param {() => void} onComplete - The callback invoked after completion.
   * @returns {Phaser.Tweens.Tween} The resulting value.
   */
  drain(duration, onComplete) {
    this.energyTween?.stop();
    this.energyTween = this.scene.tweens.add({
      targets: this.energy,
      value: 0,
      duration,
      ease: "Linear",
      onUpdate: () => this.drawEnergy(this.energy.value),
      onComplete,
    });
    return this.energyTween;
  }

  /**
   * Hides the current state.
   * @returns {Phaser.Tweens.Tween} The resulting value.
   */
  hide() {
    const settings = HUD.mutation;
    return this.scene.tweens.add({
      targets: this,
      x: settings.hiddenX,
      alpha: 0,
      duration: settings.exitDurationMs,
      ease: "Back.easeIn",
      onComplete: () => this.setVisible(false),
    });
  }
}
