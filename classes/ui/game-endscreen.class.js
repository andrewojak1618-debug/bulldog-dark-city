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
 * @typedef {Object} GameEndscreenOptions
 * @property {string} result - Abschlussvariante für Niederlage oder Sieg.
 * @property {Function} onRetry - Aktion für einen vollständigen Neustart.
 * @property {Function} onMenu - Aktion für die Rückkehr zum Hauptmenü.
 */

/**
 * Stellt die gemeinsame Auswahl nach Niederlage und Sieg bereit.
 */
export class GameEndscreen extends Phaser.GameObjects.Container {
  /**
   * Erstellt Hintergrund, Ergebnistext, Aktionen und Eingabesteuerung.
   * @param {Phaser.Scene} scene - Zugehörige Endscreen-Szene.
   * @param {GameEndscreenOptions} options - Variante und Aktionen.
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
   * Zeichnet eine undurchsichtige Fläche über den vorherigen Szeneninhalt.
   * @param {Phaser.Scene} scene - Zugehörige Szene.
   * @param {number} width - Canvasbreite.
   * @param {number} height - Canvashöhe.
   * @returns {void}
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
   * Zeichnet den gemeinsamen dunklen Dialog mit Neonrahmen.
   * @param {Phaser.Scene} scene - Zugehörige Szene.
   * @returns {void}
   */
  createPanel(scene) {
    const settings = GAME_ENDSCREEN.panel;
    const panel = scene.add.graphics();
    panel.fillStyle(settings.fillColor, settings.fillAlpha);
    panel.fillRoundedRect(
      -settings.width / 2,
      -settings.height / 2,
      settings.width,
      settings.height,
      settings.radius,
    );
    panel.lineStyle(
      settings.borderWidth,
      settings.borderColor,
      settings.borderAlpha,
    );
    panel.strokeRoundedRect(
      -settings.width / 2,
      -settings.height / 2,
      settings.width,
      settings.height,
      settings.radius,
    );
    this.add(panel);
  }

  /**
   * Erstellt variantenabhängige Überschrift und Beschreibung.
   * @param {Phaser.Scene} scene - Zugehörige Szene.
   * @returns {void}
   */
  createResultContent(scene) {
    const variant = GAME_ENDSCREEN.variants[this.result];
    const titleStyle = GAME_ENDSCREEN.title;
    const messageStyle = GAME_ENDSCREEN.message;
    const title = scene.add.text(0, titleStyle.y, variant.title, {
      fontFamily: titleStyle.fontFamily,
      fontSize: `${titleStyle.fontSize}px`,
      color: variant.titleColor,
    }).setOrigin(0.5);
    const message = scene.add.text(0, messageStyle.y, variant.message, {
      fontFamily: messageStyle.fontFamily,
      fontSize: `${messageStyle.fontSize}px`,
      color: messageStyle.color,
      align: "center",
    }).setOrigin(0.5);
    this.add([title, message]);
  }

  /**
   * Erstellt beide Aktionen aus derselben wiederverwendbaren Buttonklasse.
   * @param {Phaser.Scene} scene - Zugehörige Szene.
   * @param {GameEndscreenOptions} options - Auszuführende Aktionen.
   * @returns {MenuButton[]} Steuerbare Endscreen-Buttons.
   */
  createButtons(scene, options) {
    const settings = GAME_ENDSCREEN.buttons;
    const definitions = [
      { label: settings.retryLabel, action: options.onRetry },
      { label: settings.menuLabel, action: options.onMenu },
    ];
    return definitions.map((definition, index) => {
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
          this.inputController?.focusButton(
            focusedButton,
            pointer?.pointerType === "touch" ? "touch" : "mouse",
          ),
      });
      this.add(button);
      return button;
    });
  }

  /**
   * Zeigt eine zur aktuellen Eingabeoberfläche passende Bedienhilfe.
   * @param {Phaser.Scene} scene - Zugehörige Szene.
   * @returns {void}
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
   * Aktualisiert die Gamepadauswahl, solange der Endscreen aktiv ist.
   * @returns {void}
   */
  updateInput() {
    this.inputController?.update();
  }

  /**
   * Aktiviert oder sperrt alle Endscreen-Aktionen gemeinsam.
   * @param {boolean} enabled - Gewünschter Eingabezustand.
   * @returns {void}
   */
  setInputEnabled(enabled) {
    this.inputController?.setEnabled(enabled);
    this.buttons.forEach((button) => button.setDisabled(!enabled));
  }
}
