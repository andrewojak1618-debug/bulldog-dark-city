import Phaser from "phaser";
import { COLLECTIBLE_KEYS, HUD } from "../../js/config/hud-settings.js";
import { InputDeviceDetector } from
  "../input/input-device-detector.class.js";

/**
 * Manages mutation ready prompt behavior.
 */
export class MutationReadyPrompt extends Phaser.GameObjects.Container {
  /**
   * Creates a new instance.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {import("../systems/collectible-system.class.js").CollectibleSystem} collectibles - The collectibles value.
   */
  constructor(scene, collectibles) {
    const settings = HUD.mutationReady;
    super(scene, settings.x, settings.y);
    scene.add.existing(this);
    this.settings = settings;
    this.pulseTween = null;
    this.isReady = false;
    this.add(this.createContent(scene));
    this.setScrollFactor(0).setDepth(HUD.depth).setVisible(false);
    this.bindCollectibles(collectibles);
  }

  /**
   * Creates content.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {Phaser.GameObjects.GameObject[]} The resulting collection.
   */
  createContent(scene) {
    if (InputDeviceDetector.isTouchLayout()) {
      return [this.createTouchLabel(scene)];
    }
    const keyCap = this.createKeyCap(scene);
    const keyText = scene.add.text(24, 12, "M", this.settings.keyStyle)
      .setOrigin(0.5);
    const label = scene.add.text(55, 12, "MUTATION BEREIT", this.settings.labelStyle)
      .setOrigin(0, 0.5);
    return [keyCap, keyText, label];
  }

  /**
   * Creates the touch-layout mutation label.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {Phaser.GameObjects.Text} The touch label.
   */
  createTouchLabel(scene) {
    return scene.add.text(0, 12, "PRESS M MUTATION",
      this.settings.labelStyle).setOrigin(0, 0.5);
  }

  /**
   * Creates key cap.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {Phaser.GameObjects.Graphics} The resulting data object.
   */
  createKeyCap(scene) {
    const { keyWidth, keyHeight } = this.settings;
    return scene.add.graphics()
      .fillStyle(0x050308, 0.55)
      .fillRoundedRect(2, 3, keyWidth, keyHeight, 4)
      .lineStyle(1, 0xb52cff, 0.95)
      .fillStyle(0x302a35, 0.96)
      .fillRoundedRect(0, 0, keyWidth, keyHeight, 4)
      .strokeRoundedRect(0, 0, keyWidth, keyHeight, 4);
  }

  /**
   * Binds collectibles.
   * @param {import("../systems/collectible-system.class.js").CollectibleSystem} collectibles - The collectibles value.
   * @returns {void} No value is returned.
   */
  bindCollectibles(collectibles) {
    const update = (key, count) => {
      if (key === COLLECTIBLE_KEYS.serum) this.setReady(count);
    };
    const unsubscribe = collectibles.onChange(update);
    this.setReady(collectibles.getCount(COLLECTIBLE_KEYS.serum));
    this.once("destroy", () => {
      unsubscribe();
      this.pulseTween?.stop();
    });
  }

  /**
   * Sets ready.
   * @param {number} count - The count value.
   * @returns {void} No value is returned.
   */
  setReady(count) {
    const isReady = count >= HUD.serum.fill.maximum;
    this.isReady = isReady;
    this.setVisible(isReady);
    if (isReady && !this.pulseTween) this.startPulse();
    if (!isReady) this.stopPulse();
  }

  /**
   * Restores visibility.
   */
  restoreVisibility() {
    this.setVisible(this.isReady);
  }

  /**
   * Starts pulse.
   */
  startPulse() {
    this.setAlpha(this.settings.pulseAlphaMax);
    this.pulseTween = this.scene.tweens.add({
      targets: this,
      alpha: this.settings.pulseAlphaMin,
      duration: this.settings.pulseDurationMs,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1,
    });
  }

  /**
   * Stops pulse.
   */
  stopPulse() {
    this.pulseTween?.stop();
    this.pulseTween = null;
    this.setAlpha(this.settings.pulseAlphaMax);
  }
}
