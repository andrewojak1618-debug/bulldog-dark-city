import { Enemy } from "./enemy.class.js";
import {
  DOG_CATCHER,
  DOG_CATCHER_ANIMATION_KEYS,
  DOG_CATCHER_EVENTS,
  DOG_CATCHER_TEXTURES,
} from "../../../js/config/dog-catcher-settings.js";
import { DogCatcherAudioSystem } from
  "../../systems/dog-catcher-audio-system.class.js";

const DOG_CATCHER_STATES = Object.freeze({
  patrol: "patrol",
  alert: "alert",
  chase: "chase",
  attack: "attack",
  hit: "hit",
  dead: "dead",
});

/**
 * Manages dog catcher behavior.
 */
export class DogCatcher extends Enemy {
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
    this.configureBody();
    this.initializeState();
    this.play(DOG_CATCHER_ANIMATION_KEYS.walk);
  }

  /**
   * Configures the dog catcher's visual and physics body.
   * @returns {void} No value is returned.
   */
  configureBody() {
    this.setDisplaySize(
      DOG_CATCHER.displayWidth,
      DOG_CATCHER.displayHeight,
    );
    this.body
      .setSize(DOG_CATCHER.bodyWidth, DOG_CATCHER.bodyHeight)
      .setOffset(DOG_CATCHER.bodyOffsetX, DOG_CATCHER.bodyOffsetY);
    this.setCollideWorldBounds(true);
  }

  /**
   * Initializes the dog catcher's runtime state.
   * @returns {void} No value is returned.
   */
  initializeState() {
    this.state = DOG_CATCHER_STATES.patrol;
    this.patrolDirection = 1;
    this.hasDetectedPlayer = false;
    this.nextAttackAt = 0;
    this.attackHitConsumed = false;
    this.receivedBiteHits = 0;
    this.hitReactionEndsAt = 0;
    this.isDead = false;
  }

  /**
   * Updates behavior.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @param {number} time - The current scene time in milliseconds.
   * @returns {void} No value is returned.
   */
  updateBehavior(player, time) {
    if (!player?.active || !this.body || this.isDead) return;
    if (!this.recoverFromHit(time)) return;
    if (player.isKnockedOut) {
      this.showReadyPose();
      return;
    }

    if (this.isLockedInAnimation()) return;

    const distanceX = player.x - this.x;
    const isDetected = this.isPlayerDetected(player, distanceX);

    if (!isDetected) {
      this.hasDetectedPlayer = false;
      this.updatePatrol();
      return;
    }
    this.updateDetectedBehavior(distanceX, time);
  }

  /**
   * Handles recover from hit.
   * @param {number} time - The current scene time in milliseconds.
   * @returns {boolean} Whether the requested condition is met.
   */
  recoverFromHit(time) {
    if (this.state !== DOG_CATCHER_STATES.hit) return true;
    if (time < this.hitReactionEndsAt) return false;
    this.state = DOG_CATCHER_STATES.chase;
    this.nextAttackAt = Math.min(this.nextAttackAt, time);
    return true;
  }

  /**
   * Updates detected behavior.
   * @param {number} distanceX - The distance x value.
   * @param {number} time - The current scene time in milliseconds.
   * @returns {void} No value is returned.
   */
  updateDetectedBehavior(distanceX, time) {
    this.faceDirection(Math.sign(distanceX) || this.patrolDirection);
    if (!this.hasDetectedPlayer) {
      this.startAlert();
      return;
    }
    const isWithinAttackRange =
      Math.abs(distanceX) <= DOG_CATCHER.attackRange;
    if (isWithinAttackRange) {
      if (time >= this.nextAttackAt) this.startAttack(time);
      else this.showReadyPose();
      return;
    }

    this.updateChase(distanceX);
  }

  /**
   * Checks the player detected condition.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @param {number} distanceX - The distance x value.
   * @returns {boolean} Whether the requested condition is met.
   */
  isPlayerDetected(player, distanceX) {
    if (!this.isPlayerOnSameGroundLevel(player)) return false;

    const isInFront = distanceX * this.getFacingDirection() >= 0;
    const detectionRange = isInFront
      ? DOG_CATCHER.detectionRange
      : DOG_CATCHER.rearDetectionRange;

    return Math.abs(distanceX) <= detectionRange;
  }

  /**
   * Checks the player on same ground level condition.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @returns {boolean} Whether the requested condition is met.
   */
  isPlayerOnSameGroundLevel(player) {
    const playerFeetY = player.body?.bottom;
    const dogCatcherFeetY = this.body?.bottom;

    if (!Number.isFinite(playerFeetY) || !Number.isFinite(dogCatcherFeetY)) {
      return false;
    }

    return (
      Math.abs(playerFeetY - dogCatcherFeetY) <=
      DOG_CATCHER.groundLevelTolerance
    );
  }

  /**
   * Returns facing direction.
   * @returns {-1|1} The resulting value.
   */
  getFacingDirection() {
    return this.flipX ? -1 : 1;
  }

  /**
   * Updates patrol.
   * @returns {void} No value is returned.
   */
  updatePatrol() {
    this.state = DOG_CATCHER_STATES.patrol;

    if (this.x <= DOG_CATCHER.patrolMinX) this.patrolDirection = 1;
    if (this.x >= DOG_CATCHER.patrolMaxX) this.patrolDirection = -1;

    this.move(this.patrolDirection, DOG_CATCHER.patrolSpeed);
  }

  /**
   * Starts alert.
   * @returns {void} No value is returned.
   */
  startAlert() {
    this.state = DOG_CATCHER_STATES.alert;
    this.hasDetectedPlayer = true;
    this.setVelocityX(0);
    DogCatcherAudioSystem.playAlert(this.scene);
    this.play(DOG_CATCHER_ANIMATION_KEYS.alert);
  }

  /**
   * Updates chase.
   * @param {number} distanceX - The distance x value.
   * @returns {void} No value is returned.
   */
  updateChase(distanceX) {
    this.state = DOG_CATCHER_STATES.chase;
    this.move(Math.sign(distanceX), DOG_CATCHER.chaseSpeed);
  }

  /**
   * Starts attack.
   * @param {number} time - The current scene time in milliseconds.
   * @returns {void} No value is returned.
   */
  startAttack(time) {
    this.state = DOG_CATCHER_STATES.attack;
    this.nextAttackAt = time + DOG_CATCHER.attackCooldownMs;
    this.attackHitConsumed = false;
    this.setVelocityX(0);
    this.play(DOG_CATCHER_ANIMATION_KEYS.attack);
  }

  /**
   * Consumes attack hit.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @returns {boolean} Whether the requested condition is met.
   */
  consumeAttackHit(player) {
    if (!this.canApplyAttackHit()) return false;
    this.attackHitConsumed = true;
    const distanceX = player.x - this.x;
    return distanceX * this.getFacingDirection() >= 0 &&
      this.isPlayerOnSameGroundLevel(player) &&
      Math.abs(distanceX) <= DOG_CATCHER.attackHitRange;
  }

  /**
   * Checks whether the current attack frame may apply damage.
   * @returns {boolean} Whether an attack hit can be applied.
   */
  canApplyAttackHit() {
    const isActiveAttack = this.state === DOG_CATCHER_STATES.attack &&
      !this.attackHitConsumed &&
      this.anims.currentAnim?.key === DOG_CATCHER_ANIMATION_KEYS.attack;
    const lastFrame = DOG_CATCHER_TEXTURES.attack.frameCount - 1;
    return isActiveAttack &&
      this.anims.currentFrame?.textureFrame === lastFrame;
  }

  /**
   * Handles take bite hit.
   * @param {number} time - The current scene time in milliseconds.
   * @returns {boolean} Whether the requested condition is met.
   */
  takeBiteHit(time) {
    if (this.isDead || this.state === DOG_CATCHER_STATES.hit) return false;

    this.receivedBiteHits += 1;
    this.setVelocityX(0);
    this.anims.stop();

    if (this.receivedBiteHits >= DOG_CATCHER.biteHitsToDefeat) {
      this.startDeath();
      return true;
    }

    this.state = DOG_CATCHER_STATES.hit;
    this.hitReactionEndsAt = time + DOG_CATCHER.hitReactionMs;
    this.setTexture(DOG_CATCHER_TEXTURES.dead.key, 0);
    return false;
  }

  /**
   * Starts death.
   * @returns {void} No value is returned.
   */
  startDeath() {
    this.state = DOG_CATCHER_STATES.dead;
    this.isDead = true;
    this.attackHitConsumed = true;
    this.setVelocity(0, 0);
    this.play(DOG_CATCHER_ANIMATION_KEYS.dead);
    this.once(
      `animationcomplete-${DOG_CATCHER_ANIMATION_KEYS.dead}`,
      () => this.emit(DOG_CATCHER_EVENTS.defeated),
    );
    this.body.enable = false;
  }

  /**
   * Checks the locked in animation condition.
   * @returns {boolean} Whether the requested condition is met.
   */
  isLockedInAnimation() {
    const isLockedState =
      this.state === DOG_CATCHER_STATES.alert ||
      this.state === DOG_CATCHER_STATES.attack ||
      this.state === DOG_CATCHER_STATES.hit ||
      this.state === DOG_CATCHER_STATES.dead;

    return isLockedState && this.anims.isPlaying;
  }

  /**
   * Shows ready pose.
   * @returns {void} No value is returned.
   */
  showReadyPose() {
    this.state = DOG_CATCHER_STATES.chase;
    this.setVelocityX(0);
    this.anims.stop();
    this.setTexture(DOG_CATCHER_TEXTURES.walk.key, 0);
  }

  /**
   * Moves the current state.
   * @param {number} direction - The horizontal movement direction.
   * @param {number} speed - The speed value.
   * @returns {void} No value is returned.
   */
  move(direction, speed) {
    const normalizedDirection = direction < 0 ? -1 : 1;
    this.faceDirection(normalizedDirection);
    this.setVelocityX(normalizedDirection * speed);
    this.play(DOG_CATCHER_ANIMATION_KEYS.walk, true);
  }

  /**
   * Handles face direction.
   * @param {number} direction - The horizontal movement direction.
   * @returns {void} No value is returned.
   */
  faceDirection(direction) {
    this.setFlipX(direction < 0);
  }
}
