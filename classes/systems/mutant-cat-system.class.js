import { MutantCat } from "../entities/enemies/mutant-cat.class.js";
import { MutantCatAnimationSystem } from "./mutant-cat-animation-system.class.js";
import { MutantCatAudioSystem } from
  "./mutant-cat-audio-system.class.js";
import { BulldogMutationStateSystem } from
  "./bulldog-mutation-state-system.class.js";
import { MutantCatGroundingSystem } from
  "./mutant-cat-grounding-system.class.js";
import {
  MUTANT_CAT,
  MUTANT_CAT_ATTENTIVE_TEXTURE,
  MUTANT_CAT_ATTACK_TEXTURE,
  MUTANT_CAT_DEAD_TEXTURE,
  MUTANT_CAT_TEXTURE,
} from "../../js/config/mutant-cat-settings.js";

/**
 * Manages mutant cat system behavior.
 */
export class MutantCatSystem {
  /**
   * Loads the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static load(scene) {
    [
      MUTANT_CAT_TEXTURE,
      MUTANT_CAT_ATTENTIVE_TEXTURE,
      MUTANT_CAT_ATTACK_TEXTURE,
      MUTANT_CAT_DEAD_TEXTURE,
    ].forEach((texture) => {
      scene.load.spritesheet(texture.key, texture.path, {
        frameWidth: texture.frameWidth,
        frameHeight: texture.frameHeight,
      });
    });
    MutantCatAudioSystem.load(scene);
  }

  /**
   * Creates the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.Physics.Arcade.StaticGroup} platforms - The platforms value.
   * @returns {MutantCat[]} The resulting collection.
   */
  static create(scene, platforms) {
    MutantCatAnimationSystem.register(scene);
    return MUTANT_CAT.patrols.map((patrol) => {
      const cat = new MutantCat(
        scene,
        patrol.spawnX,
        MUTANT_CAT.spawnY,
        MUTANT_CAT_TEXTURE.key,
        patrol,
      );

      scene.physics.add.collider(cat, platforms);
      return cat;
    });
  }

  /**
   * Updates the current state.
   * @param {MutantCat[]} cats - The cats value.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - The player-controlled bulldog.
   * @param {import("./health-system.class.js").HealthSystem} health - The associated health system.
   * @param {number} time - The current scene time in milliseconds.
   * @returns {boolean} Whether the requested condition is met.
   */
  static update(cats, player, health, time) {
    let wasKnockedOut = false;

    cats.forEach((cat) => {
      MutantCatGroundingSystem.update(cat);
      cat?.updateBehavior(player, time);
      this.resolvePlayerAttack(cat, player, time);
      if (wasKnockedOut || !cat?.consumeAttackHit(player)) return;
      wasKnockedOut = this.resolveCatAttack(player, health, time);
    });
    return wasKnockedOut;
  }

  /**
   * Resolves player attack.
   * @param {MutantCat} cat - The mutant cat instance.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - The player-controlled bulldog.
   * @param {number} time - The current scene time in milliseconds.
   * @returns {void} No value is returned.
   */
  static resolvePlayerAttack(cat, player, time) {
    const wasHit = player?.consumeAttackHit(
      cat,
      MUTANT_CAT.biteHitRange,
      MUTANT_CAT.biteGroundLevelTolerance,
    );
    if (wasHit) cat.takeBiteHit(time);
  }

  /**
   * Resolves cat attack.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - The player-controlled bulldog.
   * @param {import("./health-system.class.js").HealthSystem} health - The associated health system.
   * @param {number} time - The current scene time in milliseconds.
   * @returns {boolean} Whether the requested condition is met.
   */
  static resolveCatAttack(player, health, time) {
    if (!BulldogMutationStateSystem.canReceiveNormalDamage(player)) {
      return false;
    }
    const remainingHealth = health.takeDamage(MUTANT_CAT.attackDamage);
    if (remainingHealth === 0) {
      player.knockOut();
      return true;
    }
    player.takeHit(time);
    return false;
  }
}
