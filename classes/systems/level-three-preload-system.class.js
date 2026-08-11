import { BulldogAnimationSystem } from
  "./bulldog-animation-system.class.js";
import { LevelThreeEnvironmentSystem } from
  "./level-three-environment-system.class.js";
import { LevelThreeObstacleSystem } from
  "./level-three-obstacle-system.class.js";
import { RobotCatSystem } from "./robot-cat-system.class.js";
import { ThrowBoneSystem } from "./throw-bone-system.class.js";
import { LevelHudSystem } from "./level-hud-system.class.js";
import { LevelItemSystem } from "./level-item-system.class.js";
import { BackgroundMusicSystem } from "./background-music-system.class.js";
import { LevelPreloadSystem } from "./level-preload-system.class.js";
import { LEVEL_THREE } from "../../js/config/level-three-settings.js";
import { LEVEL_MUSIC } from "../../js/config/level-music-settings.js";

const READY_KEY = "level-three-assets-ready";
const PROMISE_KEY = "level-three-assets-promise";

/** Laedt Level 3 bereits waehrend des laufenden zweiten Levels vor. */
export class LevelThreePreloadSystem {
  /**
   * Stellt gemeinsame und Level-3-exklusive Dateien in den Loader.
   * @param {Phaser.Scene} scene - Aktive Szene mit Phaser-Loader.
   * @returns {void}
   */
  static queue(scene) {
    BulldogAnimationSystem.load(scene);
    LevelThreeEnvironmentSystem.load(scene);
    LevelThreeObstacleSystem.load(scene);
    RobotCatSystem.load(scene);
    ThrowBoneSystem.load(scene);
    LevelHudSystem.load(scene);
    LevelItemSystem.load(scene);
    BackgroundMusicSystem.load(scene, LEVEL_MUSIC.levelThree);
  }

  /**
   * Beginnt das Vorladen nach der ruhigen Einstiegsphase von Level 2.
   * @param {Phaser.Scene} scene - Aktives Level 2.
   * @returns {Promise<boolean>} Erfolgsstatus des Hintergrundladens.
   */
  static preloadAfterEntry(scene) {
    return new Promise((resolve) => {
      scene.time.delayedCall(LEVEL_THREE.preloadDelayMs, () => {
        this.preload(scene).then(resolve);
      });
    });
  }

  /**
   * Startet den Level-3-Ladevorgang hoechstens einmal pro Spielsitzung.
   * @param {Phaser.Scene} scene - Aktive Szene.
   * @returns {Promise<boolean>} Erfolgsstatus des Hintergrundladens.
   */
  static preload(scene) {
    return LevelPreloadSystem.preload(scene, {
      readyKey: READY_KEY,
      promiseKey: PROMISE_KEY,
      queue: () => this.queue(scene),
    });
  }

  /**
   * Zeigt bei Bedarf den Ladebildschirm und startet danach Level 3.
   * @param {Phaser.Scene} scene - Aktives Level 2.
   * @param {Promise<boolean>} readyPromise - Laufender Ladevorgang.
   * @param {() => void} onReady - Wechsel in Level 3.
   * @returns {void}
   */
  static enterWhenReady(scene, readyPromise, onReady) {
    LevelPreloadSystem.enterWhenReady(
      scene,
      READY_KEY,
      readyPromise,
      onReady,
    );
  }

  /**
   * Prueft, ob alle Dateien des dritten Levels im Cache liegen.
   * @param {Phaser.Scene} scene - Beliebige aktive Szene.
   * @returns {boolean} Ob Level 3 vorbereitet ist.
   */
  static isReady(scene) {
    return LevelPreloadSystem.isReady(scene, READY_KEY);
  }

  /**
   * Entfernt die Ladeanzeige nach dem ersten sichtbaren Level-3-Frame.
   * @param {Phaser.Scene} scene - Vollstaendig aufgebaute Level-3-Szene.
   * @returns {void}
   */
  static completeEntry(scene) {
    LevelPreloadSystem.hideLoadingOverlayAfterRender(scene);
  }
}
