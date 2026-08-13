const MUTE_STORAGE_KEY = "bulldog-dark-city.audio-muted";

/**
 * Manages global mute system behavior.
 */
export class GlobalMuteSystem {
  /**
   * Creates a new instance.
   * @param {Storage|null} [storage=GlobalMuteSystem.getDefaultStorage()] - The storage implementation to use.
   */
  constructor(storage = GlobalMuteSystem.getDefaultStorage()) {
    this.storage = storage;
    this.game = null;
    this.videos = new Set();
    this.listeners = new Set();
    this.muted = this.readStoredState();
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
    this.game = game;
    this.applyToGame();
  }

  /**
   * Checks the muted condition.
   * @returns {boolean} Whether the requested condition is met.
   */
  isMuted() {
    return this.muted;
  }

  /**
   * Toggles the current state.
   * @returns {boolean} Whether the requested condition is met.
   */
  toggle() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  /**
   * Sets muted.
   * @param {boolean} muted - The muted value.
   * @returns {void} No value is returned.
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
   * Registers video.
   * @param {Phaser.GameObjects.Video} video - The video value.
   * @returns {Function} The generated callback function.
   */
  registerVideo(video) {
    if (!video) return () => {};
    this.videos.add(video);
    this.applyToVideo(video);
    return () => this.videos.delete(video);
  }

  /**
   * Handles on change.
   * @param {Function} listener - The listener value.
   * @returns {Function} The generated callback function.
   */
  onChange(listener) {
    this.listeners.add(listener);
    listener(this.muted);
    return () => this.listeners.delete(listener);
  }

  /**
   * Reads stored state.
   * @returns {boolean} Whether the requested condition is met.
   */
  readStoredState() {
    try {
      return this.storage?.getItem(MUTE_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  }

  /**
   * Handles store state.
   * @returns {void} No value is returned.
   */
  storeState() {
    try {
      this.storage?.setItem(MUTE_STORAGE_KEY, String(this.muted));
    } catch {
      // Das Spiel bleibt auch bei blockiertem LocalStorage voll bedienbar.
    }
  }

  /**
   * Applies to game.
   * @returns {void} No value is returned.
   */
  applyToGame() {
    if (this.game?.sound) this.game.sound.mute = this.muted;
  }

  /**
   * Applies to videos.
   * @returns {void} No value is returned.
   */
  applyToVideos() {
    this.videos.forEach((video) => this.applyToVideo(video));
  }

  /**
   * Applies to video.
   * @param {Phaser.GameObjects.Video} video - The video value.
   * @returns {void} No value is returned.
   */
  applyToVideo(video) {
    if (video?.setMute) video.setMute(this.muted);
  }
}

/**
 * Defines the global mute system configuration.
 */
export const globalMuteSystem = new GlobalMuteSystem();
