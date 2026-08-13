import Phaser from "phaser";
import { HUD } from "../../js/config/hud-settings.js";

/**
 * Manages collectible counter behavior.
 */
export class CollectibleCounter extends Phaser.GameObjects.Container {
  /**
   * Creates a new instance.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {string} key - The lookup key.
   * @param {{x: number, y: number, width: number, height: number, textX: number, textY: number, textureKey: string}} settings - The configuration values to use.
   * @param {import( "../systems/collectible-system.class.js" ).CollectibleSystem} system - The associated system instance.
   */
  constructor(scene, key, settings, system) {
    super(scene, settings.x, settings.y);
    scene.add.existing(this);
    this.key = key;
    this.settings = settings;
    this.initializeFillState();
    this.fillGraphics = this.createFillGraphics(scene, settings);
    const frame = this.createFrame(scene, settings);
    this.valueText = this.createValueText(scene, settings);
    this.add([this.fillGraphics, frame, this.valueText].filter(Boolean));
    this.setScrollFactor(0).setDepth(HUD.depth);
    this.setInitialValue(system.getCount(key));
    this.bindSystem(system);
    this.once("destroy", () => this.fillTween?.stop());
  }

  /**
   * Initializes collectible fill animation state.
   * @returns {void} No value is returned.
   */
  initializeFillState() {
    this.fillProgress = { value: 0 };
    this.fillTween = null;
  }

  /**
   * Sets initial value.
   * @param {number} count - The count value.
   * @returns {void} No value is returned.
   */
  setInitialValue(count) {
    this.valueText.setText(String(count));
    const fill = this.settings.fill;
    if (!fill || !this.fillGraphics) return;

    const ratio = Phaser.Math.Clamp(count / fill.maximum, 0, 1);
    this.fillProgress.value = ratio;
    this.drawFill(ratio);
  }

  /**
   * Creates frame.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {object} settings - The configuration values to use.
   * @returns {Phaser.GameObjects.Image} The resulting data object.
   */
  createFrame(scene, settings) {
    return scene.add.image(0, 0, settings.textureKey)
      .setOrigin(0)
      .setDisplaySize(settings.width, settings.height);
  }

  /**
   * Creates fill graphics.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {object} settings - The configuration values to use.
   * @returns {Phaser.GameObjects.Graphics|null} The resulting data object.
   */
  createFillGraphics(scene, settings) {
    return settings.fill ? scene.add.graphics() : null;
  }

  /**
   * Creates value text.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {object} settings - The configuration values to use.
   * @returns {Phaser.GameObjects.Text} The resulting data object.
   */
  createValueText(scene, settings) {
    return scene.add.text(
      settings.textX,
      settings.textY,
      "0",
      HUD.collectibleTextStyle,
    ).setOrigin(0.5);
  }

  /**
   * Binds system.
   * @param {import( "../systems/collectible-system.class.js" ).CollectibleSystem} system - The associated system instance.
   * @returns {void} No value is returned.
   */
  bindSystem(system) {
    const unsubscribe = system.onChange((changedKey, count) => {
      if (changedKey === this.key) {
        this.valueText.setText(String(count));
        this.updateFill(count);
      }
    });
    this.once("destroy", unsubscribe);
  }

  /**
   * Updates fill.
   * @param {number} count - The count value.
   * @returns {void} No value is returned.
   */
  updateFill(count) {
    const fill = this.settings.fill;
    if (!fill || !this.fillGraphics) return;

    const targetRatio = Phaser.Math.Clamp(count / fill.maximum, 0, 1);
    this.fillTween?.stop();
    this.fillTween = this.createFillTween(targetRatio);
  }

  /**
   * Creates fill tween.
   * @param {number} targetRatio - The target ratio value.
   * @returns {Phaser.Tweens.Tween} The created instance.
   */
  createFillTween(targetRatio) {
    return this.scene.tweens.add({
      targets: this.fillProgress,
      value: targetRatio,
      duration: this.settings.fill.durationMs,
      ease: "Sine.easeInOut",
      onUpdate: () => this.drawFill(this.fillProgress.value),
      onComplete: () => this.finishFillTween(targetRatio),
    });
  }

  /**
   * Completes fill tween.
   * @param {number} targetRatio - The target ratio value.
   * @returns {void} No value is returned.
   */
  finishFillTween(targetRatio) {
    this.fillProgress.value = targetRatio;
    this.drawFill(targetRatio);
    this.fillTween = null;
  }

  /**
   * Draws fill.
   * @param {number} ratio - The normalized value between zero and one.
   * @returns {void} No value is returned.
   */
  drawFill(ratio) {
    const fill = this.settings.fill;
    const filledWidth = fill.width * ratio;
    this.fillGraphics.clear();
    if (filledWidth <= 0) return;

    const points = this.getFillPoints(fill, filledWidth, ratio);
    this.applyFillStyle(fill);
    this.fillGraphics.fillPoints(points, true);
  }

  /**
   * Returns fill points.
   * @param {object} fill - The fill value.
   * @param {number} filledWidth - The filled width value.
   * @param {number} ratio - The normalized value between zero and one.
   * @returns {Phaser.Geom.Point[]} The resulting collection.
   */
  getFillPoints(fill, filledWidth, ratio) {
    const points = [
      new Phaser.Geom.Point(fill.x, fill.y + fill.height),
      new Phaser.Geom.Point(fill.x + filledWidth, fill.y + fill.height),
    ];
    for (let offset = filledWidth; offset >= 0; offset -= 2) {
      const waveY = this.getWaveY(fill, offset, ratio);
      points.push(new Phaser.Geom.Point(fill.x + offset, waveY));
    }
    return points;
  }

  /**
   * Returns wave y.
   * @param {object} fill - The fill value.
   * @param {number} offset - The offset value.
   * @param {number} ratio - The normalized value between zero and one.
   * @returns {number} The resulting numeric value.
   */
  getWaveY(fill, offset, ratio) {
    const phase = (offset / fill.waveLength + ratio) * Math.PI * 2;
    return fill.y + Math.sin(phase) * fill.waveAmplitude;
  }

  /**
   * Applies fill style.
   * @param {object} fill - The fill value.
   * @returns {void} No value is returned.
   */
  applyFillStyle(fill) {
    this.fillGraphics.fillGradientStyle(
      fill.colorLeft,
      fill.colorRight,
      fill.colorBottomLeft,
      fill.colorBottomRight,
      fill.alpha,
    );
  }
}
