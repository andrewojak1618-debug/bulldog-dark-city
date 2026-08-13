import { LEVEL_TWO } from "../../js/config/level-two-settings.js";
import {
  BULLDOG_ANIMATION_KEYS,
  BULLDOG_TEXTURES,
} from "../../js/config/bulldog-animation-settings.js";

const ANIMATION_COMPLETE_PREFIX = "animationcomplete-";

/**
 * Manages level two drone combat system behavior.
 */
export class LevelTwoDroneCombatSystem {
  /**
   * Updates the current state.
   * @param {Phaser.GameObjects.Sprite[]} drones - The drones value.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - The player-controlled bulldog.
   * @returns {boolean} Whether the requested condition is met.
   */
  static update(drones = [], player) {
    if (!this.isImpactFrameReady(player)) return false;
    const target = this.findNearestTarget(drones, player);
    if (!target) return false;

    player.attackHitConsumed = true;
    return this.applyHit(target);
  }

  /**
   * Checks the impact frame ready condition.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - The player-controlled bulldog.
   * @returns {boolean} Whether the requested condition is met.
   */
  static isImpactFrameReady(player) {
    if (!player?.isAttacking || player.attackHitConsumed) {
      return false;
    }
    const animationKey = player.anims.currentAnim?.key;
    const texture = this.getAttackTexture(animationKey);
    return Boolean(
      texture &&
      player.anims.currentFrame?.textureFrame === texture.frameCount - 1,
    );
  }

  /**
   * Returns attack texture.
   * @param {string} animationKey - The animation key value.
   * @returns {object|null} The resulting data object.
   */
  static getAttackTexture(animationKey) {
    if (animationKey === BULLDOG_ANIMATION_KEYS.biteAttack) {
      return BULLDOG_TEXTURES.biteAttack;
    }
    if (animationKey === BULLDOG_ANIMATION_KEYS.mutationAttackLeft) {
      return BULLDOG_TEXTURES.mutationAttackLeft;
    }
    if (animationKey === BULLDOG_ANIMATION_KEYS.mutationAttackRight) {
      return BULLDOG_TEXTURES.mutationAttackRight;
    }
    return null;
  }

  /**
   * Finds nearest target.
   * @param {Phaser.GameObjects.Sprite[]} drones - The drones value.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - The player-controlled bulldog.
   * @returns {Phaser.GameObjects.Sprite|null} The resulting data object.
   */
  static findNearestTarget(drones, player) {
    const settings = LEVEL_TWO.drones;
    const facingDirection = player.flipX ? -1 : 1;
    return drones
      .filter((drone) => this.isTargetInRange(
        drone,
        player,
        facingDirection,
        settings,
      ))
      .sort((left, right) =>
        Math.abs(left.x - player.x) - Math.abs(right.x - player.x)
      )[0] ?? null;
  }

  /**
   * Checks the target in range condition.
   * @param {Phaser.GameObjects.Sprite} drone - The drone value.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @param {number} facingDirection - The facing direction value.
   * @param {object} settings - The configuration values to use.
   * @returns {boolean} Whether the requested condition is met.
   */
  static isTargetInRange(drone, player, facingDirection, settings) {
    if (!drone?.active || drone.getData("isDestroyed")) return false;
    const distanceX = drone.x - player.x;
    return (
      distanceX * facingDirection >= 0 &&
      Math.abs(distanceX) <= settings.attackHitRangeX &&
      Math.abs(drone.y - player.y) <= settings.attackHitRangeY
    );
  }

  /**
   * Applies hit.
   * @param {Phaser.GameObjects.Sprite} drone - The drone value.
   * @returns {boolean} Whether the requested condition is met.
   */
  static applyHit(drone) {
    const remainingHitPoints = Math.max(
      0,
      drone.getData("hitPoints") - 1,
    );
    drone.setData("hitPoints", remainingHitPoints);
    if (remainingHitPoints > 0) {
      this.showHitFeedback(drone);
      return true;
    }
    this.destroyDrone(drone);
    return true;
  }

  /**
   * Shows hit feedback.
   * @param {Phaser.GameObjects.Sprite} drone - The drone value.
   * @returns {void} No value is returned.
   */
  static showHitFeedback(drone) {
    drone.scene.tweens.add({
      targets: drone,
      alpha: 0.35,
      duration: 70,
      yoyo: true,
    });
  }

  /**
   * Releases drone.
   * @param {Phaser.GameObjects.Sprite} drone - The drone value.
   * @returns {void} No value is returned.
   */
  static destroyDrone(drone) {
    const settings = drone.getData("drone");
    drone.setData("isDestroyed", true);
    drone.setData("isAlert", false);
    drone.getData("patrolTween")?.stop();
    drone.getData("hoverTween")?.stop();
    drone.getData("beam")?.clear();
    drone.setOrigin(0.5).setFlipX(false).setAlpha(1);
    drone.play(settings.destructionAnimationKey);
    drone.once(
      ANIMATION_COMPLETE_PREFIX + settings.destructionAnimationKey,
      () => drone.disableInteractive().setActive(false).setVisible(false),
    );
  }
}
