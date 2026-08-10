import { MENU_START_TRANSITION } from
  "../../js/config/menu-transition-settings.js";

/**
 * @typedef {Object} LevelPreloadOptions
 * @property {string} readyKey - Eindeutiger Registry-Schlüssel des Levels.
 * @property {string} promiseKey - Registry-Schlüssel des laufenden Ladevorgangs.
 * @property {() => void} queue - Funktion zum Befüllen des Phaser-Loaders.
 */

/** Bündelt den wiederverwendbaren Hintergrund-Loader für Spielszenen. */
export class LevelPreloadSystem {
  /**
   * Startet einen Ladevorgang nur, wenn das Level noch nicht vorbereitet ist.
   * @param {Phaser.Scene} scene - Aktive Szene mit Loader und Registry.
   * @param {LevelPreloadOptions} options - Schlüssel und Ladefunktion.
   * @returns {Promise<void>} Abschluss des Hintergrundladens.
   */
  static preload(scene, options) {
    if (this.isReady(scene, options.readyKey)) return Promise.resolve();
    const activePromise = scene.registry.get(options.promiseKey);
    if (activePromise) return activePromise;

    options.queue();
    const promise = this.createLoadPromise(scene, options);
    scene.registry.set(options.promiseKey, promise);
    scene.load.start();
    return promise;
  }

  /**
   * Erstellt das gemeinsame Abschlussversprechen des Phaser-Loaders.
   * @param {Phaser.Scene} scene - Aktive Szene.
   * @param {LevelPreloadOptions} options - Registry-Konfiguration.
   * @returns {Promise<void>} Abschluss des Ladevorgangs.
   */
  static createLoadPromise(scene, options) {
    return new Promise((resolve) => {
      scene.load.once("complete", () => {
        scene.registry.set(options.readyKey, true);
        scene.registry.remove(options.promiseKey);
        resolve();
      });
    });
  }

  /**
   * Führt den Szenenwechsel sofort oder nach dem restlichen Laden aus.
   * @param {Phaser.Scene} scene - Aktive Ausgangsszene.
   * @param {string} readyKey - Registry-Schlüssel des Ziellevels.
   * @param {Promise<void>} readyPromise - Laufender Ladevorgang.
   * @param {() => void} onReady - Auszuführender Szenenwechsel.
   * @returns {void}
   */
  static enterWhenReady(scene, readyKey, readyPromise, onReady) {
    if (this.isReady(scene, readyKey)) {
      onReady();
      return;
    }
    const hint = this.createLoadingHint(scene);
    readyPromise.then(() => {
      hint.destroy();
      onReady();
    });
  }

  /**
   * Zeigt einen dezenten Ladehinweis, falls das Ziellevel noch nicht bereit ist.
   * @param {Phaser.Scene} scene - Aktive Ausgangsszene.
   * @returns {Phaser.GameObjects.Text} Sichtbarer Ladehinweis.
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
   * Prüft den globalen Ladezustand eines Ziellevels.
   * @param {Phaser.Scene} scene - Beliebige aktive Szene.
   * @param {string} readyKey - Registry-Schlüssel des Ziellevels.
   * @returns {boolean} Ob alle Ziellevel-Assets im Cache liegen.
   */
  static isReady(scene, readyKey) {
    return scene.registry.get(readyKey) === true;
  }
}
