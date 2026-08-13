import Phaser from "phaser";
import { MenuInputController } from
  "../input/menu-input-controller.class.js";
import { InputDeviceDetector } from
  "../input/input-device-detector.class.js";
import { MenuButton } from "./menu-button.class.js";
import {
  GAME_ENDSCREEN,
  resolveEndscreenResult,
} from "../../js/config/game-endscreen-settings.js";

/**
 * Defines the GameEndscreenOptions data structure.
 * @typedef {Object} GameEndscreenOptions
 * @property {string} result - The result value.
 * @property {Function} onRetry - The on retry value.
 * @property {Function} onMenu - The on menu value.
 */

/**
 * Manages game endscreen behavior.
 */
export class GameEndscreen extends Phaser.GameObjects.Container {
  /**
   * Creates a new instance.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {GameEndscreenOptions} options - The optional configuration values.
   */
  constructor(scene, options) {
    const { width, height } = scene.scale;
    super(scene, width / 2, height / 2);
    this.result = resolveEndscreenResult(options.result);
    this.createBackground(scene, width, height);
    this.createPanel(scene);
    this.createResultContent(scene);
    this.buttons = this.createButtons(scene, options);
    this.createInputHint(scene);
    scene.add.existing(this);
    this.setDepth(GAME_ENDSCREEN.depth);
    this.inputController = new MenuInputController(
      scene,
      this.buttons,
    );
  }

  /**
   * Creates background.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {number} width - The width in pixels.
   * @param {number} height - The height in pixels.
   * @returns {void} No value is returned.
   */
  createBackground(scene, width, height) {
    const settings = GAME_ENDSCREEN.background;
    this.add(scene.add.rectangle(
      0,
      0,
      width,
      height,
      settings.color,
      settings.alpha,
    ));
  }

  /**
   * Creates panel.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  createPanel(scene) {
    const settings = GAME_ENDSCREEN.panel;
    const panel = scene.add.graphics();
    panel.fillStyle(settings.fillColor, settings.fillAlpha);
    this.drawPanelRectangle(panel, settings, "fillRoundedRect");
    panel.lineStyle(
      settings.borderWidth,
      settings.borderColor,
      settings.borderAlpha,
    );
    this.drawPanelRectangle(panel, settings, "strokeRoundedRect");
    this.add(panel);
  }

  /**
   * Draws one layer of the endscreen panel.
   * @param {Phaser.GameObjects.Graphics} panel - The panel graphics object.
   * @param {object} settings - The panel settings.
   * @param {"fillRoundedRect"|"strokeRoundedRect"} method - The draw method.
   * @returns {void} No value is returned.
   */
  drawPanelRectangle(panel, settings, method) {
    panel[method](
      -settings.width / 2,
      -settings.height / 2,
      settings.width,
      settings.height,
      settings.radius,
    );
  }

  /**
   * Creates result content.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  createResultContent(scene) {
    const variant = GAME_ENDSCREEN.variants[this.result];
    const title = this.createResultText(
      scene, variant.title, GAME_ENDSCREEN.title, variant.titleColor,
    );
    const message = this.createResultText(
      scene, variant.message, GAME_ENDSCREEN.message,
      GAME_ENDSCREEN.message.color, "center",
    );
    this.add([title, message]);
  }

  /**
   * Creates one endscreen text element.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {string} text - The displayed text.
   * @param {object} settings - The text settings.
   * @param {string} color - The text color.
   * @param {string} [align] - The optional text alignment.
   * @returns {Phaser.GameObjects.Text} The created text object.
   */
  createResultText(scene, text, settings, color, align) {
    return scene.add.text(0, settings.y, text, {
      fontFamily: settings.fontFamily,
      fontSize: `${settings.fontSize}px`,
      color,
      ...(align ? { align } : {}),
    }).setOrigin(0.5);
  }

  /**
   * Creates buttons.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {GameEndscreenOptions} options - The optional configuration values.
   * @returns {MenuButton[]} The resulting collection.
   */
  createButtons(scene, options) {
    const settings = GAME_ENDSCREEN.buttons;
    const definitions = [
      { label: settings.retryLabel, action: options.onRetry },
      { label: settings.menuLabel, action: options.onMenu },
    ];
    return definitions.map((definition, index) =>
      this.createButton(scene, settings, definition, index)
    );
  }

  /**
   * Creates one endscreen menu button.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {object} settings - The button settings.
   * @param {object} definition - The button definition.
   * @param {number} index - The button index.
   * @returns {MenuButton} The created button.
   */
  createButton(scene, settings, definition, index) {
    const button = new MenuButton(scene, {
      x: 0,
      y: settings.y + index * (settings.height + settings.gap),
      width: settings.width,
      height: settings.height,
      label: definition.label,
      fontSize: settings.fontSize,
      centerLabel: true,
      onActivate: definition.action,
      onFocus: (focusedButton, pointer) =>
        this.focusButton(focusedButton, pointer),
    });
    this.add(button);
    return button;
  }

  /**
   * Focuses an endscreen button for the active pointer type.
   * @param {MenuButton} button - The focused button.
   * @param {Phaser.Input.Pointer} pointer - The triggering pointer.
   * @returns {void} No value is returned.
   */
  focusButton(button, pointer) {
    const inputType = pointer?.pointerType === "touch" ? "touch" : "mouse";
    this.inputController?.focusButton(button, inputType);
  }

  /**
   * Creates input hint.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  createInputHint(scene) {
    const settings = GAME_ENDSCREEN.hint;
    const text = InputDeviceDetector.isTouchLayout()
      ? settings.touchText
      : settings.desktopText;
    this.add(scene.add.text(0, settings.y, text, {
      fontFamily: settings.fontFamily,
      fontSize: `${settings.fontSize}px`,
      color: settings.color,
    }).setOrigin(0.5));
  }

  /**
   * Updates input.
   * @returns {void} No value is returned.
   */
  updateInput() {
    this.inputController?.update();
  }

  /**
   * Sets input enabled.
   * @param {boolean} enabled - The enabled value.
   * @returns {void} No value is returned.
   */
  setInputEnabled(enabled) {
    this.inputController?.setEnabled(enabled);
    this.buttons.forEach((button) => button.setDisabled(!enabled));
  }
}
