import Phaser from "phaser";
import { BULLDOG_GAMEPLAY } from "../../../js/config/bulldog-gameplay-settings.js";
import {
  BULLDOG_ANIMATION_KEYS,
  BULLDOG_ANIMATION_TIMING,
  BULLDOG_ATTACK_TEXTURES,
  BULLDOG_EVENTS,
  BULLDOG_TEXTURES,
} from "../../../js/config/bulldog-animation-settings.js";
import { BulldogMovementAnimationSystem } from
  "../../systems/bulldog-movement-animation-system.class.js";
import { BulldogAudioSystem } from
  "../../systems/bulldog-audio-system.class.js";
import { BulldogMutationStateSystem } from
  "../../systems/bulldog-mutation-state-system.class.js";

/**
 * Manages bulldog behavior.
 */
export class Bulldog extends Phaser.Physics.Arcade.Sprite {
  /**
   * Creates a new instance.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {number} x - The horizontal position.
   * @param {number} y - The vertical position.
   * @param {string} texture - The texture configuration to use.
   */
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.configurePhysics();
    this.initializeState();
    this.audio = new BulldogAudioSystem(this, scene);
  }

  /**
   * Configures physics.
   * @returns {void} No value is returned.
   */
  configurePhysics() {
    const settings = BULLDOG_GAMEPLAY;
    this.setDisplaySize(settings.displayWidth, settings.displayHeight);
    this.body
      .setSize(settings.bodyWidth, settings.bodyHeight)
      .setOffset(settings.bodyOffsetX, settings.bodyOffsetY);
    this.setCollideWorldBounds(true);
    this.setMaxVelocity(settings.moveSpeed, settings.maxFallSpeed);
  }

  /**
   * Initializes state.
   * @returns {void} No value is returned.
   */
  initializeState() {
    this.standingStartedAt = null;
    this.wasFalling = false;
    this.isLanding = false;
    this.isAttacking = false;
    this.attackHitConsumed = false;
    this.activeAttackAnimationKey = null;
    this.isHit = false;
    this.hitReactionEndsAt = 0;
    this.isKnockedOut = false;
    BulldogMutationStateSystem.initialize(this);
  }

  /**
   * Updates movement.
   * @param {import("../../input/input-system.class.js").InputSystem} input - The active input system.
   * @param {number} time - The current scene time in milliseconds.
   * @returns {void} No value is returned.
   */
  updateMovement(input, time) {
    if (this.isKnockedOut || this.isMutating) return;
    if (this.isMutated) {
      if (this.updateActionState(input, time)) return;
      const direction = input.getHorizontalAxis();
      this.applyMovement(input, direction);
      this.updateMovementAnimations(direction);
      return;
    }
    if (this.updateActionState(input, time)) return;
    const direction = input.getHorizontalAxis();
    this.applyMovement(input, direction);
    this.updateMovementAnimations(direction);
  }

  /**
   * Starts mutation.
   * @returns {boolean} Whether the requested condition is met.
   */
  startMutation() {
    return BulldogMutationStateSystem.start(this);
  }

  /**
   * Updates action state.
   * @param {import("../../input/input-system.class.js").InputSystem} input - The active input system.
   * @param {number} time - The current scene time in milliseconds.
   * @returns {boolean} Whether the requested condition is met.
   */
  updateActionState(input, time) {
    if (this.isHit && time < this.hitReactionEndsAt) {
      this.setVelocityX(0);
      return true;
    }
    if (this.isHit) this.finishHitReaction();
    if (input.consumeAttack()) this.startAttack();
    if (!this.isAttacking) return false;
    this.setVelocityX(0);
    return true;
  }

  /**
   * Applies movement.
   * @param {import("../../input/input-system.class.js").InputSystem} input - The active input system.
   * @param {-1|0|1} direction - The horizontal movement direction.
   * @returns {void} No value is returned.
   */
  applyMovement(input, direction) {
    const isFalling = this.body.velocity.y > 0;
    this.setVelocityX(direction * BULLDOG_GAMEPLAY.moveSpeed);
    this.setGravityY(isFalling ? BULLDOG_GAMEPLAY.fallGravityBoost : 0);
    if (direction !== 0) this.setFlipX(direction < 0);
    if (input.consumeJump() && this.isGrounded()) {
      this.setVelocityY(BULLDOG_GAMEPLAY.jumpVelocity);
    }
  }

  /**
   * Updates movement animations.
   * @param {-1|0|1} direction - The horizontal movement direction.
   * @returns {void} No value is returned.
   */
  updateMovementAnimations(direction) {
    BulldogMovementAnimationSystem.update(this, direction);
  }

  /**
   * Starts attack.
   * @returns {boolean} Whether the requested condition is met.
   */
  startAttack() {
    if (!this.canStartAttack()) return false;
    this.prepareAttack();
    this.once(this.getAttackCompleteEventName(), () => this.finishAttack());
    return true;
  }

  /**
   * Checks the start attack condition.
   * @returns {boolean} Whether the requested condition is met.
   */
  canStartAttack() {
    const isAirAttackBlocked = !this.isGrounded() && !this.isMutated;
    return !this.isAttacking && !this.isKnockedOut && !isAirAttackBlocked;
  }

  /**
   * Handles prepare attack.
   * @returns {void} No value is returned.
   */
  prepareAttack() {
    if (!this.isMutated) this.audio.prepareBiteAttack();
    this.isAttacking = true;
    this.attackHitConsumed = false;
    this.standingStartedAt = null;
    this.setVelocityX(0);
    this.anims.stop();
    this.activeAttackAnimationKey =
      BulldogMutationStateSystem.getNextAttackAnimationKey(this);
    this.play(this.activeAttackAnimationKey);
  }

  /**
   * Returns attack complete event name.
   * @returns {string} The resulting string value.
   */
  getAttackCompleteEventName() {
    return (
      Phaser.Animations.Events.ANIMATION_COMPLETE_KEY +
      (this.activeAttackAnimationKey ?? BULLDOG_ANIMATION_KEYS.biteAttack)
    );
  }

  /**
   * Consumes attack hit.
   * @param {Phaser.Physics.Arcade.Sprite} target - The target game object.
   * @param {number} hitRange - The hit range value.
   * @param {number} groundTolerance - The ground tolerance value.
   * @returns {boolean} Whether the requested condition is met.
   */
  consumeAttackHit(target, hitRange, groundTolerance) {
    if (!this.isAttackImpactReady(target)) return false;
    const distanceX = target.x - this.x;
    if (!this.isTargetInAttackRange(
      target,
      distanceX,
      hitRange,
      groundTolerance,
    ))
      return false;
    this.attackHitConsumed = true;
    return true;
  }

  /**
   * Checks the attack impact ready condition.
   * @param {Phaser.Physics.Arcade.Sprite} target - The target game object.
   * @returns {boolean} Whether the requested condition is met.
   */
  isAttackImpactReady(target) {
    const attackKey = this.anims.currentAnim?.key;
    const texture = BULLDOG_ATTACK_TEXTURES[attackKey];
    return (
      this.isAttacking &&
      !this.attackHitConsumed &&
      Boolean(target?.active && target.body?.enable) &&
      Boolean(texture) &&
      this.anims.currentFrame?.textureFrame === texture.frameCount - 1
    );
  }

  /**
   * Checks the target in attack range condition.
   * @param {Phaser.Physics.Arcade.Sprite} target - The target game object.
   * @param {number} distanceX - The distance x value.
   * @param {number} hitRange - The hit range value.
   * @param {number} groundTolerance - The ground tolerance value.
   * @returns {boolean} Whether the requested condition is met.
   */
  isTargetInAttackRange(target, distanceX, hitRange, groundTolerance) {
    const facingDirection = this.flipX ? -1 : 1;
    const feetDistance = Math.abs(this.body.bottom - target.body.bottom);
    return (
      distanceX * facingDirection >= 0 &&
      Math.abs(distanceX) <= hitRange &&
      feetDistance <= groundTolerance
    );
  }

  /**
   * Completes attack.
   * @returns {void} No value is returned.
   */
  finishAttack() {
    if (!this.isAttacking) return;

    this.isAttacking = false;
    this.attackHitConsumed = false;
    this.activeAttackAnimationKey = null;
    this.showStandFrame();
  }

  /**
   * Handles take hit.
   * @param {number} time - The current scene time in milliseconds.
   * @returns {boolean} Whether the requested condition is met.
   */
  takeHit(time) {
    if (this.isKnockedOut || this.isHit) return false;

    this.audio.stopAll();
    this.isHit = true;
    this.hitReactionEndsAt = time + BULLDOG_ANIMATION_TIMING.hitReactionMs;
    this.cancelActiveActionStates();
    this.setVelocityX(0);
    this.anims.stop();
    this.setTexture(this.getKnockOutTexture().key, 0);
    return true;
  }

  /**
   * Completes hit reaction.
   * @returns {void} No value is returned.
   */
  finishHitReaction() {
    if (!this.isHit) return;

    this.isHit = false;
    this.showStandFrame();
  }

  /**
   * Handles knock out.
   * @returns {boolean} Whether the requested condition is met.
   */
  knockOut() {
    if (this.isKnockedOut) return false;

    this.audio.stopAll();
    this.isKnockedOut = true;
    this.isHit = false;
    this.cancelActiveActionStates();
    this.setVelocity(0, 0);
    this.setGravityY(0);
    this.anims.stop();
    this.play(this.getKnockOutAnimationKey());
    this.emit(BULLDOG_EVENTS.knockedOut);
    return true;
  }

  /**
   * Handles cancel active action states.
   * @returns {void} No value is returned.
   */
  cancelActiveActionStates() {
    this.standingStartedAt = null;
    this.isLanding = false;
    this.isAttacking = false;
    this.attackHitConsumed = false;
    Object.keys(BULLDOG_ATTACK_TEXTURES).forEach((animationKey) => {
      this.off(
        Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + animationKey,
      );
    });
    this.activeAttackAnimationKey = null;
  }

  /**
   * Handles once knock out complete.
   * @param {Function} callback - The callback to invoke.
   * @returns {void} No value is returned.
   */
  onceKnockOutComplete(callback) {
    [
      BULLDOG_ANIMATION_KEYS.knockout,
      BULLDOG_ANIMATION_KEYS.mutationKnockout,
    ].forEach((animationKey) => {
      const eventName =
        Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + animationKey;
      this.once(eventName, callback);
    });
  }

  /**
   * Returns knock out animation key.
   * @returns {string} The resulting string value.
   */
  getKnockOutAnimationKey() {
    return this.isMutated
      ? BULLDOG_ANIMATION_KEYS.mutationKnockout
      : BULLDOG_ANIMATION_KEYS.knockout;
  }

  /**
   * Returns knock out texture.
   * @returns {{key: string}} The resulting string value.
   */
  getKnockOutTexture() {
    return this.isMutated
      ? BULLDOG_TEXTURES.mutationKnockout
      : BULLDOG_TEXTURES.knockout;
  }

  /**
   * Shows stand frame.
   * @returns {void} No value is returned.
   */
  showStandFrame() {
    this.stopWaitBreathing();
    if (this.isMutated) {
      this.play(BULLDOG_ANIMATION_KEYS.mutationIdle, true);
      return;
    }
    this.setTexture(BULLDOG_TEXTURES.stand.key, 0);
  }

  /**
   * Starts wait breathing.
   * @returns {void} No value is returned.
   */
  startWaitBreathing() {
    this.audio.startWaitBreathing();
  }

  /**
   * Stops wait breathing.
   * @returns {void} No value is returned.
   */
  stopWaitBreathing() {
    this.audio.stopWaitBreathing();
  }

  /**
   * Checks the grounded condition.
   * @returns {boolean} Whether the requested condition is met.
   */
  isGrounded() {
    return this.body.blocked.down || this.body.touching.down;
  }
}
