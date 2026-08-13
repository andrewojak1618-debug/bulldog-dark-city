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

/**
 * Manages level one preload system behavior.
 */
export class LevelOnePreloadSystem {
  /**
   * Queues the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
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
