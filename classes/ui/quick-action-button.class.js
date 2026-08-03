import Phaser from "phaser";
import { ICON_BUTTON_STYLE } from "../../js/config/icon-button-style.js";
import { drawIconButtonBackground } from "../../js/utils/icon-button-background.js";

/**
 * @typedef {Object} QuickActionButtonOptions
 * @property {number} x - Horizontale Mittelpunktposition.
 * @property {number} y - Vertikale Mittelpunktposition.
 * @property {number} width - Breite des Buttons.
 * @property {number} height - Höhe des Buttons.
 * @property {number} iconSize - Maximale Größe des Symbols.
 * @property {string} iconKey - Phaser-Texturschlüssel des Symbols.
 * @property {{x: number, y: number, width: number,
 * height: number}} iconCrop - Sichtbarer Bildausschnitt.
 * @property {{width: number, height: number}|null}
 * [iconDisplaySize=null] - Optionale feste Anzeigegröße.
 * @property {number} [iconOffsetY=0] - Vertikale optische Korrektur.
 * @property {Function|null} [onActivate=null] - Aktion beim Anklicken.
 */

/**
 * Stellt einen quadratischen Schnellzugriff mit Hoverzustand dar.
 */
export class QuickActionButton extends Phaser.GameObjects.Container {
  /**
   * Erstellt einen interaktiven Schnellzugriff.
   * @param {Phaser.Scene} scene - Szene des Schnellzugriffs.
   * @param {QuickActionButtonOptions} options - Darstellung und Verhalten.
   */
  constructor(scene, options) {
    super(scene, options.x, options.y);
    this.buttonWidth = options.width;
    this.buttonHeight = options.height;
    this.onActivate = options.onActivate ?? null;
    this.isPointerOver = false;
    this.background = scene.add.graphics();
    this.icon = this.createIcon(scene, options);
    this.add([this.background, this.icon]);
    this.setSize(options.width, options.height);
    scene.add.existing(this);
    this.configureInteraction();
    this.renderState();
  }

  /**
   * Erstellt und beschneidet das Symbol proportional.
   * @param {Phaser.Scene} scene - Zugehörige Phaser-Szene.
   * @param {QuickActionButtonOptions} options - Symbolkonfiguration.
   * @returns {Phaser.GameObjects.Image} Erstelltes Symbol.
   */
  createIcon(
    scene,
    {
      iconKey,
      iconCrop,
      iconSize,
      iconDisplaySize,
      iconOffsetY = 0,
    },
  ) {
    const maxDimension = Math.max(
      iconCrop.width,
      iconCrop.height,
    );
    const scale = iconSize / maxDimension;
    const displayWidth =
      iconDisplaySize?.width ?? iconCrop.width * scale;
    const displayHeight =
      iconDisplaySize?.height ?? iconCrop.height * scale;
    return scene.add
      .image(0, iconOffsetY, iconKey)
      .setCrop(
        iconCrop.x,
        iconCrop.y,
        iconCrop.width,
        iconCrop.height,
      )
      .setDisplaySize(displayWidth, displayHeight);
  }

  /**
   * Bindet Hover- und Klickereignisse an die Buttonfläche.
   * @returns {void}
   */
  configureInteraction() {
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
   * Zeichnet den aktuellen Normal- oder Hoverzustand.
   * @returns {void}
   */
  renderState() {
    const style = this.isPointerOver
      ? ICON_BUTTON_STYLE.hover
      : ICON_BUTTON_STYLE.normal;
    drawIconButtonBackground(
      this.background,
      this.buttonWidth,
      this.buttonHeight,
      style,
      ICON_BUTTON_STYLE,
    );
    this.setScale(style.scale);
  }
}
