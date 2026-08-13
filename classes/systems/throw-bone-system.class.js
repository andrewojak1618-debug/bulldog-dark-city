import Phaser from "phaser";
import { THROW_BONES } from "../../js/config/throw-bone-settings.js";
import { RobotCatCombatSystem } from "./robot-cat-combat-system.class.js";
import { ThrowBoneInventory } from "./throw-bone-inventory.class.js";
import { ThrowBoneHud } from "../ui/throw-bone-hud.class.js";
import { AssetLoaderSystem } from "./asset-loader-system.class.js";

/**
 * Manages throw bone system behavior.
 */
export class ThrowBoneSystem {
  /**
   * Loads the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static load(scene) {
    Object.values(THROW_BONES.types).forEach((type) => {
      AssetLoaderSystem.loadSpritesheet(scene, type);
    });
  }

  /**
   * Creates the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @param {import("./health-system.class.js").HealthSystem} robotCatHealth - The robot cat health value.
   * @param {import("../input/input-system.class.js").InputSystem} input - The active input system.
   * @returns {ThrowBoneSystem} The created instance.
   */
  static create(scene, player, robotCat, robotCatHealth, input) {
    this.registerAnimations(scene);
    const system = new ThrowBoneSystem(
      scene,
      player,
      robotCat,
      robotCatHealth,
      input,
    );
    system.createPickups();
    return system;
  }

  /**
   * Registers animations.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static registerAnimations(scene) {
    Object.values(THROW_BONES.types).forEach((type) => {
      if (scene.anims.exists(type.animationKey)) return;
      scene.anims.create({
        key: type.animationKey,
        frames: scene.anims.generateFrameNumbers(type.key, {
          start: 0,
          end: type.frameCount - 1,
        }),
        frameRate: type.frameRate,
        repeat: -1,
      });
    });
  }

  /**
   * Creates a new instance.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @param {import("./health-system.class.js").HealthSystem} robotCatHealth - The robot cat health value.
   * @param {import("../input/input-system.class.js").InputSystem} input - The active input system.
   */
  constructor(scene, player, robotCat, robotCatHealth, input) {
    this.scene = scene;
    this.player = player;
    this.robotCat = robotCat;
    this.robotCatHealth = robotCatHealth;
    this.input = input;
    this.inventory = new ThrowBoneInventory(Object.keys(THROW_BONES.types));
    this.hud = new ThrowBoneHud(scene, this.inventory);
    this.pickups = scene.physics.add.group({ allowGravity: false });
    this.projectiles = scene.physics.add.group({ allowGravity: false });
    this.keys = scene.input.keyboard?.addKeys({ normal: "K", nuclear: "L" });
  }

  /**
   * Creates pickups.
   * @returns {void} No value is returned.
   */
  createPickups() {
    THROW_BONES.placements.forEach((placement) => this.createPickup(placement));
    this.scene.physics.add.overlap(
      this.player,
      this.pickups,
      (_player, pickup) => this.collect(pickup),
    );
  }

  /**
   * Creates one collectible throwing bone.
   * @param {object} placement - The pickup placement.
   * @returns {void} No value is returned.
   */
  createPickup(placement) {
    const settings = THROW_BONES.types[placement.type];
    const pickup = this.pickups.create(placement.x, placement.y, settings.key)
      .setDisplaySize(THROW_BONES.pickupSize, THROW_BONES.pickupSize)
      .setDepth(THROW_BONES.depth).setData("boneType", placement.type)
      .play(settings.animationKey);
    pickup.body.setAllowGravity(false).setImmovable(true);
  }

  /**
   * Collects the current state.
   * @param {Phaser.Physics.Arcade.Sprite} pickup - The pickup value.
   * @returns {boolean} Whether the requested condition is met.
   */
  collect(pickup) {
    if (!pickup.active) return false;
    const type = pickup.getData("boneType");
    if (!this.inventory.collect(type)) return false;
    pickup.disableBody(true, true);
    return true;
  }

  /**
   * Updates the current state.
   * @returns {void} No value is returned.
   */
  update() {
    if (this.shouldThrow("normal")) this.throw("normal");
    if (this.shouldThrow("nuclear")) this.throw("nuclear");
    this.updateProjectiles();
  }

  /**
   * Checks the throw condition.
   * @param {"normal"|"nuclear"} type - The requested item type.
   * @returns {boolean} Whether the requested condition is met.
   */
  shouldThrow(type) {
    const touchTriggered = this.input?.consumeThrow(type) ?? false;
    const key = this.keys?.[type];
    const keyboardTriggered = key && Phaser.Input.Keyboard.JustDown(key);
    return Boolean(touchTriggered || keyboardTriggered);
  }

  /**
   * Handles throw.
   * @param {string} type - The requested item type.
   * @returns {boolean} Whether the requested condition is met.
   */
  throw(type) {
    if (!this.inventory.consume(type)) return false;
    const settings = THROW_BONES.types[type];
    const direction = this.player.flipX ? -1 : 1;
    const projectile = this.createProjectile(type, settings, direction);
    projectile.body.setAllowGravity(false);
    return true;
  }

  /**
   * Creates and launches one throwing bone projectile.
   * @param {string} type - The requested bone type.
   * @param {object} settings - The bone settings.
   * @param {number} direction - The horizontal throw direction.
   * @returns {Phaser.Physics.Arcade.Sprite} The projectile.
   */
  createProjectile(type, settings, direction) {
    return this.projectiles.create(this.player.x + direction * 36,
      this.player.y - 28, settings.key)
      .setDisplaySize(THROW_BONES.projectileSize, THROW_BONES.projectileSize)
      .setDepth(THROW_BONES.depth)
      .setVelocityX(direction * THROW_BONES.projectileSpeed)
      .setData({
        boneType: type,
        damage: settings.damage,
        expiresAt: this.scene.time.now + THROW_BONES.projectileLifetimeMs,
      })
      .play(settings.animationKey);
  }

  /**
   * Updates projectiles.
   * @returns {void} No value is returned.
   */
  updateProjectiles() {
    this.projectiles.getChildren().forEach((projectile) => {
      if (!projectile.active) return;
      if (this.scene.time.now >= projectile.getData("expiresAt")) {
        projectile.destroy();
        return;
      }
      if (!this.hitsRobotCat(projectile)) return;
      RobotCatCombatSystem.applyDamage(
        this.robotCat,
        this.robotCatHealth,
        projectile.getData("damage"),
      );
      projectile.destroy();
    });
  }

  /**
   * Handles hits robot cat.
   * @param {Phaser.Physics.Arcade.Sprite} projectile - The projectile value.
   * @returns {boolean} Whether the requested condition is met.
   */
  hitsRobotCat(projectile) {
    if (!this.robotCat?.active) return false;
    return (
      Math.abs(projectile.x - this.robotCat.x) <= THROW_BONES.hitRangeX &&
      Math.abs(projectile.y - this.robotCat.y) <= THROW_BONES.hitRangeY
    );
  }
}
