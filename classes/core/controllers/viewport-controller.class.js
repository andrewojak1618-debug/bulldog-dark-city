import { InputDeviceDetector } from
  "../../input/input-device-detector.class.js";

/**
 * Manages viewport controller behavior.
 */
export class ViewportController {
  /**
   * Creates a new instance.
   * @param {Phaser.Game} game - The game value.
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
   * Binds events.
   * @returns {void} No value is returned.
   */
  bindEvents() {
    this.query.addEventListener("change", this.handleChange);
    window.addEventListener("resize", this.handleChange);
    window.visualViewport?.addEventListener("resize", this.handleChange);
  }

  /**
   * Updates the current state.
   * @returns {void} No value is returned.
   */
  update() {
    const isTouchLayout = InputDeviceDetector.isTouchLayout();
    const shouldLock = InputDeviceDetector.isPortraitTouchLayout();
    document.body.classList.toggle("is-touch-layout", isTouchLayout);
    document.body.classList.toggle("is-portrait-locked", shouldLock);
    this.notice?.setAttribute("aria-hidden", String(!shouldLock));
    this.game.canvas?.setAttribute("aria-hidden", String(shouldLock));
    this.updateGameLoop(shouldLock);
    this.game.scale.refresh();
  }

  /**
   * Updates game loop.
   * @param {boolean} shouldLock - The should lock value.
   * @returns {void} No value is returned.
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
