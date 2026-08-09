const MUTE_STORAGE_KEY = "bulldog-dark-city.audio-muted";

/**
 * Verwaltet den globalen Tonzustand für Phaser-Audio und HTML-Videos.
 */
export class GlobalMuteSystem {
  /**
   * Liest die gespeicherte Einstellung aus einem sicheren Storage-Zugriff.
   * @param {Storage|null} [storage=GlobalMuteSystem.getDefaultStorage()]
   * Persistenter Browserspeicher oder ein Testersatz.
   */
  constructor(storage = GlobalMuteSystem.getDefaultStorage()) {
    this.storage = storage;
    this.game = null;
    this.videos = new Set();
    this.listeners = new Set();
    this.muted = this.readStoredState();
  }

  /**
   * Ermittelt LocalStorage, ohne bei blockierten Browserdaten abzubrechen.
   * @returns {Storage|null} Verfügbarer Browserspeicher oder null.
   */
  static getDefaultStorage() {
    try {
      return globalThis.localStorage ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Verknüpft den Zustand mit Phasers globalem Sound-Manager.
   * @param {Phaser.Game} game - Laufende Spielinstanz.
   * @returns {void}
   */
  attachGame(game) {
    this.game = game;
    this.applyToGame();
  }

  /**
   * Gibt zurück, ob sämtliche Spieltöne aktuell stummgeschaltet sind.
   * @returns {boolean} Aktueller globaler Mute-Zustand.
   */
  isMuted() {
    return this.muted;
  }

  /**
   * Wechselt den Zustand und speichert ihn dauerhaft im Browser.
   * @returns {boolean} Neuer Mute-Zustand.
   */
  toggle() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  /**
   * Setzt den Zustand für Audio, Videos, UI und LocalStorage gemeinsam.
   * @param {boolean} muted - Gewünschter Mute-Zustand.
   * @returns {void}
   */
  setMuted(muted) {
    const nextState = Boolean(muted);
    if (nextState === this.muted) {
      this.applyToGame();
      this.applyToVideos();
      return;
    }

    this.muted = nextState;
    this.applyToGame();
    this.applyToVideos();
    this.storeState();
    this.listeners.forEach((listener) => listener(this.muted));
  }

  /**
   * Meldet ein Phaser-Video beim globalen Mute-System an.
   * @param {Phaser.GameObjects.Video} video - Zu synchronisierendes Video.
   * @returns {Function} Funktion zum sicheren Abmelden des Videos.
   */
  registerVideo(video) {
    if (!video) return () => {};
    this.videos.add(video);
    this.applyToVideo(video);
    return () => this.videos.delete(video);
  }

  /**
   * Informiert eine Oberfläche sofort und bei jeder Zustandsänderung.
   * @param {Function} listener - Empfänger des aktuellen Boolean-Werts.
   * @returns {Function} Funktion zum Abmelden des Empfängers.
   */
  onChange(listener) {
    this.listeners.add(listener);
    listener(this.muted);
    return () => this.listeners.delete(listener);
  }

  /**
   * Liest ausschließlich einen explizit gespeicherten Wahrheitswert.
   * @returns {boolean} Persistierter Zustand oder false als sicherer Standard.
   */
  readStoredState() {
    try {
      return this.storage?.getItem(MUTE_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  }

  /**
   * Speichert den aktuellen Zustand, sofern Browserdaten erlaubt sind.
   * @returns {void}
   */
  storeState() {
    try {
      this.storage?.setItem(MUTE_STORAGE_KEY, String(this.muted));
    } catch {
      // Das Spiel bleibt auch bei blockiertem LocalStorage voll bedienbar.
    }
  }

  /**
   * Übergibt den Zustand an alle Musik- und Effektinstanzen von Phaser.
   * @returns {void}
   */
  applyToGame() {
    if (this.game?.sound) this.game.sound.mute = this.muted;
  }

  /**
   * Synchronisiert alle derzeit laufenden Videosequenzen.
   * @returns {void}
   */
  applyToVideos() {
    this.videos.forEach((video) => this.applyToVideo(video));
  }

  /**
   * Wendet den globalen Zustand auf eine einzelne Videoinstanz an.
   * @param {Phaser.GameObjects.Video} video - Zu aktualisierendes Video.
   * @returns {void}
   */
  applyToVideo(video) {
    if (video?.setMute) video.setMute(this.muted);
  }
}

/** Gemeinsame Instanz für alle Szenen und Browser-Steuerelemente. */
export const globalMuteSystem = new GlobalMuteSystem();
