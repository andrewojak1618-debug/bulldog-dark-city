import { LevelTwoObstacleSystem } from "./level-two-obstacle-system.class.js";
import { LevelTwoDroneSystem } from "./level-two-drone-system.class.js";
import { LevelTwoDroneCombatSystem } from
  "./level-two-drone-combat-system.class.js";
import { MutantCatSystem } from "./mutant-cat-system.class.js";

/**
 * Manages level two gameplay system behavior.
 */
export class LevelTwoGameplaySystem {
  /**
   * Updates the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {number} time - The current scene time in milliseconds.
   * @param {number} delta - The elapsed time since the previous frame in milliseconds.
   * @returns {void} No value is returned.
   */
  static update(scene, time, delta) {
    if (this.shouldPauseGameplay(scene)) return;
    if (this.resolveLevelExit(scene)) return;
    scene.mutationSystem?.update(scene.inputSystem);
    this.updatePlayerAndDrones(scene, time, delta);
    if (this.resolveRocketAttack(scene, time)) return;
    if (this.resolveCatAttack(scene, time)) return;
    this.unlockExit(scene);
  }

  /**
   * Resolves level exit.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {boolean} Whether the requested condition is met.
   */
  static resolveLevelExit(scene) {
    if (scene.levelExit?.update(scene.player)) {
      scene.completeLevel();
      return true;
    }
    return Boolean(scene.levelExit?.isTransitioning);
  }

  /**
   * Checks the pause gameplay condition.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {boolean} Whether the requested condition is met.
   */
  static shouldPauseGameplay(scene) {
    if (scene.captureSystem?.isActive) {
      scene.captureSystem.update();
      return true;
    }
    return scene.updateLevelEntry();
  }

  /**
   * Updates player and drones.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {number} time - The current scene time in milliseconds.
   * @param {number} delta - The elapsed time since the previous frame in milliseconds.
   * @returns {void} No value is returned.
   */
  static updatePlayerAndDrones(scene, time, delta) {
    LevelTwoObstacleSystem.updatePlayerPlatformContact(
      scene.player,
      scene.floatingLightPlatforms,
    );
    scene.player?.updateMovement(scene.inputSystem, time);
    LevelTwoDroneSystem.update(scene.drones, scene.player, delta);
    LevelTwoDroneCombatSystem.update(scene.drones, scene.player);
  }

  /**
   * Resolves rocket attack.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {number} time - The current scene time in milliseconds.
   * @returns {boolean} Whether the requested condition is met.
   */
  static resolveRocketAttack(scene, time) {
    if (!scene.rocketSystem.update(time)) return false;
    scene.captureSystem.start(scene.player, scene.mutantCats);
    return true;
  }

  /**
   * Resolves cat attack.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {number} time - The current scene time in milliseconds.
   * @returns {boolean} Whether the requested condition is met.
   */
  static resolveCatAttack(scene, time) {
    const wasKnockedOut = MutantCatSystem.update(
      scene.mutantCats,
      scene.player,
      scene.healthSystem,
      time,
    );
    if (!wasKnockedOut) return false;
    scene.captureSystem.start(scene.player, scene.mutantCats);
    return true;
  }

  /**
   * Handles unlock exit.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {boolean} Whether the requested condition is met.
   */
  static unlockExit(scene) {
    if (scene.levelExit?.isUnlocked) return true;
    const allCatsDefeated = scene.mutantCats?.every((cat) => cat.isDead);
    const allDronesDefeated = scene.drones?.every((drone) =>
      drone.getData("isDestroyed")
    );
    if (!allCatsDefeated || !allDronesDefeated) return false;
    scene.levelExit.unlock();
    return true;
  }
}
