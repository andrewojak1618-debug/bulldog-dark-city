import Phaser from "phaser";
import { ICON_BUTTON_STYLE } from "../../js/config/icon-button-style.js";

/**
 * @typedef {Object} SocialMediaButtonOptions
 * @property {number} x - Horizontale Mittelpunktposition.
 * @property {number} y - Vertikale Mittelpunktposition.
 * @property {number} size - Kantenlänge des Social-Media-Buttons.
 * @property {number} iconSize - Kantenlänge des Symbols.
 * @property {string} textureKey - Phaser-Texturschlüssel des Symbols.
 * @property {Function|null} [onActivate=null] - Aktion beim Anklicken.
 * @property {boolean} [disabled=false] - Sperrt eine noch nicht verfügbare Aktion.
 */

/**
 * Stellt einen Social-Media-Button mit Hoverzustand dar.
 */
export class SocialMediaButton extends Phaser.GameObjects.Container {
  /**
   * Erstellt einen interaktiven Social-Media-Button.
   * @param {Phaser.Scene} scene - Szene des Buttons.
   * @param {SocialMediaButtonOptions} options - Buttonkonfiguration.
   */
  constructor(scene, options) {
    super(scene, options.x, options.y);
    this.buttonSize = options.size;
    this.onActivate = options.onActivate ?? null;
    this.isDisabled = options.disabled ?? false;
    this.isPointerOver = false;
    this.background = scene.add.graphics();
    this.icon = scene.add
      .image(0, 0, options.textureKey)
      .setDisplaySize(options.iconSize, options.iconSize);
    this.add([this.background, this.icon]);
    this.setSize(options.size, options.size);
    scene.add.existing(this);
    this.configureInteraction();
    this.renderState();
  }

  /**
   * Bindet Hover- und Klickereignisse an die Buttonfläche.
   * @returns {void}
   */
  configureInteraction() {
    if (this.isDisabled) {
      this.setAlpha(0.45);
      return;
    }

    this.setInteractive({ useHandCursor: true });
    this.on("pointerover", () => {
      this.isPointerOver = true;
      this.renderState();
    });
    this.on("pointerout", () => {
      this.isPointerOver = false;
      this.renderState();
    });
    this.on("pointerup", () => this.onActivate?.());
  }

  /**
   * Zeichnet den Rahmen im gemeinsamen Normal- oder Hoverzustand.
   * @returns {void}
   */
  renderState() {
    const style = this.isPointerOver
      ? ICON_BUTTON_STYLE.hover
      : ICON_BUTTON_STYLE.normal;
    const halfSize = this.buttonSize / 2;

    this.background.clear();
    this.background.fillStyle(style.fillColor, style.fillAlpha);
    this.background.fillRoundedRect(
      -halfSize,
      -halfSize,
      this.buttonSize,
      this.buttonSize,
      ICON_BUTTON_STYLE.borderRadius,
    );
    this.background.lineStyle(
      ICON_BUTTON_STYLE.strokeWidth,
      style.strokeColor,
      style.strokeAlpha,
    );
    this.background.strokeRoundedRect(
      -halfSize,
      -halfSize,
      this.buttonSize,
      this.buttonSize,
      ICON_BUTTON_STYLE.borderRadius,
    );
    this.setScale(style.scale);
  }
}
