import {
  ROBOT_CAT_ATTACK,
  ROBOT_CAT_CLAWS_TEXTURE,
} from "../../js/config/robot-cat-settings.js";
import { RobotCatAudioSystem } from
  "./robot-cat-audio-system.class.js";

const MILLISECONDS_PER_SECOND = 1_000;

/**
 * Manages the robot cat's animated claw projectiles.
 */
export class RobotCatClawProjectileSystem {
  /**
   * Creates a new instance.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @param {(time: number) => void} onPlayerHit - The player hit callback.
   */
  constructor(scene, player, onPlayerHit) {
    this.scene = scene;
    this.player = player;
    this.onPlayerHit = onPlayerHit;
    this.projectiles = new Set();
  }

  /**
   * Launches one claw projectile toward the player.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @param {-1|1} direction - The horizontal firing direction.
   * @returns {void} No value is returned.
   */
  launch(robotCat, direction) {
    const settings = ROBOT_CAT_ATTACK;
    const startX = robotCat.x + direction * settings.launchOffsetX;
    const startY = robotCat.y - settings.launchOffsetY;
    const aim = RobotCatClawProjectileSystem.getAimVector(
      startX,
      startY,
      this.player,
      direction,
    );
    const sprite = this.createSprite(startX, startY, direction);
    RobotCatAudioSystem.playClawAttack(this.scene);
    this.addProjectile(sprite, aim);
  }

  /**
   * Creates one animated claw sprite.
   * @param {number} startX - The start x value.
   * @param {number} startY - The start y value.
   * @param {-1|1} direction - The horizontal firing direction.
   * @returns {Phaser.GameObjects.Sprite} The created sprite.
   */
  createSprite(startX, startY, direction) {
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
   * Adds one moving claw projectile.
   * @param {Phaser.GameObjects.Sprite} sprite - The claw sprite.
   * @param {{x: number, y: number}} aim - The normalized aim vector.
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
   * Returns a normalized aim vector toward the player.
   * @param {number} startX - The start x value.
   * @param {number} startY - The start y value.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @param {-1|1} fallbackDirection - The fallback direction.
   * @returns {{x: number, y: number}} The normalized vector.
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
   * Updates all active claw projectiles.
   * @param {number} time - The current scene time in milliseconds.
   * @param {number} delta - The elapsed frame time in milliseconds.
   * @returns {void} No value is returned.
   */
  update(time, delta) {
    [...this.projectiles].forEach((projectile) => {
      this.updateProjectile(projectile, time, delta);
    });
  }

  /**
   * Updates one claw projectile.
   * @param {object} projectile - The projectile state.
   * @param {number} time - The current scene time in milliseconds.
   * @param {number} delta - The elapsed frame time in milliseconds.
   * @returns {void} No value is returned.
   */
  updateProjectile(projectile, time, delta) {
    this.moveProjectile(projectile, delta);
    if (this.hitsPlayer(projectile.sprite)) {
      this.onPlayerHit(time);
      this.dissolve(projectile);
      return;
    }
    if (projectile.distance >= ROBOT_CAT_ATTACK.projectileDistance) {
      this.dissolve(projectile);
    }
  }

  /**
   * Moves one claw projectile.
   * @param {object} projectile - The projectile state.
   * @param {number} delta - The elapsed frame time in milliseconds.
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
   * Checks whether a claw overlaps the player body.
   * @param {Phaser.GameObjects.Sprite} sprite - The claw sprite.
   * @returns {boolean} Whether the claw overlaps the player.
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
   * Dissolves and removes one claw projectile.
   * @param {{sprite: Phaser.GameObjects.Sprite}} projectile - The projectile state.
   * @returns {void} No value is returned.
   */
  dissolve(projectile) {
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
   * Removes every active claw projectile.
   * @returns {void} No value is returned.
   */
  clear() {
    [...this.projectiles].forEach((projectile) => this.dissolve(projectile));
  }
}
