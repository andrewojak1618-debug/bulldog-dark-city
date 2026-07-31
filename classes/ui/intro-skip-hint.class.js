import Phaser from "phaser";

/**
 * Stellt die Leertaste und ihre Aktion als gemeinsamen Introhinweis dar.
 */
export class IntroSkipHint extends Phaser.GameObjects.Container {
  /**
   * Erstellt die zentrierte Tastenkappe mit ergänzender Aktionsbeschriftung.
   * @param {Phaser.Scene} scene - Szene, in der der Hinweis angezeigt wird.
   * @param {number} x - Horizontale Mittelpunktposition.
   * @param {number} y - Untere Position des Hinweises.
   * @param {Object} style - Zentrale Darstellungswerte des Hinweises.
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
   * Erstellt eine Textbeschriftung mit dem gemeinsamen Schriftstil.
   * @param {Phaser.Scene} scene - Zugehörige Phaser-Szene.
   * @param {string} text - Sichtbare Beschriftung.
   * @param {Object} style - Zentrale Darstellungswerte.
   * @returns {Phaser.GameObjects.Text} Erstellte Beschriftung.
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
   * Berechnet die Positionen der Tastenkappe und Aktionsbeschriftung.
   * @param {number} actionWidth - Breite der Aktionsbeschriftung.
   * @param {number} keyLabelWidth - Breite der Tastenbeschriftung.
   * @param {Object} style - Zentrale Darstellungswerte.
   * @returns {{keyX: number, keyWidth: number, actionX: number}} Positionen.
   */
  getLayout(actionWidth, keyLabelWidth, style) {
    const keyWidth = Math.max(
      style.keyMinWidth,
      keyLabelWidth + style.keyPaddingX * 2,
    );
    const groupWidth = keyWidth + style.actionGap + actionWidth;
    const keyX = -groupWidth / 2 + keyWidth / 2;
    return {
      keyX,
      keyWidth,
      actionX: keyX + keyWidth / 2 + style.actionGap,
    };
  }

  /**
   * Erstellt die gezeichnete Fläche der Tastenkappe.
   * @param {Phaser.Scene} scene - Zugehörige Phaser-Szene.
   * @param {{keyX: number, keyWidth: number}} layout - Tastenposition.
   * @param {Object} style - Zentrale Darstellungswerte.
   * @returns {Phaser.GameObjects.Graphics} Gezeichnete Tastenkappe.
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
   * Zeichnet einen leicht nach unten versetzten Schatten der Tastenkappe.
   * @param {Phaser.GameObjects.Graphics} background - Zeichenfläche.
   * @param {{keyX: number, keyWidth: number}} layout - Tastenposition.
   * @param {Object} style - Zentrale Darstellungswerte.
   * @returns {void}
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
   * Zeichnet Füllung und Rand der Tastenkappe mit derselben Kontur.
   * @param {Phaser.GameObjects.Graphics} background - Zeichenfläche.
   * @param {{keyX: number, keyWidth: number}} layout - Tastenposition.
   * @param {Object} style - Zentrale Darstellungswerte.
   * @returns {void}
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
