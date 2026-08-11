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
   * @returns {Promise<boolean>} Erfolgsstatus des Hintergrundladens.
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
   * Erstellt das gemeinsame Abschlussversprechen des Phaser-Loaders.
   * @param {Phaser.Scene} scene - Aktive Szene.
   * @param {LevelPreloadOptions} options - Registry-Konfiguration.
   * @returns {Promise<boolean>} `true` bei vollstaendig geladenen Assets.
   */
  static createLoadPromise(scene, options) {
    const failedFiles = new Set();
    const handleLoadError = (file) => {
      failedFiles.add(file?.key ?? "unbekanntes Asset");
    };
    scene.load.on?.("loaderror", handleLoadError);

    return new Promise((resolve) => {
      scene.load.once("complete", () => {
        scene.load.off?.("loaderror", handleLoadError);
        scene.registry.remove(options.promiseKey);
        if (failedFiles.size > 0) {
          scene.registry.set(options.readyKey, false);
          resolve(false);
          return;
        }
        scene.registry.set(options.readyKey, true);
        resolve(true);
      });
    });
  }

  /**
   * Führt den Szenenwechsel sofort oder nach dem restlichen Laden aus.
   * @param {Phaser.Scene} scene - Aktive Ausgangsszene.
   * @param {string} readyKey - Registry-Schlüssel des Ziellevels.
   * @param {Promise<boolean>} readyPromise - Laufender Ladevorgang.
   * @param {() => void} onReady - Auszuführender Szenenwechsel.
   * @returns {void}
   */
  static enterWhenReady(scene, readyKey, readyPromise, onReady) {
    const overlay = this.showLoadingOverlay();
    const hint = overlay ? null : this.createLoadingHint(scene);
    const enterLevel = () => {
      hint?.destroy();
      this.runAfterBrowserPaint(scene, onReady);
    };

    if (this.isReady(scene, readyKey)) {
      enterLevel();
      return;
    }
    readyPromise.then((wasSuccessful) => {
      if (wasSuccessful) {
        enterLevel();
        return;
      }
      hint?.setText("LEVEL KONNTE NICHT GELADEN WERDEN");
      this.showLoadingError();
    });
  }

  /**
   * Macht die DOM-Ladeanzeige auch waehrend eines blockierten Frames sichtbar.
   * @returns {HTMLElement|null} Ladeanzeige oder `null` ausserhalb des Browsers.
   */
  static showLoadingOverlay() {
    const overlay = globalThis.document?.getElementById(
      "level-loading-overlay",
    );
    if (!overlay) return null;
    overlay.classList.remove("level-loading-overlay--error");
    const message = overlay.querySelector("[data-loading-message]");
    if (message) message.textContent = "LEVEL WIRD GELADEN ...";
    overlay.setAttribute("aria-hidden", "false");
    overlay.classList.add("level-loading-overlay--visible");
    return overlay;
  }

  /** Kennzeichnet einen fehlgeschlagenen Wechsel sichtbar statt einzufrieren. */
  static showLoadingError() {
    const overlay = this.showLoadingOverlay();
    if (!overlay) return;
    overlay.classList.add("level-loading-overlay--error");
    const message = overlay.querySelector("[data-loading-message]");
    if (message) message.textContent = "LEVEL KONNTE NICHT GELADEN WERDEN";
  }

  /**
   * Entfernt die Ladeanzeige nach dem ersten gerenderten Frame des Ziellevels.
   * @param {Phaser.Scene} scene - Neu aufgebaute Zielszene.
   * @returns {void}
   */
  static hideLoadingOverlayAfterRender(scene) {
    const hide = () => {
      const overlay = globalThis.document?.getElementById(
        "level-loading-overlay",
      );
      overlay?.classList.remove("level-loading-overlay--visible");
      overlay?.setAttribute("aria-hidden", "true");
    };
    scene.game.events.once("postrender", hide);
  }

  /**
   * Gibt dem Browser zwei Frames Zeit, die Ladeanzeige sichtbar zu zeichnen.
   * @param {Phaser.Scene} scene - Aktive Ausgangsszene.
   * @param {() => void} callback - Anschliessender Szenenwechsel.
   * @returns {void}
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
