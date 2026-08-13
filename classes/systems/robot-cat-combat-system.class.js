import { BULLDOG_ATTACK_TEXTURES } from
  "../../js/config/bulldog-animation-settings.js";
import {
  ROBOT_CAT,
  ROBOT_CAT_COMBAT,
  ROBOT_CAT_DEAD_TEXTURE,
  ROBOT_CAT_FLIGHT_TEXTURE,
  ROBOT_CAT_HIT_TEXTURE,
  ROBOT_CAT_STATES,
  ROBOT_CAT_WALK_TEXTURE,
} from "../../js/config/robot-cat-settings.js";
import { RobotCatAudioSystem } from
  "./robot-cat-audio-system.class.js";

const ANIMATION_COMPLETE_PREFIX = "animationcomplete-";

/**
 * Manages robot cat combat system behavior.
 */
export class RobotCatCombatSystem {
  /**
   * Updates the current state.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @param {import("./health-system.class.js").HealthSystem} health - The associated health system.
   * @returns {boolean} Whether the requested condition is met.
   */
  static update(robotCat, player, health) {
    if (!this.isImpactFrameReady(robotCat, player, health)) return false;
    if (!this.canReceiveMeleeAttack(robotCat, player)) return false;
    if (!this.isTargetInRange(robotCat, player)) return false;
    player.attackHitConsumed = true;
    return this.applyDamage(
      robotCat,
      health,
      ROBOT_CAT_COMBAT.damagePerHit,
    );
  }

  /**
   * Checks the receive melee attack condition.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @returns {boolean} Whether the requested condition is met.
   */
  static canReceiveMeleeAttack(robotCat, player) {
    return Boolean(
      player?.isMutated ||
      robotCat?.getData?.("movementState") === ROBOT_CAT_STATES.walking,
    );
  }

  /**
   * Applies damage.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @param {import("./health-system.class.js").HealthSystem} health - The associated health system.
   * @param {number} damage - The amount of damage to apply.
   * @returns {boolean} Whether the requested condition is met.
   */
  static applyDamage(robotCat, health, damage) {
    if (!robotCat?.active || health.getCurrent() <= 0) return false;
    const remaining = health.takeDamage(damage);
    if (remaining === 0) {
      this.defeat(robotCat);
    } else {
      this.showHitFeedback(robotCat);
    }
    return true;
  }

  /**
   * Checks the impact frame ready condition.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @param {import("./health-system.class.js").HealthSystem} health - The associated health system.
   * @returns {boolean} Whether the requested condition is met.
   */
  static isImpactFrameReady(robotCat, player, health) {
    if (!robotCat?.active || health.getCurrent() <= 0 ||
        !player?.isAttacking || player.attackHitConsumed) return false;
    const animationKey = player.anims.currentAnim?.key;
    const texture = BULLDOG_ATTACK_TEXTURES[animationKey];
    return Boolean(
      texture &&
      player.anims.currentFrame?.textureFrame === texture.frameCount - 1,
    );
  }

  /**
   * Checks the target in range condition.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @returns {boolean} Whether the requested condition is met.
   */
  static isTargetInRange(robotCat, player) {
    const direction = player.flipX ? -1 : 1;
    const distanceX = robotCat.x - player.x;
    const playerFeetY = player.body?.bottom ?? player.y;
    return (
      distanceX * direction >= 0 &&
      Math.abs(distanceX) <= ROBOT_CAT_COMBAT.attackHitRangeX &&
      Math.abs(robotCat.y - playerFeetY) <= ROBOT_CAT_COMBAT.attackHitRangeY
    );
  }

  /**
   * Shows hit feedback.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @returns {void} No value is returned.
   */
  static showHitFeedback(robotCat) {
    const eventName = ANIMATION_COMPLETE_PREFIX +
      ROBOT_CAT_HIT_TEXTURE.animationKey;
    if (!robotCat.getData("isHitReacting")) {
      robotCat.setData("isHitReacting", true);
      robotCat.setData(
        "hitPreviousMovementState",
        robotCat.getData("movementState"),
      );
    }
    robotCat.off(eventName);
    robotCat.once(eventName, () => this.finishHitFeedback(robotCat));
    robotCat.play(ROBOT_CAT_HIT_TEXTURE.animationKey, true)
      .setDisplaySize(ROBOT_CAT.displayWidth, ROBOT_CAT.displayHeight);
  }

  /**
   * Completes hit feedback.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @returns {void} No value is returned.
   */
  static finishHitFeedback(robotCat) {
    robotCat.setData("isHitReacting", false);
    if (!robotCat.active) return;
    const previousState = robotCat.getData("hitPreviousMovementState");
    if (previousState === ROBOT_CAT_STATES.walking) {
      robotCat.play(ROBOT_CAT_WALK_TEXTURE.animationKey, true)
        .setDisplaySize(ROBOT_CAT.displayWidth, ROBOT_CAT.displayHeight);
      return;
    }
    robotCat.setTexture(ROBOT_CAT_FLIGHT_TEXTURE.key, 2)
      .setDisplaySize(ROBOT_CAT.flightDisplaySize, ROBOT_CAT.flightDisplaySize);
  }

  /**
   * Handles defeat.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @returns {void} No value is returned.
   */
  static defeat(robotCat) {
    robotCat.off(ANIMATION_COMPLETE_PREFIX + ROBOT_CAT_HIT_TEXTURE.animationKey);
    robotCat.setData("isHitReacting", false);
    robotCat.setData("isDefeated", true);
    RobotCatAudioSystem.stopThrustFlight(robotCat);
    this.disableCollision(robotCat);
    this.playDefeatAnimation(robotCat);
  }

  /**
   * Disables the defeated robot cat's collision body.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @returns {void} No value is returned.
   */
  static disableCollision(robotCat) {
    const collision = robotCat.getData("collision");
    if (collision?.body) collision.body.enable = false;
  }

  /**
   * Plays the robot cat defeat animation on the ground.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @returns {void} No value is returned.
   */
  static playDefeatAnimation(robotCat) {
    robotCat.setActive(true).setVisible(true).setAlpha(1);
    robotCat.anims.stop();
    robotCat.setY(robotCat.getData("groundY"))
      .setDepth(ROBOT_CAT.depth + 1)
      .setTexture(ROBOT_CAT_DEAD_TEXTURE.key, 0)
      .play(ROBOT_CAT_DEAD_TEXTURE.animationKey)
      .setDisplaySize(ROBOT_CAT.displayWidth, ROBOT_CAT.displayHeight);
  }
}
