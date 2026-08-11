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
 * @property {boolean} [disabled=false] - Sperrt eine unfertige Aktion.
 * @property {string|null} [unavailableLabel=null] - Sichtbarer Sperrhinweis.
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
    this.isDisabled = options.disabled ?? false;
    this.isPointerOver = false;
    this.background = scene.add.graphics();
    this.icon = this.createIcon(scene, options);
    this.unavailableLabel = this.createUnavailableLabel(
      scene,
      options.unavailableLabel,
    );
    this.add([this.background, this.icon]);
    if (this.unavailableLabel) this.add(this.unavailableLabel);
    this.setSize(options.width, options.height);
    scene.add.existing(this);
    this.configureInteraction();
    this.renderState();
  }

  /**
   * Erstellt eine eindeutige Kennzeichnung für gesperrte Schnellzugriffe.
   * @param {Phaser.Scene} scene - Zugehörige Phaser-Szene.
   * @param {string|null|undefined} label - Sichtbarer Sperrhinweis.
   * @returns {Phaser.GameObjects.Text|null} Hinweis oder `null`.
   */
  createUnavailableLabel(scene, label) {
    if (!this.isDisabled || !label) return null;
    const style = ICON_BUTTON_STYLE.unavailable;
    return scene.add
      .text(0, 0, label, {
        fontFamily: style.fontFamily,
        fontSize: `${style.fontSize}px`,
        color: style.color,
        backgroundColor: style.backgroundColor,
        padding: { x: style.paddingX, y: style.paddingY },
      })
      .setOrigin(0.5);
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
    const displaySize = this.getIconDisplaySize(
      iconCrop,
      iconSize,
      iconDisplaySize,
    );
    return scene.add
      .image(0, iconOffsetY, iconKey)
      .setCrop(iconCrop.x, iconCrop.y, iconCrop.width, iconCrop.height)
      .setDisplaySize(displaySize.width, displaySize.height);
  }

  /**
   * Berechnet feste oder proportional skalierte Symbolmaße.
   * @param {{width: number, height: number}} crop - Bildausschnitt.
   * @param {number} maximumSize - Maximale Symbolgröße.
   * @param {{width: number, height: number}|null|undefined} fixedSize - Feste Maße.
   * @returns {{width: number, height: number}} Sichtbare Symbolmaße.
   */
  getIconDisplaySize(crop, maximumSize, fixedSize) {
    const scale = maximumSize / Math.max(crop.width, crop.height);
    return {
      width: fixedSize?.width ?? crop.width * scale,
      height: fixedSize?.height ?? crop.height * scale,
    };
  }

  /**
   * Bindet Hover- und Klickereignisse an die Buttonfläche.
   * @returns {void}
   */
  configureInteraction() {
    if (this.isDisabled) return;
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
    const style = !this.isDisabled && this.isPointerOver
      ? ICON_BUTTON_STYLE.hover
      : ICON_BUTTON_STYLE.normal;
    drawIconButtonBackground(
      this.background,
      this.buttonWidth,
      this.buttonHeight,
      style,
      ICON_BUTTON_STYLE,
    );
    const contentAlpha = this.isDisabled
      ? ICON_BUTTON_STYLE.disabledAlpha
      : 1;
    this.background.setAlpha(contentAlpha);
    this.icon.setAlpha(contentAlpha);
    this.setScale(style.scale);
  }
}
