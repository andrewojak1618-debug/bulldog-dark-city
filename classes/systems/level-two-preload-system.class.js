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

/**
 * Manages level two preload system behavior.
 */
export class LevelTwoPreloadSystem {
  /**
   * Queues the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
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
   * Preloads after entry.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {Promise<boolean>} Whether the requested condition is met.
   */
  static preloadAfterEntry(scene) {
    return new Promise((resolve) => {
      scene.time.delayedCall(LEVEL_TWO.preloadDelayMs, () => {
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
      scene, READY_KEY, readyPromise, onReady,
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
