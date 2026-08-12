const DISPLAY_STORAGE_KEY = "bulldog-dark-city.display-mode";

/** Verfügbare, kontrolliert abgestimmte Bildschirmdarstellungen. */
export const DISPLAY_MODES = Object.freeze({
  standard: "standard",
  oled: "oled",
});

/** Verwaltet eine persistente, moderate Aufhellung für dunkle Displays. */
export class GlobalDisplaySystem {
  /**
   * Erstellt die Anzeigeeinstellung aus einem sicheren Speicherzugriff.
   * @param {Storage|null} [storage=GlobalDisplaySystem.getDefaultStorage()]
   * Persistenter Browserspeicher oder ein Testersatz.
   */
  constructor(storage = GlobalDisplaySystem.getDefaultStorage()) {
    this.storage = storage;
    this.canvas = null;
    this.listeners = new Set();
    this.mode = this.readStoredMode();
  }

  /** @returns {Storage|null} Verfügbarer Browserspeicher oder null. */
  static getDefaultStorage() {
    try {
      return globalThis.localStorage ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Verknüpft die Einstellung mit dem erzeugten Phaser-Canvas.
   * @param {Phaser.Game} game - Laufende Phaser-Spielinstanz.
   * @returns {void}
   */
  attachGame(game) {
    this.canvas = game?.canvas ?? null;
    this.applyToCanvas();
  }

  /** @returns {string} Aktueller Bildschirmmodus. */
  getMode() {
    return this.mode;
  }

  /**
   * Wechselt zwischen Originaldarstellung und OLED-Aufhellung.
   * @returns {string} Neu gesetzter Bildschirmmodus.
   */
  toggle() {
    const nextMode = this.mode === DISPLAY_MODES.oled
      ? DISPLAY_MODES.standard
      : DISPLAY_MODES.oled;
    this.setMode(nextMode);
    return this.mode;
  }

  /**
   * Setzt ausschließlich einen bekannten Bildschirmmodus.
   * @param {string} mode - Gewünschter Modusschlüssel.
   * @returns {void}
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
   * Informiert eine Oberfläche sofort und bei jeder Änderung.
   * @param {(mode: string) => void} listener - Empfänger des Modusschlüssels.
   * @returns {Function} Funktion zum Abmelden des Empfängers.
   */
  onChange(listener) {
    this.listeners.add(listener);
    listener(this.mode);
    return () => this.listeners.delete(listener);
  }

  /** @returns {string} Persistierter oder sicherer Standardmodus. */
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

  /** @returns {void} Speichert die aktuelle Anzeigeeinstellung. */
  storeMode() {
    try {
      this.storage?.setItem(DISPLAY_STORAGE_KEY, this.mode);
    } catch {
      // Die Anzeige bleibt auch bei blockiertem LocalStorage bedienbar.
    }
  }

  /** @returns {void} Überträgt den Modusschlüssel auf das Spiel-Canvas. */
  applyToCanvas() {
    if (this.canvas?.dataset) this.canvas.dataset.displayMode = this.mode;
  }

  /**
   * Prüft einen Modusschlüssel gegen die zentrale Auswahlliste.
   * @param {string|null|undefined} mode - Zu prüfender Wert.
   * @returns {boolean} Ob der Wert unterstützt wird.
   */
  isKnownMode(mode) {
    return Object.values(DISPLAY_MODES).includes(mode);
  }
}

/** Gemeinsame Instanz für Startmenü und alle Level. */
export const globalDisplaySystem = new GlobalDisplaySystem();
