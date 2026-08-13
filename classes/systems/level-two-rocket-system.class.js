import Phaser from "phaser";
import { LEVEL_TWO } from "../../js/config/level-two-settings.js";
import { BulldogMutationStateSystem } from
  "./bulldog-mutation-state-system.class.js";
import { AssetLoaderSystem } from "./asset-loader-system.class.js";

/**
 * Manages level two rocket system behavior.
 */
export class LevelTwoRocketSystem {
  /**
   * Loads the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static load(scene) {
    const settings = LEVEL_TWO.drones.rocket;
    this.loadSpriteAsset(scene, settings.key, settings.path, settings);
    this.loadSpriteAsset(scene, settings.explosionKey,
      settings.explosionPath, settings);
    AssetLoaderSystem.loadAudio(scene, {
      key: settings.explosionSoundKey,
      path: settings.explosionSoundPath,
    });
  }

  /**
   * Loads one rocket spritesheet.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {string} key - The texture key.
   * @param {string} path - The texture path.
   * @param {object} settings - The rocket settings.
   * @returns {void} No value is returned.
   */
  static loadSpriteAsset(scene, key, path, settings) {
    AssetLoaderSystem.loadSpritesheet(scene, {
      key, path, frameWidth: settings.frameWidth,
      frameHeight: settings.frameHeight,
    });
  }

  /**
   * Creates a new instance.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.GameObjects.Sprite[]} drones - The drones value.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @param {Phaser.Physics.Arcade.StaticGroup} platforms - The platforms value.
   * @param {import("./health-system.class.js").HealthSystem} health - The associated health system.
   */
  constructor(scene, drones, player, platforms, health) {
    this.scene = scene;
    this.drones = drones;
    this.player = player;
    this.platforms = platforms;
    this.health = health;
    this.projectiles = scene.physics.add.group();
    this.initializeState();
    this.registerAnimations();
    this.bindCollisions();
  }

  /**
   * Initializes state.
   * @returns {void} No value is returned.
   */
  initializeState() {
    this.nextShotAt = 0;
    this.wasBigDroneAlert = false;
    this.playerKnockedOut = false;
  }

  /**
   * Binds collisions.
   * @returns {void} No value is returned.
   */
  bindCollisions() {
    this.scene.physics.add.collider(
      this.projectiles,
      this.platforms,
      (first, second) => this.explode(
        this.resolveProjectile(first, second),
      ),
    );
    this.scene.physics.add.overlap(
      this.projectiles,
      this.player,
      (first, second) => this.hitPlayer(
        this.resolveProjectile(first, second),
      ),
    );
  }

  /**
   * Registers animations.
   * @returns {void} No value is returned.
   */
  registerAnimations() {
    this.registerFlightAnimation();
    this.registerExplosionAnimation();
  }

  /**
   * Registers flight animation.
   * @returns {void} No value is returned.
   */
  registerFlightAnimation() {
    const settings = LEVEL_TWO.drones.rocket;
    if (this.scene.anims.exists(settings.animationKey)) return;
    this.scene.anims.create({
      key: settings.animationKey,
      frames: this.scene.anims.generateFrameNumbers(
        settings.key,
        { start: 0, end: 3 },
      ),
      frameRate: settings.frameRate,
      repeat: -1,
    });
  }

  /**
   * Registers explosion animation.
   * @returns {void} No value is returned.
   */
  registerExplosionAnimation() {
    const settings = LEVEL_TWO.drones.rocket;
    if (this.scene.anims.exists(settings.explosionAnimationKey)) return;
    this.scene.anims.create({
      key: settings.explosionAnimationKey,
      frames: this.scene.anims.generateFrameNumbers(
        settings.explosionKey,
        { start: 1, end: 3 },
      ),
      frameRate: settings.explosionFrameRate,
      repeat: 0,
    });
  }

  /**
   * Updates the current state.
   * @param {number} time - The current scene time in milliseconds.
   * @returns {boolean} Whether the requested condition is met.
   */
  update(time) {
    if (this.playerKnockedOut) return true;
    const bigDrone = this.getBigDrone();
    const isAlert = Boolean(bigDrone?.getData("isAlert"));

    if (isAlert && !this.wasBigDroneAlert) {
      this.nextShotAt = time + LEVEL_TWO.drones.rocket.firstShotDelayMs;
    }
    this.wasBigDroneAlert = isAlert;
    if (!isAlert || time < this.nextShotAt) return false;

    this.fire(bigDrone);
    this.nextShotAt = time + LEVEL_TWO.drones.rocket.cooldownMs;
    return false;
  }

  /**
   * Returns big drone.
   * @returns {Phaser.GameObjects.Sprite|undefined} The resulting data object.
   */
  getBigDrone() {
    return this.drones.find((drone) =>
      drone.getData("drone")?.tracksPlayerWithBeam
    );
  }

  /**
   * Handles fire.
   * @param {Phaser.GameObjects.Sprite} drone - The drone value.
   * @returns {Phaser.Physics.Arcade.Sprite} The resulting value.
   */
  fire(drone) {
    const settings = LEVEL_TWO.drones.rocket;
    const targetY = this.player.body?.center.y ?? this.player.y;
    const rocket = this.createRocket(drone, settings);
    const angle = Phaser.Math.Angle.Between(
      rocket.x,
      rocket.y,
      this.player.x,
      targetY,
    );

    this.launchRocket(rocket, angle, settings);
    return rocket;
  }

  /**
   * Creates rocket.
   * @param {Phaser.GameObjects.Sprite} drone - The drone value.
   * @param {object} settings - The configuration values to use.
   * @returns {Phaser.Physics.Arcade.Sprite} The created instance.
   */
  createRocket(drone, settings) {
    return this.projectiles.create(
      drone.x,
      drone.y + settings.muzzleOffsetY,
      settings.key,
      0,
    );
  }

  /**
   * Handles launch rocket.
   * @param {Phaser.Physics.Arcade.Sprite} rocket - The rocket value.
   * @param {number} angle - The angle value.
   * @param {object} settings - The configuration values to use.
   * @returns {void} No value is returned.
   */
  launchRocket(rocket, angle, settings) {
    rocket
      .setScale(settings.rocketScale)
      .setDepth(settings.depth)
      .setRotation(angle - Math.PI)
      .play(settings.animationKey);
    this.configureRocketBody(rocket, angle, settings);
  }

  /**
   * Configures rocket body.
   * @param {Phaser.Physics.Arcade.Sprite} rocket - The rocket value.
   * @param {number} angle - The angle value.
   * @param {object} settings - The configuration values to use.
   * @returns {void} No value is returned.
   */
  configureRocketBody(rocket, angle, settings) {
    rocket.body.setCircle(
      settings.bodyRadius,
      settings.bodyOffsetX,
      settings.bodyOffsetY,
    );
    this.scene.physics.velocityFromRotation(
      angle,
      settings.speed,
      rocket.body.velocity,
    );
  }

  /**
   * Handles hit player.
   * @param {Phaser.Physics.Arcade.Sprite} rocket - The rocket value.
   * @returns {void} No value is returned.
   */
  hitPlayer(rocket) {
    if (!rocket?.active || rocket.getData("isExploding")) return;
    if (!BulldogMutationStateSystem.canReceiveNormalDamage(this.player)) {
      this.explode(rocket);
      return;
    }
    const remainingHealth = this.applyRocketDamage();
    this.showPlayerHitReaction(remainingHealth);
    this.explode(rocket);
  }

  /**
   * Applies rocket damage.
   * @returns {number} The resulting numeric value.
   */
  applyRocketDamage() {
    return this.health.takeDamage(LEVEL_TWO.drones.rocket.damage);
  }

  /**
   * Shows player hit reaction.
   * @param {number} remainingHealth - The remaining health value.
   * @returns {void} No value is returned.
   */
  showPlayerHitReaction(remainingHealth) {
    this.playerKnockedOut = remainingHealth <= 0;
    if (this.playerKnockedOut) {
      this.player.knockOut();
    } else {
      this.player.takeHit(this.scene.time.now);
    }
  }

  /**
   * Resolves projectile.
   * @param {Phaser.GameObjects.GameObject} first - The first value.
   * @param {Phaser.GameObjects.GameObject} second - The second value.
   * @returns {Phaser.Physics.Arcade.Sprite|undefined} The resulting value.
   */
  resolveProjectile(first, second) {
    const projectiles = this.projectiles.getChildren();
    return projectiles.includes(first) ? first :
      projectiles.includes(second) ? second : undefined;
  }

  /**
   * Handles explode.
   * @param {Phaser.Physics.Arcade.Sprite} rocket - The rocket value.
   * @returns {void} No value is returned.
   */
  explode(rocket) {
    if (!rocket?.active || rocket.getData("isExploding")) return;
    rocket.setData("isExploding", true);
    const { x, y } = rocket;
    rocket.destroy();
    const settings = LEVEL_TWO.drones.rocket;
    this.playExplosionSound(settings);
    const explosion = this.scene.add
      .sprite(x, y, settings.explosionKey, 1)
      .setScale(settings.explosionScale)
      .setDepth(settings.depth)
      .play(settings.explosionAnimationKey);
    explosion.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      explosion.destroy();
    });
  }

  /**
   * Plays explosion sound.
   * @param {object} settings - The configuration values to use.
   * @returns {void} No value is returned.
   */
  playExplosionSound(settings) {
    this.scene.sound.play(settings.explosionSoundKey, {
      volume: settings.explosionSoundVolume,
    });
  }
}
