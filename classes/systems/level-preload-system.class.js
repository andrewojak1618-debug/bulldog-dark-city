import { MENU_START_TRANSITION } from
  "../../js/config/menu-transition-settings.js";
import { LoadingOverlay } from "../ui/loading-overlay.class.js";

/**
 * Defines the LevelPreloadOptions data structure.
 * @typedef {Object} LevelPreloadOptions
 * @property {string} readyKey - The ready key value.
 * @property {string} promiseKey - The promise key value.
 * @property {() => void} queue - The queue value.
 */

/**
 * Manages level preload system behavior.
 */
export class LevelPreloadSystem {
  /**
   * Preloads the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {LevelPreloadOptions} options - The optional configuration values.
   * @returns {Promise<boolean>} Whether the requested condition is met.
   */
  static preload(scene, options) {
    if (this.isReady(scene, options.readyKey)) return Promise.resolve(true);
    const activePromise = scene.registry.get(options.promiseKey);
    if (activePromise) return activePromise;

    options.queue();
    const promise = this.createLoadPromise(scene, options);
    scene.registry.set(options.promiseKey, promise);
    scene.load.start();
    return promise;
  }

  /**
   * Creates load promise.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {LevelPreloadOptions} options - The optional configuration values.
   * @returns {Promise<boolean>} Whether the requested condition is met.
   */
  static createLoadPromise(scene, options) {
    const failedFiles = new Set();
    const handleLoadError = (file) => this.trackFailure(failedFiles, file);
    scene.load.on?.("loaderror", handleLoadError);

    return new Promise((resolve) => {
      scene.load.once("complete", () => this.completeLoad(
        scene,
        options,
        failedFiles,
        handleLoadError,
        resolve,
      ));
    });
  }

  /**
   * Handles track failure.
   */
  static trackFailure(failedFiles, file) {
    failedFiles.add(file?.key ?? "unbekanntes Asset");
  }

  /**
   * Completes load.
   */
  static completeLoad(scene, options, failedFiles, errorHandler, resolve) {
    scene.load.off?.("loaderror", errorHandler);
    scene.registry.remove(options.promiseKey);
    const wasSuccessful = failedFiles.size === 0;
    scene.registry.set(options.readyKey, wasSuccessful);
    resolve(wasSuccessful);
  }

  /**
   * Handles enter when ready.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {string} readyKey - The ready key value.
   * @param {Promise<boolean>} readyPromise - The ready promise value.
   * @param {() => void} onReady - The on ready value.
   * @returns {void} No value is returned.
   */
  static enterWhenReady(scene, readyKey, readyPromise, onReady) {
    const overlay = this.showLoadingOverlay();
    const hint = overlay ? null : this.createLoadingHint(scene);
    const enterLevel = () => this.enterLevel(scene, hint, onReady);

    if (this.isReady(scene, readyKey)) return enterLevel();
    readyPromise.then((wasSuccessful) =>
      this.resolveLevelEntry(wasSuccessful, hint, enterLevel));
  }

  /**
   * Handles enter level.
   */
  static enterLevel(scene, hint, onReady) {
    hint?.destroy();
    this.runAfterBrowserPaint(scene, onReady);
  }

  /**
   * Resolves level entry.
   */
  static resolveLevelEntry(wasSuccessful, hint, enterLevel) {
    if (wasSuccessful) return enterLevel();
    hint?.setText("LEVEL KONNTE NICHT GELADEN WERDEN");
    this.showLoadingError();
  }

  /**
   * Shows loading overlay.
   * @returns {HTMLElement|null} The resulting value.
   */
  static showLoadingOverlay() {
    return LoadingOverlay.show("LEVEL WIRD GELADEN ...");
  }

  /**
   * Shows loading error.
   */
  static showLoadingError() {
    LoadingOverlay.showError("LEVEL KONNTE NICHT GELADEN WERDEN");
  }

  /**
   * Hides loading overlay after render.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static hideLoadingOverlayAfterRender(scene) {
    scene.game.events.once("postrender", () => LoadingOverlay.hide());
  }

  /**
   * Handles run after browser paint.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {() => void} callback - The callback to invoke.
   * @returns {void} No value is returned.
   */
  static runAfterBrowserPaint(scene, callback) {
    if (typeof globalThis.requestAnimationFrame !== "function") {
      scene.time.delayedCall(0, callback);
      return;
    }
    globalThis.requestAnimationFrame(() => {
      globalThis.requestAnimationFrame(callback);
    });
  }

  /**
   * Creates loading hint.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {Phaser.GameObjects.Text} The resulting data object.
   */
  static createLoadingHint(scene) {
    const { loading, depths } = MENU_START_TRANSITION;
    return scene.add.text(
      scene.scale.width / 2,
      scene.scale.height - loading.offsetY,
      loading.text,
      {
        fontFamily: loading.fontFamily,
        fontSize: `${loading.fontSize}px`,
        color: loading.color,
      },
    ).setOrigin(0.5).setScrollFactor(0).setDepth(depths.loadingHint);
  }

  /**
   * Checks the ready condition.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {string} readyKey - The ready key value.
   * @returns {boolean} Whether the requested condition is met.
   */
  static isReady(scene, readyKey) {
    return scene.registry.get(readyKey) === true;
  }
}
