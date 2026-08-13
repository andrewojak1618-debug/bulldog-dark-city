import {
  ROBOT_CAT,
  ROBOT_CAT_ATTACK,
  ROBOT_CAT_ATTACK_TEXTURE,
  ROBOT_CAT_CLAWS_TEXTURE,
  ROBOT_CAT_STATES,
  ROBOT_CAT_WALK_TEXTURE,
} from "../../js/config/robot-cat-settings.js";
import { BulldogMutationStateSystem } from
  "./bulldog-mutation-state-system.class.js";
import { RobotCatAudioSystem } from
  "./robot-cat-audio-system.class.js";

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
   * @returns {RobotCatAttackSystem} The created instance.
   */
  static create(scene, robotCat, player, health) {
    return new RobotCatAttackSystem(scene, robotCat, player, health);
  }

  /**
   * Creates a new instance.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - The player-controlled bulldog.
   * @param {import("./health-system.class.js").HealthSystem} health - The associated health system.
   */
  constructor(scene, robotCat, player, health) {
    this.scene = scene;
    this.robotCat = robotCat;
    this.player = player;
    this.health = health;
    this.projectiles = new Set();
    this.launchEvent = null;
    this.nextAttackAt = scene.time.now + ROBOT_CAT_ATTACK.initialDelayMs;
  }

  /**
   * Updates the current state.
   * @param {number} time - The current scene time in milliseconds.
   * @param {number} delta - The elapsed time since the previous frame in milliseconds.
   * @returns {void} No value is returned.
   */
  update(time, delta) {
    this.updateProjectiles(time, delta);
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
    const texture = ROBOT_CAT_ATTACK_TEXTURE;
    const direction = this.player.x < this.robotCat.x ? -1 : 1;
    this.robotCat.setData("direction", direction);
    this.robotCat.setData("isAttacking", true);
    this.robotCat.setFlipX(direction > 0)
      .setDisplaySize(ROBOT_CAT.displayWidth, ROBOT_CAT.displayHeight)
      .play(texture.animationKey, true);
    this.scheduleClawLaunch(texture, direction);
    this.bindAttackCompletion();
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
    const settings = ROBOT_CAT_ATTACK;
    const startX = this.robotCat.x + direction * settings.launchOffsetX;
    const startY = this.robotCat.y - settings.launchOffsetY;
    const aim = RobotCatAttackSystem.getAimVector(
      startX,
      startY,
      this.player,
      direction,
    );
    const sprite = this.createClawSprite(startX, startY, direction);
    RobotCatAudioSystem.playClawAttack(this.scene);
    this.addProjectile(sprite, aim);
  }

  /**
   * Creates claw sprite.
   * @param {number} startX - The start x value.
   * @param {number} startY - The start y value.
   * @param {-1|1} direction - The horizontal movement direction.
   * @returns {Phaser.GameObjects.Sprite} The resulting data object.
   */
  createClawSprite(startX, startY, direction) {
    const settings = ROBOT_CAT_ATTACK;
    return this.scene.add.sprite(
      startX,
      startY,
      ROBOT_CAT_CLAWS_TEXTURE.key,
      0,
    ).setDisplaySize(
      settings.projectileDisplaySize,
      settings.projectileDisplaySize,
    ).setDepth(settings.depth)
      .setFlipX(direction > 0)
      .play(ROBOT_CAT_CLAWS_TEXTURE.animationKey);
  }

  /**
   * Adds projectile.
   * @param {Phaser.GameObjects.Sprite} sprite - The sprite value.
   * @param {{x: number, y: number}} aim - The aim value.
   * @returns {void} No value is returned.
   */
  addProjectile(sprite, aim) {
    const speed = ROBOT_CAT_ATTACK.projectileSpeed;
    this.projectiles.add({
      sprite,
      velocityX: aim.x * speed,
      velocityY: aim.y * speed,
      distance: 0,
    });
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
    const targetX = player?.body?.center?.x ?? player?.x ?? startX;
    const targetY = player?.body?.center?.y ?? player?.y ?? startY;
    const distanceX = targetX - startX;
    const distanceY = targetY - startY;
    const length = Math.hypot(distanceX, distanceY);
    if (length === 0) return { x: fallbackDirection, y: 0 };
    return { x: distanceX / length, y: distanceY / length };
  }

  /**
   * Updates projectiles.
   * @param {number} time - The current scene time in milliseconds.
   * @param {number} delta - The elapsed time since the previous frame in milliseconds.
   * @returns {void} No value is returned.
   */
  updateProjectiles(time, delta) {
    [...this.projectiles].forEach((projectile) => {
      this.updateProjectile(projectile, time, delta);
    });
  }

  /**
   * Updates projectile.
   * @param {object} projectile - The projectile value.
   * @param {number} time - The current scene time in milliseconds.
   * @param {number} delta - The elapsed time since the previous frame in milliseconds.
   * @returns {void} No value is returned.
   */
  updateProjectile(projectile, time, delta) {
    this.moveProjectile(projectile, delta);
    if (this.hitsPlayer(projectile.sprite)) {
      this.resolvePlayerHit(time);
      this.dissolveProjectile(projectile);
      return;
    }
    if (projectile.distance >= ROBOT_CAT_ATTACK.projectileDistance) {
      this.dissolveProjectile(projectile);
    }
  }

  /**
   * Moves projectile.
   * @param {object} projectile - The projectile value.
   * @param {number} delta - The elapsed time since the previous frame in milliseconds.
   * @returns {void} No value is returned.
   */
  moveProjectile(projectile, delta) {
    const factor = delta / MILLISECONDS_PER_SECOND;
    const movementX = projectile.velocityX * factor;
    const movementY = projectile.velocityY * factor;
    projectile.sprite.x += movementX;
    projectile.sprite.y += movementY;
    projectile.distance += Math.hypot(movementX, movementY);
  }

  /**
   * Handles hits player.
   * @param {Phaser.GameObjects.Sprite} sprite - The sprite value.
   * @returns {boolean} Whether the requested condition is met.
   */
  hitsPlayer(sprite) {
    const body = this.player?.body;
    if (!body?.enable || this.player.isKnockedOut) return false;
    const radius = ROBOT_CAT_ATTACK.projectileDisplaySize / 2 -
      ROBOT_CAT_ATTACK.projectileHitboxInset;
    return !(
      sprite.x + radius < body.x ||
      sprite.x - radius > body.x + body.width ||
      sprite.y + radius < body.y ||
      sprite.y - radius > body.y + body.height
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
    const remainingHealth = this.health.takeDamage(ROBOT_CAT_ATTACK.damage);
    if (remainingHealth === 0) {
      this.player.knockOut();
      return;
    }
    this.player.takeHit(time);
  }

  /**
   * Handles dissolve projectile.
   * @param {{sprite: Phaser.GameObjects.Sprite}} projectile - The projectile value.
   * @returns {void} No value is returned.
   */
  dissolveProjectile(projectile) {
    if (!this.projectiles.delete(projectile)) return;
    projectile.sprite.anims.stop();
    this.scene.tweens.add({
      targets: projectile.sprite,
      alpha: 0,
      scaleX: projectile.sprite.scaleX * ROBOT_CAT_ATTACK.dissolveScale,
      scaleY: projectile.sprite.scaleY * ROBOT_CAT_ATTACK.dissolveScale,
      duration: ROBOT_CAT_ATTACK.dissolveDurationMs,
      onComplete: () => projectile.sprite.destroy(),
    });
  }

  /**
   * Completes attack.
   * @returns {void} No value is returned.
   */
  finishAttack() {
    this.launchEvent?.remove(false);
    this.launchEvent = null;
    this.robotCat.setData("isAttacking", false);
    this.nextAttackAt = this.scene.time.now + ROBOT_CAT_ATTACK.cooldownMs;
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
      this.launchEvent?.remove(false);
      this.launchEvent = null;
      this.nextAttackAt = this.scene.time.now + ROBOT_CAT_ATTACK.cooldownMs;
    }
    if (removeProjectiles) {
      [...this.projectiles].forEach((projectile) => {
        this.dissolveProjectile(projectile);
      });
    }
  }

  /**
   * Returns attack complete event name.
   * @returns {string} The resulting string value.
   */
  getAttackCompleteEventName() {
    return ANIMATION_COMPLETE_PREFIX + ROBOT_CAT_ATTACK_TEXTURE.animationKey;
  }
}
