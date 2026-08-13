import Phaser from "phaser";
import { TOUCH_CONTROLS } from "../../js/config/touch-control-settings.js";

/**
 * Manages touch control button behavior.
 */
export class TouchControlButton extends Phaser.GameObjects.Container {
  /**
   * Creates a new instance.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Object} settings - The configuration values to use.
   * @param {Function} onStateChange - The on state change value.
   */
  constructor(scene, settings, onStateChange) {
    super(scene, settings.x, settings.y);
    scene.add.existing(this);
    this.initializeState(settings, onStateChange);
    this.createContent(scene);
    this.configureInteraction();
    this.draw();
  }

  /**
   * Initializes touch button state.
   * @param {object} settings - The button settings.
   * @param {Function} onStateChange - The state callback.
   * @returns {void} No value is returned.
   */
  initializeState(settings, onStateChange) {
    this.settings = settings;
    this.onStateChange = onStateChange;
    this.isPressed = false;
    this.isEnabled = true;
    this.isControlVisible = true;
  }

  /**
   * Creates the touch button display content.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  createContent(scene) {
    this.background = scene.add.graphics();
    this.label = this.createLabel(scene);
    this.add([this.background, this.label]);
  }

  /**
   * Configures touch button interaction.
   * @returns {void} No value is returned.
   */
  configureInteraction() {
    const size = this.settings.size;
    this.setSize(size, size)
      .setScrollFactor(0)
      .setDepth(TOUCH_CONTROLS.depth)
      .setInteractive({ useHandCursor: false });
    this.bindPointerEvents();
  }

  /**
   * Creates label.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {Phaser.GameObjects.Text} The resulting data object.
   */
  createLabel(scene) {
    return scene.add.text(0, 0, this.settings.label, {
      fontFamily: TOUCH_CONTROLS.fontFamily,
      fontSize: `${this.settings.fontSize}px`,
      color: TOUCH_CONTROLS.textColor,
      stroke: TOUCH_CONTROLS.strokeColor,
      strokeThickness: TOUCH_CONTROLS.strokeThickness,
    }).setOrigin(0.5);
  }

  /**
   * Binds pointer events.
   * @returns {void} No value is returned.
   */
  bindPointerEvents() {
    this.on("pointerdown", (_pointer, _localX, _localY, event) => {
      event?.stopPropagation();
      this.press();
    });
    this.on("pointerup", () => this.release());
    this.on("pointerupoutside", () => this.release());
  }

  /**
   * Handles press.
   * @returns {void} No value is returned.
   */
  press() {
    if (!this.isEnabled || this.isPressed) return;
    this.isPressed = true;
    this.onStateChange(this.settings.action, true);
    this.draw();
  }

  /**
   * Handles release.
   * @returns {void} No value is returned.
   */
  release() {
    if (!this.isPressed) return;
    this.isPressed = false;
    this.onStateChange(this.settings.action, false);
    this.draw();
  }

  /**
   * Sets control enabled.
   * @param {boolean} enabled - The enabled value.
   * @returns {void} No value is returned.
   */
  setControlEnabled(enabled) {
    if (!enabled) this.release();
    this.isEnabled = enabled;
    if (this.input) {
      this.input.enabled = enabled && this.isControlVisible;
    }
    this.draw();
  }

  /**
   * Sets control visible.
   * @param {boolean} visible - The visible value.
   * @returns {void} No value is returned.
   */
  setControlVisible(visible) {
    if (!visible) this.release();
    this.isControlVisible = visible;
    this.setVisible(visible);
    if (this.input) {
      this.input.enabled = visible && this.isEnabled;
    }
  }

  /**
   * Draws the current state.
   * @returns {void} No value is returned.
   */
  draw() {
    const style = TOUCH_CONTROLS;
    const radius = this.settings.size / 2;
    const borderColor = this.isPressed ? style.pressedColor : style.borderColor;
    const alpha = this.isEnabled ?
      (this.isPressed ? style.pressedAlpha : style.idleAlpha) :
      style.disabledAlpha;
    this.background.clear()
      .fillStyle(style.backgroundColor, alpha)
      .fillCircle(0, 0, radius)
      .lineStyle(2, borderColor, alpha + 0.2)
      .strokeCircle(0, 0, radius - 1);
    this.label.setAlpha(alpha + 0.2);
  }
}
