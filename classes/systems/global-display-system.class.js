const DISPLAY_STORAGE_KEY = "bulldog-dark-city.display-mode";

/**
 * Defines the display modes configuration.
 */
export const DISPLAY_MODES = Object.freeze({
  standard: "standard",
  oled: "oled",
});

/**
 * Manages global display system behavior.
 */
export class GlobalDisplaySystem {
  /**
   * Creates a new instance.
   * @param {Storage|null} [storage=GlobalDisplaySystem.getDefaultStorage()] - The storage implementation to use.
   */
  constructor(storage = GlobalDisplaySystem.getDefaultStorage()) {
    this.storage = storage;
    this.canvas = null;
    this.listeners = new Set();
    this.mode = this.readStoredMode();
  }

  /**
   * Returns default storage.
   * @returns {Storage|null} The resulting value.
   */
  static getDefaultStorage() {
    try {
      return globalThis.localStorage ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Handles attach game.
   * @param {Phaser.Game} game - The game value.
   * @returns {void} No value is returned.
   */
  attachGame(game) {
    this.canvas = game?.canvas ?? null;
    this.applyToCanvas();
  }

  /**
   * Returns mode.
   * @returns {string} The resulting string value.
   */
  getMode() {
    return this.mode;
  }

  /**
   * Toggles the current state.
   * @returns {string} The resulting string value.
   */
  toggle() {
    const nextMode = this.mode === DISPLAY_MODES.oled
      ? DISPLAY_MODES.standard
      : DISPLAY_MODES.oled;
    this.setMode(nextMode);
    return this.mode;
  }

  /**
   * Sets mode.
   * @param {string} mode - The mode value.
   * @returns {void} No value is returned.
   */
  setMode(mode) {
    const nextMode = this.isKnownMode(mode) ? mode : DISPLAY_MODES.standard;
    if (nextMode === this.mode) {
      this.applyToCanvas();
      return;
    }
    this.mode = nextMode;
    this.applyToCanvas();
    this.storeMode();
    this.listeners.forEach((listener) => listener(this.mode));
  }

  /**
   * Handles on change.
   * @param {(mode: string) => void} listener - The listener value.
   * @returns {Function} The generated callback function.
   */
  onChange(listener) {
    this.listeners.add(listener);
    listener(this.mode);
    return () => this.listeners.delete(listener);
  }

  /**
   * Reads stored mode.
   * @returns {string} The resulting string value.
   */
  readStoredMode() {
    try {
      const storedMode = this.storage?.getItem(DISPLAY_STORAGE_KEY);
      return this.isKnownMode(storedMode)
        ? storedMode
        : DISPLAY_MODES.standard;
    } catch {
      return DISPLAY_MODES.standard;
    }
  }

  /**
   * Handles store mode.
   * @returns {void} No value is returned.
   */
  storeMode() {
    try {
      this.storage?.setItem(DISPLAY_STORAGE_KEY, this.mode);
    } catch {
      // Die Anzeige bleibt auch bei blockiertem LocalStorage bedienbar.
    }
  }

  /**
   * Applies to canvas.
   * @returns {void} No value is returned.
   */
  applyToCanvas() {
    if (this.canvas?.dataset) this.canvas.dataset.displayMode = this.mode;
  }

  /**
   * Checks the known mode condition.
   * @param {string|null|undefined} mode - The mode value.
   * @returns {boolean} Whether the requested condition is met.
   */
  isKnownMode(mode) {
    return Object.values(DISPLAY_MODES).includes(mode);
  }
}

/**
 * Defines the global display system configuration.
 */
export const globalDisplaySystem = new GlobalDisplaySystem();
