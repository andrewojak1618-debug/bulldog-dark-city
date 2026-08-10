import Phaser from "phaser";
import { TOUCH_CONTROLS } from "../../js/config/touch-control-settings.js";

/** Stellt einen gedrückt haltbaren, kamerafesten Touchbutton dar. */
export class TouchControlButton extends Phaser.GameObjects.Container {
  /**
   * Erstellt Darstellung, Trefferfläche und Pointerereignisse.
   * @param {Phaser.Scene} scene - Aktive Spielszene.
   * @param {Object} settings - Position, Größe, Text und Aktionsschlüssel.
   * @param {Function} onStateChange - Empfänger des gedrückten Zustands.
   */
  constructor(scene, settings, onStateChange) {
    super(scene, settings.x, settings.y);
    scene.add.existing(this);
    this.settings = settings;
    this.onStateChange = onStateChange;
    this.isPressed = false;
    this.isEnabled = true;
    this.isControlVisible = true;
    this.background = scene.add.graphics();
    this.label = this.createLabel(scene);
    this.add([this.background, this.label]);
    this.setSize(settings.size, settings.size)
      .setScrollFactor(0)
      .setDepth(TOUCH_CONTROLS.depth)
      .setInteractive({ useHandCursor: false });
    this.bindPointerEvents();
    this.draw();
  }

  /**
   * Erstellt die mittig ausgerichtete Beschriftung des Buttons.
   * @param {Phaser.Scene} scene - Aktive Spielszene.
   * @returns {Phaser.GameObjects.Text} Erstellte Beschriftung.
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
   * Bindet Drücken, Loslassen und Verlassen an den Buttonzustand.
   * @returns {void}
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
   * Aktiviert den Button genau einmal pro neuer Berührung.
   * @returns {void}
   */
  press() {
    if (!this.isEnabled || this.isPressed) return;
    this.isPressed = true;
    this.onStateChange(this.settings.action, true);
    this.draw();
  }

  /**
   * Löst einen gehaltenen Button und informiert das InputSystem.
   * @returns {void}
   */
  release() {
    if (!this.isPressed) return;
    this.isPressed = false;
    this.onStateChange(this.settings.action, false);
    this.draw();
  }

  /**
   * Aktiviert oder sperrt den Button und beendet gehaltene Eingaben.
   * @param {boolean} enabled - Neuer Aktivierungszustand.
   * @returns {void}
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
   * Blendet den Button ein oder aus und sperrt unsichtbare Trefferflächen.
   * @param {boolean} visible - Ob der Touchbutton verwendet werden darf.
   * @returns {void}
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
   * Zeichnet Zustand, Neonrahmen und Transparenz des Touchbuttons.
   * @returns {void}
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
