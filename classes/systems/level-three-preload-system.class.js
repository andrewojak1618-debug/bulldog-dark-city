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

/**
 * Manages level three preload system behavior.
 */
export class LevelThreePreloadSystem {
  /**
   * Queues the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
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
   * Preloads after entry.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {Promise<boolean>} Whether the requested condition is met.
   */
  static preloadAfterEntry(scene) {
    return new Promise((resolve) => {
      scene.time.delayedCall(LEVEL_THREE.preloadDelayMs, () => {
        this.preload(scene).then(resolve);
      });
    });
  }

  /**
   * Preloads the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {Promise<boolean>} Whether the requested condition is met.
   */
  static preload(scene) {
    return LevelPreloadSystem.preload(scene, {
      readyKey: READY_KEY,
      promiseKey: PROMISE_KEY,
      queue: () => this.queue(scene),
    });
  }

  /**
   * Handles enter when ready.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Promise<boolean>} readyPromise - The ready promise value.
   * @param {() => void} onReady - The on ready value.
   * @returns {void} No value is returned.
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
   * Checks the ready condition.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {boolean} Whether the requested condition is met.
   */
  static isReady(scene) {
    return LevelPreloadSystem.isReady(scene, READY_KEY);
  }

  /**
   * Completes entry.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static completeEntry(scene) {
    LevelPreloadSystem.hideLoadingOverlayAfterRender(scene);
  }
}
