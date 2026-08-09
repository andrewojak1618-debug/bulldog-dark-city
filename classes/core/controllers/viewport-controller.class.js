import { InputDeviceDetector } from
  "../../input/input-device-detector.class.js";

/** Steuert Canvas-Aktualisierung und Hochformatsperre auf Touchgeräten. */
export class ViewportController {
  /**
   * Verknüpft das Phaser-Spiel mit den Änderungen des Browserfensters.
   * @param {Phaser.Game} game - Laufende Phaser-Spielinstanz.
   */
  constructor(game) {
    this.game = game;
    this.notice = document.getElementById("orientation-notice");
    this.query = window.matchMedia("(orientation: portrait)");
    this.isLocked = null;
    this.handleChange = () => this.update();
    this.bindEvents();
    this.update();
  }

  /**
   * Bindet Orientierungs- und Größenänderungen an eine gemeinsame Aktion.
   * @returns {void}
   */
  bindEvents() {
    this.query.addEventListener("change", this.handleChange);
    window.addEventListener("resize", this.handleChange);
    window.visualViewport?.addEventListener("resize", this.handleChange);
  }

  /**
   * Aktualisiert Sperre, Barrierefreiheitsstatus und Canvas-Skalierung.
   * @returns {void}
   */
  update() {
    const shouldLock = InputDeviceDetector.isPortraitTouchLayout();
    document.body.classList.toggle("is-portrait-locked", shouldLock);
    this.notice?.setAttribute("aria-hidden", String(!shouldLock));
    this.game.canvas?.setAttribute("aria-hidden", String(shouldLock));
    this.updateGameLoop(shouldLock);
    this.game.scale.refresh();
  }

  /**
   * Pausiert das gesamte Spiel nur während der mobilen Hochformatsperre.
   * @param {boolean} shouldLock - Ob das Touchgerät hochkant steht.
   * @returns {void}
   */
  updateGameLoop(shouldLock) {
    if (shouldLock === this.isLocked) return;
    this.isLocked = shouldLock;
    if (shouldLock) {
      this.game.loop.sleep();
      return;
    }
    this.game.loop.wake();
  }
}
