import Phaser from "phaser";

/**
 * Manages intro skip hint behavior.
 */
export class IntroSkipHint extends Phaser.GameObjects.Container {
  /**
   * Creates a new instance.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {number} x - The horizontal position.
   * @param {number} y - The vertical position.
   * @param {Object} style - The style value.
   */
  constructor(scene, x, y, style) {
    super(scene, x, y);
    const actionLabel = this.createLabel(scene, style.actionHint, style);
    const keyLabel = this.createLabel(scene, style.hint, style)
      .setOrigin(0.5);
    const layout = this.getLayout(
      actionLabel.width,
      keyLabel.width,
      style,
    );
    const keyBackground = this.createKeyBackground(scene, layout, style);
    keyLabel.setX(layout.keyX);
    actionLabel.setX(layout.actionX);
    this.add([keyBackground, keyLabel, actionLabel]);
    scene.add.existing(this);
  }

  /**
   * Creates label.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {string} text - The text value.
   * @param {Object} style - The style value.
   * @returns {Phaser.GameObjects.Text} The resulting data object.
   */
  createLabel(scene, text, style) {
    return scene.add
      .text(0, -style.keyHeight / 2, text, {
        fontFamily: style.hintFontFamily,
        fontSize: `${style.hintFontSize}px`,
        color: style.hintColor,
      })
      .setOrigin(0, 0.5);
  }

  /**
   * Returns layout.
   * @param {number} actionWidth - The action width value.
   * @param {number} keyLabelWidth - The key label width value.
   * @param {Object} style - The style value.
   * @returns {{keyX: number, keyWidth: number, actionX: number}} The resulting numeric value.
   */
  getLayout(actionWidth, keyLabelWidth, style) {
    const keyWidth = Math.max(
      style.keyMinWidth,
      keyLabelWidth + style.keyPaddingX * 2,
    );
    const actionGap = actionWidth > 0 ? style.actionGap : 0;
    const groupWidth = keyWidth + actionGap + actionWidth;
    const keyX = -groupWidth / 2 + keyWidth / 2;
    return {
      keyX,
      keyWidth,
      actionX: keyX + keyWidth / 2 + actionGap,
    };
  }

  /**
   * Creates key background.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {{keyX: number, keyWidth: number}} layout - The layout value.
   * @param {Object} style - The style value.
   * @returns {Phaser.GameObjects.Graphics} The resulting data object.
   */
  createKeyBackground(scene, layout, style) {
    const background = scene.add.graphics();
    this.drawKeyShadow(background, layout, style);
    background.fillStyle(style.keyFillColor, style.keyFillAlpha);
    background.lineStyle(
      style.keyBorderWidth,
      style.keyBorderColor,
      style.keyBorderAlpha,
    );
    this.drawKeyShape(background, layout, style);
    return background;
  }

  /**
   * Draws key shadow.
   * @param {Phaser.GameObjects.Graphics} background - The background value.
   * @param {{keyX: number, keyWidth: number}} layout - The layout value.
   * @param {Object} style - The style value.
   * @returns {void} No value is returned.
   */
  drawKeyShadow(background, layout, style) {
    background.fillStyle(style.keyShadowColor, style.keyShadowAlpha);
    background.fillRoundedRect(
      layout.keyX - layout.keyWidth / 2,
      -style.keyHeight + style.keyShadowOffsetY,
      layout.keyWidth,
      style.keyHeight,
      style.keyRadius,
    );
  }

  /**
   * Draws key shape.
   * @param {Phaser.GameObjects.Graphics} background - The background value.
   * @param {{keyX: number, keyWidth: number}} layout - The layout value.
   * @param {Object} style - The style value.
   * @returns {void} No value is returned.
   */
  drawKeyShape(background, layout, style) {
    const left = layout.keyX - layout.keyWidth / 2;
    const top = -style.keyHeight;
    const dimensions = [
      left,
      top,
      layout.keyWidth,
      style.keyHeight,
      style.keyRadius,
    ];
    background.fillRoundedRect(...dimensions);
    background.strokeRoundedRect(...dimensions);
  }

}
