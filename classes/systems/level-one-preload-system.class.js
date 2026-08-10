import { BulldogAnimationSystem } from "./bulldog-animation-system.class.js";
import { DogCatcherSystem } from "./dog-catcher-system.class.js";
import { LevelHudSystem } from "./level-hud-system.class.js";
import { LevelItemSystem } from "./level-item-system.class.js";
import { LevelExitSystem } from "./level-exit-system.class.js";
import { BackgroundMusicSystem } from "./background-music-system.class.js";
import { LevelEnvironmentSystem } from "./level-environment-system.class.js";
import { LevelOnePlatformSystem } from "./level-one-platform-system.class.js";
import { LEVEL_MUSIC } from "../../js/config/level-music-settings.js";
import { LevelPreloadSystem } from "./level-preload-system.class.js";

const READY_KEY = "level-one-assets-ready";
const PROMISE_KEY = "level-one-assets-promise";

/** Lädt die Assets von Level 1 bereits während des Hauptmenüs. */
export class LevelOnePreloadSystem {
  /**
   * Stellt alle benötigten Dateien in die aktuelle Phaser-Ladewarteschlange.
   * @param {Phaser.Scene} scene - Szene mit aktivem Loader.
   * @returns {void}
   */
  static queue(scene) {
    BulldogAnimationSystem.load(scene);
    DogCatcherSystem.load(scene);
    LevelHudSystem.load(scene);
    LevelItemSystem.load(scene);
    LevelExitSystem.load(scene);
    BackgroundMusicSystem.load(scene, LEVEL_MUSIC.opening);
    LevelEnvironmentSystem.load(scene);
    LevelOnePlatformSystem.load(scene);
  }

  /**
   * Startet das Hintergrundladen genau einmal pro Spielsitzung.
   * @param {Phaser.Scene} scene - Aktive Menüszene.
   * @returns {Promise<void>} Abschluss des Hintergrundladens.
   */
  static preload(scene) {
    return LevelPreloadSystem.preload(scene, {
      readyKey: READY_KEY,
      promiseKey: PROMISE_KEY,
      queue: () => this.queue(scene),
    });
  }

  /**
   * Wartet bei einem frühen Video-Skip sichtbar auf die restlichen Dateien.
   * @param {Phaser.Scene} scene - Aktive Menüszene.
   * @param {Promise<void>} readyPromise - Laufender Ladevorgang.
   * @param {() => void} onReady - Wechsel in Level 1.
   * @returns {void}
   */
  static enterWhenReady(scene, readyPromise, onReady) {
    LevelPreloadSystem.enterWhenReady(
      scene, READY_KEY, readyPromise, onReady,
    );
  }

  /**
   * Prüft den globalen Ladezustand von Level 1.
   * @param {Phaser.Scene} scene - Beliebige aktive Szene.
   * @returns {boolean} Ob alle Level-1-Assets im Cache liegen.
   */
  static isReady(scene) {
    return LevelPreloadSystem.isReady(scene, READY_KEY);
  }
}
