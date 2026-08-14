import {
  ROBOT_CAT_ROCKET_ATTACK,
  ROBOT_CAT_ROCKET_EXPLOSION_TEXTURE,
  ROBOT_CAT_ROCKET_TEXTURE,
} from "../../js/config/robot-cat-settings.js";
import { AssetLoaderSystem } from "./asset-loader-system.class.js";
import { BulldogMutationStateSystem } from
  "./bulldog-mutation-state-system.class.js";
import { RobotCatPhaseSystem } from
  "./robot-cat-phase-system.class.js";

const ANIMATION_COMPLETE_EVENT = "animationcomplete";
const MILLISECONDS_PER_SECOND = 1_000;

/**
 * Manages the robot cat's homing rockets and impact explosions.
 */
export class RobotCatRocketSystem {
  /**
   * Loads rocket, explosion, and sound assets.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static load(scene) {
    AssetLoaderSystem.loadSpritesheet(scene, ROBOT_CAT_ROCKET_TEXTURE);
    AssetLoaderSystem.loadSpritesheet(
      scene,
      ROBOT_CAT_ROCKET_EXPLOSION_TEXTURE,
    );
    AssetLoaderSystem.loadAudio(scene, {
      key: ROBOT_CAT_ROCKET_ATTACK.explosionSoundKey,
      path: ROBOT_CAT_ROCKET_ATTACK.explosionSoundPath,
    });
  }

  /**
   * Creates a new rocket system.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @param {Phaser.Physics.Arcade.StaticGroup} platforms - The level collision surfaces.
   * @param {import("./health-system.class.js").HealthSystem} health - The player health system.
   * @returns {RobotCatRocketSystem} The created instance.
   */
  static create(scene, robotCat, player, platforms, health) {
    return new RobotCatRocketSystem(
      scene,
      robotCat,
      player,
      platforms,
      health,
    );
  }

  /**
   * Creates a new instance.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @param {Phaser.Physics.Arcade.StaticGroup} platforms - The level collision surfaces.
   * @param {import("./health-system.class.js").HealthSystem} health - The player health system.
   */
  constructor(scene, robotCat, player, platforms, health) {
    this.scene = scene;
    this.robotCat = robotCat;
    this.player = player;
    this.health = health;
    this.projectiles = scene.physics.add.group({ allowGravity: false });
    this.registerAnimations();
    this.bindCollisions(platforms);
  }

  /**
   * Registers the rocket animations.
   * @returns {void} No value is returned.
   */
  registerAnimations() {
    this.registerAnimation(ROBOT_CAT_ROCKET_TEXTURE, 0, -1);
    const explosion = ROBOT_CAT_ROCKET_EXPLOSION_TEXTURE;
    this.registerAnimation(explosion, explosion.startFrame, 0);
  }

  /**
   * Registers one configured animation.
   * @param {object} texture - The texture configuration.
   * @param {number} startFrame - The first animation frame.
   * @param {number} repeat - The animation repeat count.
   * @returns {void} No value is returned.
   */
  registerAnimation(texture, startFrame, repeat) {
    if (this.scene.anims.exists(texture.animationKey)) return;
    this.scene.anims.create({
      key: texture.animationKey,
      frames: this.scene.anims.generateFrameNumbers(texture.key, {
        start: startFrame,
        end: texture.frameCount - 1,
      }),
      frameRate: texture.frameRate,
      repeat,
    });
  }

  /**
   * Binds rockets to level surfaces and the player.
   * @param {Phaser.Physics.Arcade.StaticGroup} platforms - The level collision surfaces.
   * @returns {void} No value is returned.
   */
  bindCollisions(platforms) {
    this.scene.physics.add.collider(
      this.projectiles,
      platforms,
      (first, second) => this.explode(this.resolveProjectile(first, second)),
    );
    this.scene.physics.add.overlap(
      this.projectiles,
      this.player,
      (first, second) => this.hitPlayer(this.resolveProjectile(first, second)),
    );
  }

  /**
   * Fires one homing rocket from the robot cat cannon.
   * @param {-1|1} direction - The horizontal firing direction.
   * @returns {Phaser.Physics.Arcade.Sprite} The created rocket.
   */
  fire(direction) {
    const settings = ROBOT_CAT_ROCKET_ATTACK;
    const rocket = this.projectiles.create(
      this.robotCat.x + direction * settings.launchOffsetX,
      this.robotCat.y - settings.launchOffsetY,
      ROBOT_CAT_ROCKET_TEXTURE.key,
      0,
    );
    this.configureRocket(rocket, direction);
    return rocket;
  }

  /**
   * Configures a newly created rocket.
   * @param {Phaser.Physics.Arcade.Sprite} rocket - The rocket sprite.
   * @param {-1|1} direction - The horizontal firing direction.
   * @returns {void} No value is returned.
   */
  configureRocket(rocket, direction) {
    const settings = ROBOT_CAT_ROCKET_ATTACK;
    rocket.setDisplaySize(settings.displaySize, settings.displaySize)
      .setDepth(settings.depth)
      .setRotation(direction < 0 ? 0 : Math.PI)
      .setData("expiresAt", this.scene.time.now + settings.lifetimeMs)
      .play(ROBOT_CAT_ROCKET_TEXTURE.animationKey);
    rocket.body.setCircle(
      settings.bodyRadius,
      settings.bodyOffsetX,
      settings.bodyOffsetY,
    );
    rocket.body.setVelocityX(direction * this.getRocketSpeed());
  }

  /**
   * Updates every active rocket's homing course.
   * @param {number} time - The current scene time in milliseconds.
   * @param {number} delta - The elapsed frame time in milliseconds.
   * @returns {void} No value is returned.
   */
  update(time, delta) {
    this.projectiles.getChildren().forEach((rocket) => {
      if (!rocket.active || rocket.getData("isExploding")) return;
      if (time >= rocket.getData("expiresAt")) return this.explode(rocket);
      this.steerRocket(rocket, delta);
      if (this.isOutsideWorld(rocket)) this.explode(rocket);
    });
  }

  /**
   * Steers one rocket toward the current player position.
   * @param {Phaser.Physics.Arcade.Sprite} rocket - The rocket sprite.
   * @param {number} delta - The elapsed frame time in milliseconds.
   * @returns {void} No value is returned.
   */
  steerRocket(rocket, delta) {
    const velocity = rocket.body.velocity;
    const currentAngle = Math.atan2(velocity.y, velocity.x);
    const targetAngle = this.getTargetAngle(rocket);
    const turn = ROBOT_CAT_ROCKET_ATTACK.maximumTurnRate * delta /
      MILLISECONDS_PER_SECOND;
    const angle = RobotCatRocketSystem.rotateTowards(
      currentAngle, targetAngle, turn,
    );
    this.scene.physics.velocityFromRotation(
      angle,
      this.getRocketSpeed(),
      velocity,
    );
    rocket.setRotation(angle - Math.PI);
  }

  /**
   * Returns the angle from a rocket to the player.
   * @param {Phaser.Physics.Arcade.Sprite} rocket - The rocket sprite.
   * @returns {number} The target angle in radians.
   */
  getTargetAngle(rocket) {
    const targetX = this.player.body?.center?.x ?? this.player.x;
    const targetY = this.player.body?.center?.y ?? this.player.y;
    return Math.atan2(targetY - rocket.y, targetX - rocket.x);
  }

  /**
   * Rotates one angle toward another by a limited step.
   * @param {number} current - The current angle in radians.
   * @param {number} target - The target angle in radians.
   * @param {number} maximumStep - The maximum turn step in radians.
   * @returns {number} The adjusted angle.
   */
  static rotateTowards(current, target, maximumStep) {
    const difference = Math.atan2(
      Math.sin(target - current),
      Math.cos(target - current),
    );
    const step = Math.max(-maximumStep, Math.min(maximumStep, difference));
    return current + step;
  }

  /**
   * Returns the rocket speed for the active boss phase.
   * @returns {number} The current rocket speed.
   */
  getRocketSpeed() {
    const phase = RobotCatPhaseSystem.getSettings(this.robotCat);
    return ROBOT_CAT_ROCKET_ATTACK.speed * phase.rocketSpeedMultiplier;
  }

  /**
   * Checks whether a rocket has left the physics world.
   * @param {Phaser.Physics.Arcade.Sprite} rocket - The rocket sprite.
   * @returns {boolean} Whether the rocket is outside the world.
   */
  isOutsideWorld(rocket) {
    return !this.scene.physics.world.bounds.contains(rocket.x, rocket.y);
  }

  /**
   * Applies a rocket hit to the player and creates an explosion.
   * @param {Phaser.Physics.Arcade.Sprite} rocket - The rocket sprite.
   * @returns {void} No value is returned.
   */
  hitPlayer(rocket) {
    if (!rocket?.active || rocket.getData("isExploding")) return;
    if (BulldogMutationStateSystem.canReceiveNormalDamage(this.player)) {
      const phase = RobotCatPhaseSystem.getSettings(this.robotCat);
      const remaining = this.health.takeDamage(phase.attackDamage);
      this.showPlayerHitReaction(remaining);
    }
    this.explode(rocket);
  }

  /**
   * Shows the player reaction after rocket damage.
   * @param {number} remainingHealth - The remaining player health.
   * @returns {void} No value is returned.
   */
  showPlayerHitReaction(remainingHealth) {
    if (remainingHealth <= 0) {
      this.player.knockOut();
      return;
    }
    this.player.takeHit(this.scene.time.now);
  }

  /**
   * Replaces one rocket with an explosion animation.
   * @param {Phaser.Physics.Arcade.Sprite} rocket - The rocket sprite.
   * @returns {void} No value is returned.
   */
  explode(rocket) {
    if (!rocket?.active || rocket.getData("isExploding")) return;
    rocket.setData("isExploding", true);
    const position = { x: rocket.x, y: rocket.y };
    rocket.destroy();
    this.playExplosionSound();
    this.createExplosion(position);
  }

  /**
   * Creates an explosion sprite at an impact position.
   * @param {{x: number, y: number}} position - The impact position.
   * @returns {Phaser.GameObjects.Sprite} The created explosion.
   */
  createExplosion(position) {
    const texture = ROBOT_CAT_ROCKET_EXPLOSION_TEXTURE;
    const explosion = this.scene.add.sprite(position.x, position.y,
      texture.key, texture.startFrame)
      .setDisplaySize(
        ROBOT_CAT_ROCKET_ATTACK.explosionDisplaySize,
        ROBOT_CAT_ROCKET_ATTACK.explosionDisplaySize,
      )
      .setDepth(ROBOT_CAT_ROCKET_ATTACK.depth)
      .play(texture.animationKey);
    explosion.once(ANIMATION_COMPLETE_EVENT, () => {
      explosion.destroy();
    });
    return explosion;
  }

  /**
   * Plays the configured explosion sound.
   * @returns {void} No value is returned.
   */
  playExplosionSound() {
    const settings = ROBOT_CAT_ROCKET_ATTACK;
    this.scene.sound.play(settings.explosionSoundKey, {
      volume: settings.explosionSoundVolume,
    });
  }

  /**
   * Resolves the projectile from a collision callback.
   * @param {Phaser.GameObjects.GameObject} first - The first collider object.
   * @param {Phaser.GameObjects.GameObject} second - The second collider object.
   * @returns {Phaser.Physics.Arcade.Sprite|undefined} The resolved rocket.
   */
  resolveProjectile(first, second) {
    const rockets = this.projectiles.getChildren();
    if (rockets.includes(first)) return first;
    if (rockets.includes(second)) return second;
    return undefined;
  }

  /**
   * Removes every active rocket.
   * @returns {void} No value is returned.
   */
  clear() {
    this.projectiles.clear(true, true);
  }
}
