import Phaser from "phaser";
import { Enemy } from "./enemy.class.js";
import {
  MUTANT_CAT,
  MUTANT_CAT_ANIMATION_KEY,
  MUTANT_CAT_ATTENTIVE_ANIMATION_KEY,
  MUTANT_CAT_ATTENTIVE_TEXTURE,
  MUTANT_CAT_ATTACK_ANIMATION_KEY,
  MUTANT_CAT_DEAD_ANIMATION_KEY,
  MUTANT_CAT_DEAD_TEXTURE,
  MUTANT_CAT_EVENTS,
  MUTANT_CAT_STATES,
} from "../../../js/config/mutant-cat-settings.js";
import { MutantCatAudioSystem } from "../../systems/mutant-cat-audio-system.class.js";
import { MutantCatDetectionSystem } from "../../systems/mutant-cat-detection-system.class.js";
import { MutantCatGroundingSystem } from "../../systems/mutant-cat-grounding-system.class.js";

/**
 * Manages mutant cat behavior.
 */
export class MutantCat extends Enemy {
  /**
   * Creates a new instance.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {number} x - The horizontal position.
   * @param {number} y - The vertical position.
   * @param {string} texture - The texture configuration to use.
   * @param {{minX: number, maxX: number, initialDirection: -1|1}} patrol - The patrol value.
   */
  constructor(scene, x, y, texture, patrol) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.configurePhysics();
    this.initializeState(patrol);
    this.play(MUTANT_CAT_ANIMATION_KEY);
  }

  /**
   * Configures physics.
   * @returns {void} No value is returned.
   */
  configurePhysics() {
    this.setDisplaySize(MUTANT_CAT.displayWidth, MUTANT_CAT.displayHeight);
    this.body
      .setSize(MUTANT_CAT.bodyWidth, MUTANT_CAT.bodyHeight)
      .setOffset(MUTANT_CAT.bodyOffsetX, MUTANT_CAT.bodyOffsetY);
    this.setCollideWorldBounds(true);
  }

  /**
   * Initializes state.
   * @param {{minX: number, maxX: number, initialDirection: -1|1}} patrol - The patrol value.
   * @returns {void} No value is returned.
   */
  initializeState(patrol) {
    this.patrolMinX = patrol.minX;
    this.patrolMaxX = patrol.maxX;
    this.patrolDirection = patrol.initialDirection;
    this.state = MUTANT_CAT_STATES.patrol;
    this.nextAttackAt = 0;
    this.attackHitConsumed = false;
    this.isAttackGeometryApplied = false;
    this.receivedBiteHits = 0;
    this.firstBiteHitAt = null;
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
    if (this.isDead) return;
    if (!this.canContinueBehavior(time)) return;
    if (MutantCatDetectionSystem.shouldDisengage(this, player)) {
      this.resumePatrol();
      this.updatePatrol();
      return;
    }
    this.updateEngagedBehavior(player, time);
  }

  /**
   * Checks the continue behavior condition.
   * @param {number} time - The current scene time in milliseconds.
   * @returns {boolean} Whether the requested condition is met.
   */
  canContinueBehavior(time) {
    if (this.state === MUTANT_CAT_STATES.attack) return false;
    if (this.state !== MUTANT_CAT_STATES.hit) return true;
    if (time < this.hitReactionEndsAt) return false;
    this.state = MUTANT_CAT_STATES.chase;
    return true;
  }

  /**
   * Updates engaged behavior.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @param {number} time - The current scene time in milliseconds.
   * @returns {void} No value is returned.
   */
  updateEngagedBehavior(player, time) {
    if (this.state === MUTANT_CAT_STATES.patrol) {
      return this.showAttentiveReaction(player);
    }
    this.facePlayer(player);
    if (this.state === MUTANT_CAT_STATES.attentive) return;
    if (time < this.nextAttackAt) return this.showAttackCooldownFrame();
    if (this.canAttackPlayer(player)) return this.startAttack();
    this.chasePlayer(player);
  }

  /**
   * Checks the attack player condition.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @returns {boolean} Whether the requested condition is met.
   */
  canAttackPlayer(player) {
    return MutantCatDetectionSystem.getHorizontalDistance(this, player) <=
      MUTANT_CAT.attackRange;
  }

  /**
   * Shows attentive reaction.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @returns {void} No value is returned.
   */
  showAttentiveReaction(player) {
    this.setVelocityX(0);
    this.facePlayer(player);
    this.state = MUTANT_CAT_STATES.attentive;
    MutantCatAudioSystem.playAttentive(this.scene);
    this.play(MUTANT_CAT_ATTENTIVE_ANIMATION_KEY);
    this.once(
      this.getAnimationCompleteEvent(MUTANT_CAT_ATTENTIVE_ANIMATION_KEY),
      () => {
        if (this.state === MUTANT_CAT_STATES.attentive) {
          this.state = MUTANT_CAT_STATES.chase;
        }
      },
    );
  }

  /**
   * Handles resume patrol.
   * @returns {void} No value is returned.
   */
  resumePatrol() {
    if (this.state === MUTANT_CAT_STATES.patrol) return;
    this.state = MUTANT_CAT_STATES.patrol;
    this.play(MUTANT_CAT_ANIMATION_KEY);
  }

  /**
   * Handles chase player.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @returns {void} No value is returned.
   */
  chasePlayer(player) {
    const direction = Math.sign(player.x - this.x);
    this.state = MUTANT_CAT_STATES.chase;
    this.play(MUTANT_CAT_ANIMATION_KEY, true);
    this.setVelocityX(direction * MUTANT_CAT.chaseSpeed);
  }

  /**
   * Starts attack.
   * @returns {void} No value is returned.
   */
  startAttack() {
    this.state = MUTANT_CAT_STATES.attack;
    this.attackHitConsumed = false;
    this.setVelocityX(0);
    this.applyAttackGeometry();
    this.play(MUTANT_CAT_ATTACK_ANIMATION_KEY);
    this.once(
      this.getAnimationCompleteEvent(MUTANT_CAT_ATTACK_ANIMATION_KEY),
      () => this.finishAttack(),
    );
  }

  /**
   * Completes attack.
   * @returns {void} No value is returned.
   */
  finishAttack() {
    this.restoreDefaultGeometry();
    this.state = MUTANT_CAT_STATES.chase;
    this.nextAttackAt = this.scene.time.now + MUTANT_CAT.attackCooldownMs;
    this.showAttackCooldownFrame();
  }

  /**
   * Shows attack cooldown frame.
   * @returns {void} No value is returned.
   */
  showAttackCooldownFrame() {
    this.setVelocityX(0);
    const isCooldownFrameVisible =
      this.texture.key === MUTANT_CAT_ATTENTIVE_TEXTURE.key &&
      Number(this.frame.name) === MUTANT_CAT_ATTENTIVE_TEXTURE.frameCount - 1;
    if (isCooldownFrameVisible) return;
    this.anims.stop();
    this.setTexture(MUTANT_CAT_ATTENTIVE_TEXTURE.key, 3);
  }

  /**
   * Applies attack geometry.
   * @returns {void} No value is returned.
   */
  applyAttackGeometry() {
    if (this.isAttackGeometryApplied) return;
    MutantCatGroundingSystem.applyGeometryKeepingBodyBottom(
      this,
      MUTANT_CAT.displayWidth,
      MUTANT_CAT.displayHeight,
      MUTANT_CAT.attackBodyOffsetY,
    );
    this.isAttackGeometryApplied = true;
  }

  /**
   * Restores default geometry.
   * @returns {void} No value is returned.
   */
  restoreDefaultGeometry() {
    if (!this.isAttackGeometryApplied) return;
    MutantCatGroundingSystem.applyGeometryKeepingBodyBottom(
      this,
      MUTANT_CAT.displayWidth,
      MUTANT_CAT.displayHeight,
      MUTANT_CAT.bodyOffsetY,
    );
    this.isAttackGeometryApplied = false;
  }

  /**
   * Handles settle after knock out.
   * @returns {void} No value is returned.
   */
  settleAfterKnockOut() {
    const wasAttacking = this.state === MUTANT_CAT_STATES.attack;

    this.anims.stop();
    if (wasAttacking) this.restoreDefaultGeometry();
    this.state = MUTANT_CAT_STATES.attentive;
    this.setVelocity(0, 0);
    this.setTexture(MUTANT_CAT_ATTENTIVE_TEXTURE.key, 3);
  }

  /**
   * Handles take bite hit.
   * @param {number} time - The current scene time in milliseconds.
   * @returns {boolean} Whether the requested condition is met.
   */
  takeBiteHit(time) {
    if (this.isDead || this.state === MUTANT_CAT_STATES.hit) return false;
    this.prepareBiteHit(time);
    if (this.receivedBiteHits >= MUTANT_CAT.biteHitsToDefeat) {
      this.startDeath(time);
      return true;
    }
    this.showBiteHitReaction(time);
    return false;
  }

  /**
   * Handles prepare bite hit.
   * @param {number} time - The current scene time in milliseconds.
   * @returns {void} No value is returned.
   */
  prepareBiteHit(time) {
    const wasAttacking = this.state === MUTANT_CAT_STATES.attack;
    if (this.firstBiteHitAt === null) this.firstBiteHitAt = time;
    this.receivedBiteHits += 1;
    this.setVelocityX(0);
    this.off(this.getAnimationCompleteEvent(MUTANT_CAT_ATTACK_ANIMATION_KEY));
    this.anims.stop();
    if (wasAttacking) this.restoreDefaultGeometry();
  }

  /**
   * Shows bite hit reaction.
   * @param {number} time - The current scene time in milliseconds.
   * @returns {void} No value is returned.
   */
  showBiteHitReaction(time) {
    this.state = MUTANT_CAT_STATES.hit;
    this.hitReactionEndsAt = time + MUTANT_CAT.hitReactionMs;
    this.setTexture(MUTANT_CAT_DEAD_TEXTURE.key, 0);
  }

  /**
   * Starts death.
   * @param {number} time - The current scene time in milliseconds.
   * @returns {void} No value is returned.
   */
  startDeath(time) {
    this.state = MUTANT_CAT_STATES.dead;
    this.isDead = true;
    this.attackHitConsumed = true;
    this.setVelocity(0, 0);
    this.play(MUTANT_CAT_DEAD_ANIMATION_KEY);
    const elapsedMs = Math.max(0, time - this.firstBiteHitAt);
    this.once(
      this.getAnimationCompleteEvent(MUTANT_CAT_DEAD_ANIMATION_KEY),
      () => this.emitDefeatResult(elapsedMs),
    );
    this.body.enable = false;
  }

  /**
   * Handles emit defeat result.
   * @param {number} elapsedMs - The elapsed ms value.
   * @returns {void} No value is returned.
   */
  emitDefeatResult(elapsedMs) {
    this.emit(MUTANT_CAT_EVENTS.defeated, {
      x: this.x,
      y: this.y,
      elapsedMs,
    });
  }

  /**
   * Consumes attack hit.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @returns {boolean} Whether the requested condition is met.
   */
  consumeAttackHit(player) {
    if (!this.canConsumeAttackHit(player)) return false;
    this.attackHitConsumed = true;
    return true;
  }

  /**
   * Checks the consume attack hit condition.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @returns {boolean} Whether the requested condition is met.
   */
  canConsumeAttackHit(player) {
    if (this.state !== MUTANT_CAT_STATES.attack) return false;
    if (this.attackHitConsumed) return false;
    if (Number(this.frame.name) !== MUTANT_CAT.attackImpactFrame) return false;
    if (!MutantCatDetectionSystem.isWithinHeight(this, player)) return false;
    return MutantCatDetectionSystem.getHorizontalDistance(this, player) <=
      MUTANT_CAT.attackHitRange;
  }

  /**
   * Handles face player.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @returns {void} No value is returned.
   */
  facePlayer(player) {
    this.setFlipX(player.x < this.x);
  }

  /**
   * Returns animation complete event.
   * @param {string} animationKey - The animation key value.
   * @returns {string} The resulting string value.
   */
  getAnimationCompleteEvent(animationKey) {
    return Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + animationKey;
  }

  /**
   * Updates patrol.
   * @returns {void} No value is returned.
   */
  updatePatrol() {
    if (this.x <= this.patrolMinX) this.patrolDirection = 1;
    if (this.x >= this.patrolMaxX) this.patrolDirection = -1;
    this.setVelocityX(this.patrolDirection * MUTANT_CAT.patrolSpeed);
    this.setFlipX(this.patrolDirection < 0);
  }
}
