import Phaser from "phaser";
import {
  MENU_BUTTON_CONTENT,
  MENU_BUTTON_STATE,
  MENU_BUTTON_STYLE,
} from "../../js/config/menu-button-style.js";
import { getTornButtonPoints } from "../../js/utils/menu-button-shape.js";

/**
 * Defines the MenuButtonOptions data structure.
 * @typedef {Object} MenuButtonOptions
 * @property {number} x - The horizontal position.
 * @property {number} y - The vertical position.
 * @property {number} width - The width in pixels.
 * @property {number} height - The height in pixels.
 * @property {string} label - The label value.
 * @property {string} [fontSize] - The font size value.
 * @property {string|null} [iconKey=null] - The icon key value.
 * @property {{x: number, y: number, width: number, height: number}|null} [iconCrop=null] - The icon crop value.
 * @property {number} [iconOffsetY=0] - The icon offset y value.
 * @property {number} [iconSize=40] - The icon size value.
 * @property {number} [hitHeight] - The hit height value.
 * @property {boolean} [centerLabel=false] - The center label value.
 * @property {Function|null} [onActivate=null] - The on activate value.
 * @property {Function|null} [onFocus=null] - The on focus value.
 * @property {boolean} [selected=false] - The selected value.
 * @property {boolean} [disabled=false] - The disabled value.
 */

/**
 * Manages menu button behavior.
 */
export class MenuButton extends Phaser.GameObjects.Container {
  /**
   * Creates a new instance.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {MenuButtonOptions} options - The optional configuration values.
   */
  constructor(scene, options) {
    super(scene, options.x, options.y);
    this.initializeOptions(options);
    this.createContent(scene, options);
    this.finishSetup(scene, options);
  }

  /**
   * Initializes button options and state.
   * @param {MenuButtonOptions} options - The button options.
   * @returns {void} No value is returned.
   */
  initializeOptions(options) {
    this.buttonWidth = options.width;
    this.buttonHeight = options.height;
    this.iconSize = options.iconSize ?? MENU_BUTTON_CONTENT.iconSize;
    this.iconOffsetY = options.iconOffsetY ?? 0;
    this.centerLabel = options.centerLabel ?? false;
    this.onActivate = options.onActivate ?? null;
    this.onFocus = options.onFocus ?? null;
    this.setInitialState(options);
  }

  /**
   * Creates the button display content.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {MenuButtonOptions} options - The button options.
   * @returns {void} No value is returned.
   */
  createContent(scene, options) {
    this.background = scene.add.graphics();
    this.label = this.createLabel(scene, options.label, options.fontSize);
    this.icon = this.createIcon(scene, options.iconKey, options.iconCrop);
    this.addContent();
    this.layoutContent();
  }

  /**
   * Completes button registration and interaction setup.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {MenuButtonOptions} options - The button options.
   * @returns {void} No value is returned.
   */
  finishSetup(scene, options) {
    this.setSize(options.width, options.hitHeight ?? options.height);
    scene.add.existing(this);
    this.configureInteraction();
    this.renderState();
  }

  /**
   * Sets initial state.
   * @param {MenuButtonOptions} options - The optional configuration values.
   * @returns {void} No value is returned.
   */
  setInitialState(options) {
    this.isSelected = options.selected ?? false;
    this.isDisabled = options.disabled ?? false;
    this.isPointerOver = false;
    this.isPressed = false;
  }

  /**
   * Creates label.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {string} label - The label value.
   * @param {string|undefined} fontSize - The font size value.
   * @returns {Phaser.GameObjects.Text} The resulting data object.
   */
  createLabel(scene, label, fontSize) {
    return scene.add
      .text(0, 0, label, {
        fontFamily: MENU_BUTTON_CONTENT.fontFamily,
        fontSize: fontSize ?? MENU_BUTTON_CONTENT.fontSize,
        color: MENU_BUTTON_STYLE.normal.textColor,
      })
      .setOrigin(0, 0.5);
  }

  /**
   * Creates icon.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {string|null|undefined} iconKey - The icon key value.
   * @param {{x: number, y: number, width: number, height: number} |null|undefined} iconCrop - The icon crop value.
   * @returns {Phaser.GameObjects.Image|null} The resulting data object.
   */
  createIcon(scene, iconKey, iconCrop) {
    if (!iconKey) {
      return null;
    }

    const icon = scene.add.image(0, 0, iconKey);

    if (!iconCrop) {
      return icon.setDisplaySize(
        this.iconSize,
        this.iconSize,
      );
    }

    return this.cropIcon(icon, iconCrop);
  }

  /**
   * Handles crop icon.
   * @param {Phaser.GameObjects.Image} icon - The icon value.
   * @param {{x: number, y: number, width: number, height: number}} crop - The crop value.
   * @returns {Phaser.GameObjects.Image} The resulting data object.
   */
  cropIcon(icon, crop) {
    const displaySize = this.getIconDisplaySize(crop);
    icon.setCrop(crop.x, crop.y, crop.width, crop.height);
    return icon.setDisplaySize(displaySize.width, displaySize.height);
  }

  /**
   * Returns icon display size.
   * @param {{width: number, height: number}} crop - The crop value.
   * @returns {{width: number, height: number}} The resulting numeric value.
   */
  getIconDisplaySize({ width, height }) {
    const maxDimension = Math.max(width, height);
    const scale = this.iconSize / maxDimension;
    return {
      width: width * scale,
      height: height * scale,
    };
  }

  /**
   * Adds content.
   * @returns {void} No value is returned.
   */
  addContent() {
    this.add([this.background, this.label]);

    if (this.icon) {
      this.add(this.icon);
    }
  }

  /**
   * Handles layout content.
   * @returns {void} No value is returned.
   */
  layoutContent() {
    if (this.centerLabel && !this.icon) {
      this.label.setOrigin(0.5);
      this.label.setX(0);
      return;
    }

    const left = -this.buttonWidth / 2 + MENU_BUTTON_CONTENT.horizontalPadding;
    this.label.setX(this.getLabelPosition(left));

    if (this.icon) {
      this.icon.setPosition(
        left + this.iconSize / 2,
        this.iconOffsetY,
      );
    }
  }

  /**
   * Returns label position.
   * @param {number} left - The left value.
   * @returns {number} The resulting numeric value.
   */
  getLabelPosition(left) {
    if (!this.icon) {
      return left;
    }

    return (
      left + this.iconSize + MENU_BUTTON_CONTENT.iconTextGap
    );
  }

  /**
   * Configures interaction.
   * @returns {void} No value is returned.
   */
  configureInteraction() {
    this.setInteractive({ useHandCursor: !this.isDisabled });
    this.on("pointerover", this.handlePointerOver, this);
    this.on("pointerout", this.handlePointerOut, this);
    this.on("pointerdown", this.handlePointerDown, this);
    this.on("pointerup", this.handlePointerUp, this);
  }

  /**
   * Handles pointer over.
   * @param {Phaser.Input.Pointer} pointer - The triggering Phaser pointer.
   * @returns {void} No value is returned.
   */
  handlePointerOver(pointer) {
    if (!this.isDisabled) {
      this.onFocus?.(this, pointer);
    }

    this.isPointerOver = true;
    this.renderState();
  }

  /**
   * Handles pointer out.
   * @returns {void} No value is returned.
   */
  handlePointerOut() {
    this.isPointerOver = false;
    this.isPressed = false;
    this.renderState();
  }

  /**
   * Handles pointer down.
   * @param {Phaser.Input.Pointer} pointer - The triggering Phaser pointer.
   * @returns {void} No value is returned.
   */
  handlePointerDown(pointer) {
    if (this.isDisabled) {
      return;
    }

    this.onFocus?.(this, pointer);
    this.isPressed = true;
    this.renderState();
  }

  /**
   * Handles pointer up.
   * @returns {void} No value is returned.
   */
  handlePointerUp() {
    if (!this.canActivate()) {
      return;
    }

    this.activate();
  }

  /**
   * Checks the activate condition.
   * @returns {boolean} Whether the requested condition is met.
   */
  canActivate() {
    return !this.isDisabled && this.isPressed;
  }

  /**
   * Handles activate.
   * @returns {boolean} Whether the requested condition is met.
   */
  activate() {
    if (this.isDisabled) {
      return false;
    }

    this.isPressed = false;
    this.renderState();
    this.onActivate?.(this);
    return true;
  }

  /**
   * Sets selected.
   * @param {boolean} selected - The selected value.
   * @returns {MenuButton} The resulting value.
   */
  setSelected(selected = true) {
    this.isSelected = selected;
    this.renderState();
    return this;
  }

  /**
   * Sets disabled.
   * @param {boolean} disabled - The disabled value.
   * @returns {MenuButton} The resulting value.
   */
  setDisabled(disabled = true) {
    this.isDisabled = disabled;
    this.isPressed = false;
    this.input.cursor = disabled ? "default" : "pointer";
    this.renderState();
    return this;
  }

  /**
   * Returns state.
   * @returns {string} The resulting string value.
   */
  getState() {
    if (this.isDisabled) return MENU_BUTTON_STATE.disabled;
    if (this.isPressed) return MENU_BUTTON_STATE.pressed;
    if (this.isPointerOver) return MENU_BUTTON_STATE.hover;
    return this.isSelected
      ? MENU_BUTTON_STATE.selected
      : MENU_BUTTON_STATE.normal;
  }

  /**
   * Renders state.
   * @returns {void} No value is returned.
   */
  renderState() {
    const style = MENU_BUTTON_STYLE[this.getState()];
    this.drawBackground(style);
    this.applyContentStyle(style);
    this.setScale(style.scale);
  }

  /**
   * Draws background.
   * @param {Object} style - The style value.
   * @returns {void} No value is returned.
   */
  drawBackground(style) {
    const points = getTornButtonPoints(
      this.buttonWidth,
      this.buttonHeight,
      MENU_BUTTON_CONTENT.edgeDepth,
    );
    this.background.clear();
    this.background.fillStyle(style.fillColor, style.fillAlpha);
    this.drawBackgroundFill(points);
    this.background.lineStyle(
      MENU_BUTTON_CONTENT.strokeWidth,
      style.strokeColor,
      style.strokeAlpha,
    );
    this.drawBackgroundStroke(points);
  }

  /**
   * Draws background fill.
   * @param {Phaser.Geom.Point[]} points - The points value.
   * @returns {void} No value is returned.
   */
  drawBackgroundFill(points) {
    this.background.fillPoints(points, true);
  }

  /**
   * Draws background stroke.
   * @param {Phaser.Geom.Point[]} points - The points value.
   * @returns {void} No value is returned.
   */
  drawBackgroundStroke(points) {
    this.background.strokePoints(points, true);
  }

  /**
   * Applies content style.
   * @param {Object} style - The style value.
   * @returns {void} No value is returned.
   */
  applyContentStyle(style) {
    this.label.setColor(style.textColor);
    this.icon?.setTint(style.iconTint);
  }
}
