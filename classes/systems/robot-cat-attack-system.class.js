import {
  ROBOT_CAT,
  ROBOT_CAT_ATTACK,
  ROBOT_CAT_ATTACK_TEXTURE,
  ROBOT_CAT_ROCKET_ATTACK,
  ROBOT_CAT_SHOOT_TEXTURE,
  ROBOT_CAT_STATES,
  ROBOT_CAT_WALK_TEXTURE,
} from "../../js/config/robot-cat-settings.js";
import { BulldogMutationStateSystem } from
  "./bulldog-mutation-state-system.class.js";
import { RobotCatClawProjectileSystem } from
  "./robot-cat-claw-projectile-system.class.js";
import { RobotCatPhaseSystem } from
  "./robot-cat-phase-system.class.js";
import { RobotCatRocketSystem } from
  "./robot-cat-rocket-system.class.js";

const ANIMATION_COMPLETE_PREFIX = "animationcomplete-";
const MILLISECONDS_PER_SECOND = 1_000;

/**
 * Manages robot cat attack system behavior.
 */
export class RobotCatAttackSystem {
  /**
   * Creates the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - The player-controlled bulldog.
   * @param {import("./health-system.class.js").HealthSystem} health - The associated health system.
   * @param {Phaser.Physics.Arcade.StaticGroup} platforms - The level collision surfaces.
   * @returns {RobotCatAttackSystem} The created instance.
   */
  static create(scene, robotCat, player, health, platforms) {
    return new RobotCatAttackSystem(
      scene,
      robotCat,
      player,
      health,
      platforms,
    );
  }

  /**
   * Creates a new instance.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - The player-controlled bulldog.
   * @param {import("./health-system.class.js").HealthSystem} health - The associated health system.
   * @param {Phaser.Physics.Arcade.StaticGroup} platforms - The level collision surfaces.
   */
  constructor(scene, robotCat, player, health, platforms) {
    this.scene = scene;
    this.robotCat = robotCat;
    this.player = player;
    this.health = health;
    this.launchEvent = null;
    this.rocketEvents = [];
    this.currentAttackKind = null;
    this.lastAttackKind = "claw";
    this.rocketSystem = RobotCatRocketSystem.create(
      scene, robotCat, player, platforms, health,
    );
    this.clawSystem = new RobotCatClawProjectileSystem(
      scene, player, (time) => this.resolvePlayerHit(time),
    );
    this.nextAttackAt = scene.time.now + ROBOT_CAT_ATTACK.initialDelayMs;
  }

  /**
   * Updates the current state.
   * @param {number} time - The current scene time in milliseconds.
   * @param {number} delta - The elapsed time since the previous frame in milliseconds.
   * @returns {void} No value is returned.
   */
  update(time, delta) {
    this.rocketSystem.update(time, delta);
    this.prioritizePhaseAttack(time);
    this.clawSystem.update(time, delta);
    if (this.robotCat.getData("isDefeated")) {
      this.cancelAttack(true);
      return;
    }
    if (this.robotCat.getData("isHitReacting")) {
      this.cancelAttack(false);
      return;
    }
    if (this.robotCat.getData("isAttacking")) return;
    if (!this.canStartAttack(time)) return;
    this.startAttack();
  }

  /**
   * Makes a newly unlocked phase attack available after hit feedback.
   * @param {number} time - The current scene time in milliseconds.
   * @returns {void} No value is returned.
   */
  prioritizePhaseAttack(time) {
    if (!this.robotCat.getData("phaseAttackPending")) return;
    this.nextAttackAt = Math.min(this.nextAttackAt, time);
  }

  /**
   * Checks the start attack condition.
   * @param {number} time - The current scene time in milliseconds.
   * @returns {boolean} Whether the requested condition is met.
   */
  canStartAttack(time) {
    return (
      time >= this.nextAttackAt &&
      this.robotCat.active &&
      !this.player?.isKnockedOut &&
      !this.player?.isMutating &&
      this.robotCat.getData("movementState") === ROBOT_CAT_STATES.walking &&
      RobotCatAttackSystem.isTargetInRange(this.robotCat, this.player)
    );
  }

  /**
   * Checks the target in range condition.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @returns {boolean} Whether the requested condition is met.
   */
  static isTargetInRange(robotCat, player) {
    if (!robotCat?.active || !player?.active || !player.body?.enable) {
      return false;
    }
    const playerCenterY = player.body.y + player.body.height / 2;
    return (
      Math.abs(player.x - robotCat.x) <= ROBOT_CAT_ATTACK.triggerRangeX &&
      Math.abs(playerCenterY - robotCat.y) <= ROBOT_CAT_ATTACK.triggerRangeY
    );
  }

  /**
   * Starts attack.
   * @returns {void} No value is returned.
   */
  startAttack() {
    if (this.shouldUseRocketAttack()) {
      this.startRocketAttack();
      return;
    }
    this.startClawAttack();
  }

  /**
   * Checks whether the next attack should be a rocket barrage.
   * @returns {boolean} Whether a rocket barrage should start.
   */
  shouldUseRocketAttack() {
    const phase = RobotCatPhaseSystem.getSettings(this.robotCat);
    if (!phase.rocketEnabled) return false;
    return this.robotCat.getData("phaseAttackPending") ||
      this.lastAttackKind !== "rocket";
  }

  /**
   * Starts the original claw projectile attack.
   * @returns {void} No value is returned.
   */
  startClawAttack() {
    const texture = ROBOT_CAT_ATTACK_TEXTURE;
    const direction = this.player.x < this.robotCat.x ? -1 : 1;
    this.currentAttackKind = "claw";
    this.lastAttackKind = "claw";
    this.robotCat.setData("direction", direction);
    this.robotCat.setData("isAttacking", true);
    this.robotCat.setFlipX(direction > 0)
      .setDisplaySize(ROBOT_CAT.displayWidth, ROBOT_CAT.displayHeight)
      .play(texture.animationKey, true);
    this.scheduleClawLaunch(texture, direction);
    this.bindAttackCompletion();
  }

  /**
   * Starts a four-rocket homing barrage.
   * @returns {void} No value is returned.
   */
  startRocketAttack() {
    const direction = this.player.x < this.robotCat.x ? -1 : 1;
    this.currentAttackKind = "rocket";
    this.lastAttackKind = "rocket";
    this.robotCat.setData("direction", direction);
    this.robotCat.setData("isAttacking", true);
    this.robotCat.setData("phaseAttackPending", false);
    this.robotCat.setFlipX(direction > 0)
      .setDisplaySize(ROBOT_CAT.displayWidth, ROBOT_CAT.displayHeight)
      .play(ROBOT_CAT_SHOOT_TEXTURE.animationKey, true);
    this.scheduleRocketBarrage(direction);
  }

  /**
   * Schedules all four rockets and the attack recovery.
   * @param {-1|1} direction - The horizontal firing direction.
   * @returns {void} No value is returned.
   */
  scheduleRocketBarrage(direction) {
    const settings = ROBOT_CAT_ROCKET_ATTACK;
    this.clearRocketEvents();
    for (let index = 0; index < settings.shotCount; index += 1) {
      const delay = settings.firstShotDelayMs + index * settings.shotIntervalMs;
      this.rocketEvents.push(this.scene.time.delayedCall(
        delay,
        () => this.launchScheduledRocket(direction),
      ));
    }
    this.scheduleRocketRecovery(settings);
  }

  /**
   * Schedules the recovery after the final rocket launch.
   * @param {object} settings - The rocket barrage settings.
   * @returns {void} No value is returned.
   */
  scheduleRocketRecovery(settings) {
    const lastShotDelay = settings.firstShotDelayMs +
      (settings.shotCount - 1) * settings.shotIntervalMs;
    this.rocketEvents.push(this.scene.time.delayedCall(
      lastShotDelay + settings.recoveryMs,
      () => this.finishAttack(),
    ));
  }

  /**
   * Launches a scheduled rocket while the barrage remains active.
   * @param {-1|1} direction - The horizontal firing direction.
   * @returns {void} No value is returned.
   */
  launchScheduledRocket(direction) {
    if (!this.robotCat.getData("isAttacking")) return;
    if (this.currentAttackKind !== "rocket") return;
    this.rocketSystem.fire(direction);
  }

  /**
   * Clears every pending rocket launch and recovery event.
   * @returns {void} No value is returned.
   */
  clearRocketEvents() {
    this.rocketEvents.forEach((event) => event.remove(false));
    this.rocketEvents = [];
  }

  /**
   * Handles schedule claw launch.
   * @param {object} texture - The texture configuration to use.
   * @param {-1|1} direction - The horizontal movement direction.
   * @returns {void} No value is returned.
   */
  scheduleClawLaunch(texture, direction) {
    const delay = texture.launchFrame / texture.frameRate *
      MILLISECONDS_PER_SECOND;
    this.launchEvent = this.scene.time.delayedCall(
      delay,
      () => {
        this.launchEvent = null;
        if (!this.robotCat.getData("isAttacking")) return;
        this.launchClaws(direction);
      },
    );
  }

  /**
   * Binds attack completion.
   * @returns {void} No value is returned.
   */
  bindAttackCompletion() {
    this.robotCat.once(
      this.getAttackCompleteEventName(),
      () => this.finishAttack(),
    );
  }

  /**
   * Handles launch claws.
   * @param {-1|1} direction - The horizontal movement direction.
   * @returns {void} No value is returned.
   */
  launchClaws(direction) {
    this.clawSystem.launch(this.robotCat, direction);
  }

  /**
   * Returns aim vector.
   * @param {number} startX - The start x value.
   * @param {number} startY - The start y value.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @param {-1|1} fallbackDirection - The fallback direction value.
   * @returns {{x: number, y: number}} The resulting numeric value.
   */
  static getAimVector(startX, startY, player, fallbackDirection) {
    return RobotCatClawProjectileSystem.getAimVector(
      startX,
      startY,
      player,
      fallbackDirection,
    );
  }

  /**
   * Resolves player hit.
   * @param {number} time - The current scene time in milliseconds.
   * @returns {void} No value is returned.
   */
  resolvePlayerHit(time) {
    if (
      this.player.isHit ||
      this.player.isKnockedOut ||
      !BulldogMutationStateSystem.canReceiveNormalDamage(this.player)
    ) return;
    const phase = RobotCatPhaseSystem.getSettings(this.robotCat);
    const remainingHealth = this.health.takeDamage(phase.attackDamage);
    if (remainingHealth === 0) {
      this.player.knockOut();
      return;
    }
    this.player.takeHit(time);
  }

  /**
   * Completes attack.
   * @returns {void} No value is returned.
   */
  finishAttack() {
    this.clearAttackEvents();
    this.robotCat.setData("isAttacking", false);
    this.currentAttackKind = null;
    this.nextAttackAt = this.scene.time.now + this.getAttackCooldown();
    if (
      this.robotCat.getData("isDefeated") ||
      this.robotCat.getData("isHitReacting")
    ) return;
    this.robotCat.play(ROBOT_CAT_WALK_TEXTURE.animationKey, true)
      .setDisplaySize(ROBOT_CAT.displayWidth, ROBOT_CAT.displayHeight);
  }

  /**
   * Handles cancel attack.
   * @param {boolean} removeProjectiles - The remove projectiles value.
   * @returns {void} No value is returned.
   */
  cancelAttack(removeProjectiles) {
    if (this.robotCat.getData("isAttacking")) {
      this.robotCat.setData("isAttacking", false);
      this.robotCat.off(this.getAttackCompleteEventName());
      this.clearAttackEvents();
      this.currentAttackKind = null;
      this.nextAttackAt = this.scene.time.now + this.getAttackCooldown();
    }
    if (removeProjectiles) {
      this.clawSystem.clear();
      this.rocketSystem.clear();
    }
  }

  /**
   * Clears pending launch events for either attack type.
   * @returns {void} No value is returned.
   */
  clearAttackEvents() {
    this.launchEvent?.remove(false);
    this.launchEvent = null;
    this.clearRocketEvents();
  }

  /**
   * Returns the cooldown of the active combat phase.
   * @returns {number} The cooldown in milliseconds.
   */
  getAttackCooldown() {
    return RobotCatPhaseSystem.getSettings(this.robotCat).attackCooldownMs;
  }

  /**
   * Returns attack complete event name.
   * @returns {string} The resulting string value.
   */
  getAttackCompleteEventName() {
    return ANIMATION_COMPLETE_PREFIX + ROBOT_CAT_ATTACK_TEXTURE.animationKey;
  }
}
