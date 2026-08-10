import { BulldogAnimationSystem } from "./bulldog-animation-system.class.js";
import { LevelTwoEnvironmentSystem } from
  "./level-two-environment-system.class.js";
import { LevelTwoDroneSystem } from "./level-two-drone-system.class.js";
import { LevelTwoRocketSystem } from "./level-two-rocket-system.class.js";
import { LevelTwoObstacleSystem } from "./level-two-obstacle-system.class.js";
import { LevelHudSystem } from "./level-hud-system.class.js";
import { LevelItemSystem } from "./level-item-system.class.js";
import { MutantCatSystem } from "./mutant-cat-system.class.js";
import { MutantCatRewardSystem } from "./mutant-cat-reward-system.class.js";
import { DogCatcherSystem } from "./dog-catcher-system.class.js";
import { LevelExitSystem } from "./level-exit-system.class.js";
import { BackgroundMusicSystem } from "./background-music-system.class.js";
import { LevelPreloadSystem } from "./level-preload-system.class.js";
import { LEVEL_MUSIC } from "../../js/config/level-music-settings.js";
import { LEVEL_TWO } from "../../js/config/level-two-settings.js";

const READY_KEY = "level-two-assets-ready";
const PROMISE_KEY = "level-two-assets-promise";

/** Lädt Level 2 während des Spielverlaufs von Level 1 vor. */
export class LevelTwoPreloadSystem {
  /**
   * Stellt alle gemeinsam und exklusiv benötigten Assets in den Loader.
   * @param {Phaser.Scene} scene - Szene mit aktivem Loader.
   * @returns {void}
   */
  static queue(scene) {
    BulldogAnimationSystem.load(scene);
    LevelTwoEnvironmentSystem.load(scene);
    LevelTwoDroneSystem.load(scene);
    LevelTwoRocketSystem.load(scene);
    LevelTwoObstacleSystem.load(scene);
    LevelHudSystem.load(scene);
    LevelItemSystem.load(scene);
    MutantCatSystem.load(scene);
    MutantCatRewardSystem.load(scene);
    DogCatcherSystem.load(scene);
    LevelExitSystem.load(scene);
    BackgroundMusicSystem.load(scene, LEVEL_MUSIC.levelTwo);
  }

  /**
   * Startet das Hintergrundladen nach der ruhigen Level-Einstiegsphase.
   * @param {Phaser.Scene} scene - Aktives Level 1.
   * @returns {Promise<void>} Abschluss des Hintergrundladens.
   */
  static preloadAfterEntry(scene) {
    return new Promise((resolve) => {
      scene.time.delayedCall(LEVEL_TWO.preloadDelayMs, () => {
        this.preload(scene).then(resolve);
      });
    });
  }

  /**
   * Startet das Hintergrundladen genau einmal pro Spielsitzung.
   * @param {Phaser.Scene} scene - Aktive Szene.
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
   * Wartet bei Bedarf sichtbar auf das Ziellevel und wechselt dann weiter.
   * @param {Phaser.Scene} scene - Aktives Level 1.
   * @param {Promise<void>} readyPromise - Laufender Ladevorgang.
   * @param {() => void} onReady - Wechsel in Level 2.
   * @returns {void}
   */
  static enterWhenReady(scene, readyPromise, onReady) {
    LevelPreloadSystem.enterWhenReady(
      scene, READY_KEY, readyPromise, onReady,
    );
  }

  /**
   * Prüft, ob alle Dateien von Level 2 bereits im Cache liegen.
   * @param {Phaser.Scene} scene - Beliebige aktive Szene.
   * @returns {boolean} Ob Level 2 bereit ist.
   */
  static isReady(scene) {
    return LevelPreloadSystem.isReady(scene, READY_KEY);
  }
}
