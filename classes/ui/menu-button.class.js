import Phaser from "phaser";
import {
  MENU_BUTTON_CONTENT,
  MENU_BUTTON_STATE,
  MENU_BUTTON_STYLE,
} from "../../js/config/menu-button-style.js";
import { getTornButtonPoints } from "../../js/utils/menu-button-shape.js";

/**
 * @typedef {Object} MenuButtonOptions
 * @property {number} x - Horizontale Mittelpunktposition.
 * @property {number} y - Vertikale Mittelpunktposition.
 * @property {number} width - Breite des Buttons.
 * @property {number} height - Höhe des Buttons.
 * @property {string} label - Sichtbare Buttonbeschriftung.
 * @property {string} [fontSize] - Optionale individuelle Schriftgröße.
 * @property {string|null} [iconKey=null] - Optionaler Phaser-Texturschlüssel.
 * @property {{x: number, y: number, width: number,
 * height: number}|null} [iconCrop=null] - Sichtbarer Bildausschnitt.
 * @property {number} [iconOffsetY=0] - Vertikale optische Korrektur des Symbols.
 * @property {Function|null} [onActivate=null] - Aktion bei erfolgreicher Aktivierung.
 * @property {Function|null} [onFocus=null] - Aktion bei Maus- oder Touchfokus.
 * @property {boolean} [selected=false] - Anfänglicher Auswahlzustand.
 * @property {boolean} [disabled=false] - Anfänglicher Sperrzustand.
 */

/**
 * Stellt einen konfigurierbaren Menübutton mit gemeinsamen Zuständen dar.
 */
export class MenuButton extends Phaser.GameObjects.Container {
  /**
   * Erstellt einen Menübutton und bindet seine Zeigerinteraktionen.
   * @param {Phaser.Scene} scene - Szene, in der der Button angezeigt wird.
   * @param {MenuButtonOptions} options - Darstellung und Verhalten des Buttons.
   */
  constructor(scene, options) {
    super(scene, options.x, options.y);
    this.buttonWidth = options.width;
    this.buttonHeight = options.height;
    this.iconOffsetY = options.iconOffsetY ?? 0;
    this.onActivate = options.onActivate ?? null;
    this.onFocus = options.onFocus ?? null;
    this.setInitialState(options);
    this.background = scene.add.graphics();
    this.label = this.createLabel(scene, options.label, options.fontSize);
    this.icon = this.createIcon(scene, options.iconKey, options.iconCrop);
    this.addContent();
    this.layoutContent();
    this.setSize(options.width, options.height);
    scene.add.existing(this);
    this.configureInteraction();
    this.renderState();
  }

  /**
   * Übernimmt die anfänglichen Zustandswerte aus der Konfiguration.
   * @param {MenuButtonOptions} options - Buttonkonfiguration.
   * @returns {void}
   */
  setInitialState(options) {
    this.isSelected = options.selected ?? false;
    this.isDisabled = options.disabled ?? false;
    this.isPointerOver = false;
    this.isPressed = false;
  }

  /**
   * Erstellt die sichtbare Beschriftung des Buttons.
   * @param {Phaser.Scene} scene - Zugehörige Phaser-Szene.
   * @param {string} label - Sichtbare Buttonbeschriftung.
   * @param {string|undefined} fontSize - Optionale Schriftgröße.
   * @returns {Phaser.GameObjects.Text} Erstelltes Textobjekt.
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
   * Erstellt ein optionales Symbol für den Button.
   * @param {Phaser.Scene} scene - Zugehörige Phaser-Szene.
   * @param {string|null|undefined} iconKey - Optionaler Texturschlüssel.
   * @param {{x: number, y: number, width: number, height: number}
   * |null|undefined} iconCrop - Sichtbarer Bildausschnitt.
   * @returns {Phaser.GameObjects.Image|null} Symbol oder `null`.
   */
  createIcon(scene, iconKey, iconCrop) {
    if (!iconKey) {
      return null;
    }

    const icon = scene.add.image(0, 0, iconKey);

    if (!iconCrop) {
      return icon.setDisplaySize(
        MENU_BUTTON_CONTENT.iconSize,
        MENU_BUTTON_CONTENT.iconSize,
      );
    }

    return this.cropIcon(icon, iconCrop);
  }

  /**
   * Beschneidet ein Symbol und skaliert es proportional in den Iconbereich.
   * @param {Phaser.GameObjects.Image} icon - Zu bearbeitendes Symbol.
   * @param {{x: number, y: number, width: number,
   * height: number}} crop - Sichtbarer Bildausschnitt.
   * @returns {Phaser.GameObjects.Image} Zentriertes und skaliertes Symbol.
   */
  cropIcon(icon, crop) {
    const displaySize = this.getIconDisplaySize(crop);
    icon.setCrop(crop.x, crop.y, crop.width, crop.height);
    return icon.setDisplaySize(displaySize.width, displaySize.height);
  }

  /**
   * Berechnet eine proportionale Symbolgröße innerhalb der Maximalgröße.
   * @param {{width: number, height: number}} crop - Größe des Bildausschnitts.
   * @returns {{width: number, height: number}} Proportionale Anzeigegröße.
   */
  getIconDisplaySize({ width, height }) {
    const maxDimension = Math.max(width, height);
    const scale = MENU_BUTTON_CONTENT.iconSize / maxDimension;
    return {
      width: width * scale,
      height: height * scale,
    };
  }

  /**
   * Fügt Hintergrund, Beschriftung und optionales Symbol zum Container hinzu.
   * @returns {void}
   */
  addContent() {
    this.add([this.background, this.label]);

    if (this.icon) {
      this.add(this.icon);
    }
  }

  /**
   * Positioniert Beschriftung und optionales Symbol im Button.
   * @returns {void}
   */
  layoutContent() {
    const left = -this.buttonWidth / 2 + MENU_BUTTON_CONTENT.horizontalPadding;
    this.label.setX(this.getLabelPosition(left));

    if (this.icon) {
      this.icon.setPosition(
        left + MENU_BUTTON_CONTENT.iconSize / 2,
        this.iconOffsetY,
      );
    }
  }

  /**
   * Berechnet die horizontale Startposition der Beschriftung.
   * @param {number} left - Linker innerer Rand des Buttons.
   * @returns {number} Horizontale Textposition.
   */
  getLabelPosition(left) {
    if (!this.icon) {
      return left;
    }

    return (
      left + MENU_BUTTON_CONTENT.iconSize + MENU_BUTTON_CONTENT.iconTextGap
    );
  }

  /**
   * Aktiviert die Hitbox und bindet alle Zeigerereignisse.
   * @returns {void}
   */
  configureInteraction() {
    this.setInteractive({ useHandCursor: !this.isDisabled });
    this.on("pointerover", this.handlePointerOver, this);
    this.on("pointerout", this.handlePointerOut, this);
    this.on("pointerdown", this.handlePointerDown, this);
    this.on("pointerup", this.handlePointerUp, this);
  }

  /**
   * Setzt den Hoverzustand, wenn der Zeiger den Button betritt.
   * @param {Phaser.Input.Pointer} pointer - Auslösender Maus- oder Touchzeiger.
   * @returns {void}
   */
  handlePointerOver(pointer) {
    if (!this.isDisabled) {
      this.onFocus?.(this, pointer);
    }

    this.isPointerOver = true;
    this.renderState();
  }

  /**
   * Entfernt Hover- und Druckzustand, wenn der Zeiger den Button verlässt.
   * @returns {void}
   */
  handlePointerOut() {
    this.isPointerOver = false;
    this.isPressed = false;
    this.renderState();
  }

  /**
   * Aktiviert den gedrückten Zustand eines ausführbaren Buttons.
   * @param {Phaser.Input.Pointer} pointer - Auslösender Maus- oder Touchzeiger.
   * @returns {void}
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
   * Führt die Buttonaktion nach einem vollständigen Klick aus.
   * @returns {void}
   */
  handlePointerUp() {
    if (!this.canActivate()) {
      return;
    }

    this.activate();
  }

  /**
   * Prüft, ob der Button seine Aktion ausführen darf.
   * @returns {boolean} `true`, wenn der Button gedrückt und nicht gesperrt ist.
   */
  canActivate() {
    return !this.isDisabled && this.isPressed;
  }

  /**
   * Führt die konfigurierte Buttonaktion aus, wenn der Button aktiv ist.
   * @returns {boolean} `true`, wenn die Aktion ausgeführt wurde.
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
   * Ändert den ausgewählten Zustand des Buttons.
   * @param {boolean} selected - Neuer Auswahlzustand.
   * @returns {MenuButton} Aktuelle Buttoninstanz für verkettete Aufrufe.
   */
  setSelected(selected = true) {
    this.isSelected = selected;
    this.renderState();
    return this;
  }

  /**
   * Sperrt oder entsperrt den Button und aktualisiert den Mauszeiger.
   * @param {boolean} disabled - Neuer Sperrzustand.
   * @returns {MenuButton} Aktuelle Buttoninstanz für verkettete Aufrufe.
   */
  setDisabled(disabled = true) {
    this.isDisabled = disabled;
    this.isPressed = false;
    this.input.cursor = disabled ? "default" : "pointer";
    this.renderState();
    return this;
  }

  /**
   * Ermittelt den sichtbaren Zustand anhand der aktuellen Interaktion.
   * @returns {string} Schlüssel des anzuwendenden Buttonzustands.
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
   * Aktualisiert Hintergrund, Inhalt und Skalierung des Buttons.
   * @returns {void}
   */
  renderState() {
    const style = MENU_BUTTON_STYLE[this.getState()];
    this.drawBackground(style);
    this.applyContentStyle(style);
    this.setScale(style.scale);
  }

  /**
   * Zeichnet den gemeinsamen Hintergrund für den aktuellen Zustand.
   * @param {Object} style - Darstellungswerte des aktuellen Zustands.
   * @returns {void}
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
   * Zeichnet die gefüllte Fläche des zerrissenen Buttonhintergrunds.
   * @param {Phaser.Geom.Point[]} points - Punkte der Außenkontur.
   * @returns {void}
   */
  drawBackgroundFill(points) {
    this.background.fillPoints(points, true);
  }

  /**
   * Zeichnet die Kontur des zerrissenen Buttonhintergrunds.
   * @param {Phaser.Geom.Point[]} points - Punkte der Außenkontur.
   * @returns {void}
   */
  drawBackgroundStroke(points) {
    this.background.strokePoints(points, true);
  }

  /**
   * Überträgt die Zustandsfarben auf Text und Symbol.
   * @param {Object} style - Darstellungswerte des aktuellen Zustands.
   * @returns {void}
   */
  applyContentStyle(style) {
    this.label.setColor(style.textColor);
    this.icon?.setTint(style.iconTint);
  }
}
