import { DogCatcher } from "../entities/enemies/dog-catcher.class.js";
import { DogCatcherAudioSystem } from
  "./dog-catcher-audio-system.class.js";
import { BulldogMutationStateSystem } from
  "./bulldog-mutation-state-system.class.js";
import {
  DOG_CATCHER,
  DOG_CATCHER_EVENTS,
  DOG_CATCHER_TEXTURES,
} from "../../js/config/dog-catcher-settings.js";

/**
 * Manages dog catcher system behavior.
 */
export class DogCatcherSystem {
  /**
   * Loads the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static load(scene) {
    Object.values(DOG_CATCHER_TEXTURES).forEach((texture) => {
      if (scene.textures.exists(texture.key)) return;
      scene.load.spritesheet(texture.key, texture.path, {
        frameWidth: texture.frameWidth,
        frameHeight: texture.frameHeight,
      });
    });
    DogCatcherAudioSystem.load(scene);
  }

  /**
   * Creates the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.Physics.Arcade.StaticGroup} platforms - The platforms value.
   * @returns {Phaser.GameObjects.Group} The resulting data object.
   */
  static create(scene, platforms) {
    const group = scene.add.group({ runChildUpdate: false });
    group.add(new DogCatcher(
      scene,
      DOG_CATCHER.spawnX,
      DOG_CATCHER.spawnY,
      DOG_CATCHER_TEXTURES.walk.key,
    ));
    scene.physics.add.collider(group, platforms);
    return group;
  }

  /**
   * Updates the current state.
   * @param {Phaser.GameObjects.Group} group - The Phaser group to process.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @param {import("./health-system.class.js").HealthSystem} health - The associated health system.
   * @param {number} time - The current scene time in milliseconds.
   * @returns {void} No value is returned.
   */
  static update(group, player, health, time) {
    group?.getChildren().forEach((dogCatcher) => {
      dogCatcher.updateBehavior(player, time);
      const dogCatcherHitPlayer = dogCatcher.consumeAttackHit(player);
      const playerHitDogCatcher = player.consumeAttackHit(
        dogCatcher,
        DOG_CATCHER.biteHitRange,
        DOG_CATCHER.biteGroundLevelTolerance,
      );
      this.resolvePlayerHit(dogCatcherHitPlayer, player, health, time);
      if (playerHitDogCatcher) dogCatcher.takeBiteHit(time);
    });
  }

  /**
   * Handles once defeated.
   * @param {Phaser.GameObjects.Group} group - The Phaser group to process.
   * @param {Function} callback - The callback to invoke.
   * @returns {void} No value is returned.
   */
  static onceDefeated(group, callback) {
    group?.getChildren().forEach((dogCatcher) => {
      dogCatcher.once(
        DOG_CATCHER_EVENTS.defeated,
        () => callback(dogCatcher),
      );
    });
  }

  /**
   * Resolves player hit.
   * @param {boolean} wasHit - The was hit value.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - The player-controlled bulldog.
   * @param {import("./health-system.class.js").HealthSystem} health - The associated health system.
   * @param {number} time - The current scene time in milliseconds.
   * @returns {void} No value is returned.
   */
  static resolvePlayerHit(wasHit, player, health, time) {
    if (!wasHit || !BulldogMutationStateSystem.canReceiveNormalDamage(player)) {
      return;
    }

    const remainingHealth = health.takeDamage(DOG_CATCHER.attackDamage);
    if (remainingHealth === 0) {
      player.knockOut();
      return;
    }
    player.takeHit(time);
  }
}
