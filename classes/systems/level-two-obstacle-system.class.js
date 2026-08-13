import { LEVEL_TWO } from "../../js/config/level-two-settings.js";
import { AssetLoaderSystem } from "./asset-loader-system.class.js";

/**
 * Manages level two obstacle system behavior.
 */
export class LevelTwoObstacleSystem {
  /**
   * Loads the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static load(scene) {
    this.loadSpritesheet(scene, LEVEL_TWO.nuclearBoxObstacle);
    this.loadSpritesheet(scene, LEVEL_TWO.floatingLightPlatform);
  }

  /**
   * Loads spritesheet.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {object} settings - The configuration values to use.
   * @returns {void} No value is returned.
   */
  static loadSpritesheet(scene, settings) {
    AssetLoaderSystem.loadSpritesheet(scene, settings);
  }

  /**
   * Creates nuclear boxes.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.Physics.Arcade.StaticGroup} platforms - The platforms value.
   * @param {number} surfaceY - The surface y value.
   * @returns {Phaser.GameObjects.Sprite[]} The resulting collection.
   */
  static createNuclearBoxes(scene, platforms, surfaceY) {
    const settings = LEVEL_TWO.nuclearBoxObstacle;

    this.registerAnimation(scene, settings);
    return settings.xPositions.map((x) => {
      const obstacle = this.createSprite(scene, settings, x, surfaceY);
      this.createCollision(scene, platforms, settings, x, surfaceY);
      return obstacle;
    });
  }

  /**
   * Creates floating light platforms.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.Physics.Arcade.StaticGroup} platforms - The platforms value.
   * @returns {Phaser.GameObjects.Sprite[]} The resulting collection.
   */
  static createFloatingLightPlatforms(scene, platforms) {
    const settings = LEVEL_TWO.floatingLightPlatform;

    this.registerAnimation(scene, settings);
    return settings.placements.map((placement) =>
      this.createFloatingLightPlatform(scene, platforms, settings, placement),
    );
  }

  /**
   * Creates floating light platform.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.Physics.Arcade.StaticGroup} platforms - The platforms value.
   * @param {object} settings - The configuration values to use.
   * @param {object} placement - The placement value.
   * @returns {Phaser.GameObjects.Sprite} The resulting data object.
   */
  static createFloatingLightPlatform(scene, platforms, settings, placement) {
    const platform = this.createFloatingPlatformSprite(
      scene,
      settings,
      placement,
    );
    const collision = this.createFloatingPlatformCollision(
      scene,
      platforms,
      settings,
      placement,
    );

    platform.setData("collision", collision);
    this.createFloatingPlatformMotion(scene, platform, collision, settings, placement);
    return platform;
  }

  /**
   * Creates floating platform motion.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.GameObjects.Sprite} platform - The platform value.
   * @param {Phaser.GameObjects.Rectangle} collision - The collision value.
   * @param {object} settings - The configuration values to use.
   * @param {object} placement - The placement value.
   * @returns {Phaser.Tweens.Tween|null} The created instance.
   */
  static createFloatingPlatformMotion(
    scene,
    platform,
    collision,
    settings,
    placement,
  ) {
    if (!placement.motion) return null;
    return scene.tweens.add(this.getFloatingPlatformTween(
      platform, collision, settings, placement,
    ));
  }

  /**
   * Returns the floating platform tween settings.
   * @param {Phaser.GameObjects.Sprite} platform - The platform sprite.
   * @param {Phaser.GameObjects.Rectangle} collision - The collision object.
   * @param {object} settings - The platform settings.
   * @param {object} placement - The platform placement.
   * @returns {object} The tween settings.
   */
  static getFloatingPlatformTween(platform, collision, settings, placement) {
    return {
      targets: [platform, collision],
      x: this.getFloatingPlatformTargetX(settings, placement.motion),
      duration: placement.motion.durationMs,
      ease: "Sine.inOut",
      yoyo: true,
      repeat: -1,
      onUpdate: () => this.syncFloatingPlatformBody(platform, collision),
    };
  }

  /**
   * Synchronizes floating platform body.
   * @param {Phaser.GameObjects.Sprite} platform - The platform value.
   * @param {Phaser.GameObjects.Rectangle} collision - The collision value.
   * @returns {void} No value is returned.
   */
  static syncFloatingPlatformBody(platform, collision) {
    const previousX = collision.body?.center.x ?? collision.x;

    collision.body?.updateFromGameObject();
    this.carryPlatformRider(platform, collision.x - previousX);
  }

  /**
   * Updates player platform contact.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @param {Phaser.GameObjects.Sprite[]} platforms - The platforms value.
   * @returns {void} No value is returned.
   */
  static updatePlayerPlatformContact(player, platforms = []) {
    const platform = platforms.find((entry) =>
      this.isPlayerStandingOn(player, entry.getData("collision")),
    );

    platforms.forEach((entry) => entry.setData("rider", null));
    platform?.setData("rider", player);
  }

  /**
   * Handles carry platform rider.
   * @param {Phaser.GameObjects.Sprite} platform - The platform value.
   * @param {number} deltaX - The delta x value.
   * @returns {void} No value is returned.
   */
  static carryPlatformRider(platform, deltaX) {
    const player = platform.getData("rider");

    if (!player?.body || player.body.velocity.y < 0 || deltaX === 0) return;
    this.movePlayerHorizontally(player, deltaX);
  }

  /**
   * Checks the player standing on condition.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @param {Phaser.GameObjects.Rectangle|undefined} collision - The collision value.
   * @returns {boolean} Whether the requested condition is met.
   */
  static isPlayerStandingOn(player, collision) {
    if (!player?.body || !collision?.body) return false;

    const verticallyAligned =
      Math.abs(player.body.bottom - collision.body.top) <= 8;
    const horizontallyAligned =
      player.body.right > collision.body.left &&
      player.body.left < collision.body.right;
    return verticallyAligned && horizontallyAligned && player.body.velocity.y >= 0;
  }

  /**
   * Moves player horizontally.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @param {number} deltaX - The delta x value.
   * @returns {void} No value is returned.
   */
  static movePlayerHorizontally(player, deltaX) {
    player.x += deltaX;
    player.body.x += deltaX;
  }

  /**
   * Returns floating platform target x.
   * @param {object} settings - The configuration values to use.
   * @param {object} motion - The motion value.
   * @returns {number} The resulting numeric value.
   */
  static getFloatingPlatformTargetX(settings, motion) {
    const target = settings.placements[motion.targetPlacementIndex];

    return target.x - settings.displayWidth - motion.edgeGap;
  }

  /**
   * Creates floating platform sprite.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {object} settings - The configuration values to use.
   * @param {{x: number, visualTopY: number}} placement - The placement value.
   * @returns {Phaser.GameObjects.Sprite} The resulting data object.
   */
  static createFloatingPlatformSprite(scene, settings, placement) {
    return scene.add
      .sprite(placement.x, placement.visualTopY, settings.key, 0)
      .setOrigin(0.5, 0)
      .setDisplaySize(settings.displayWidth, settings.displayHeight)
      .setDepth(settings.depth)
      .play(settings.animationKey);
  }

  /**
   * Creates floating platform collision.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.Physics.Arcade.StaticGroup} platforms - The platforms value.
   * @param {object} settings - The configuration values to use.
   * @param {{x: number, visualTopY: number}} placement - The placement value.
   * @returns {Phaser.GameObjects.Rectangle} The resulting data object.
   */
  static createFloatingPlatformCollision(
    scene,
    platforms,
    settings,
    placement,
  ) {
    const dimensions = this.getFloatingCollisionDimensions(settings, placement);
    const collision = scene.add.rectangle(placement.x, dimensions.centerY,
      dimensions.width, settings.collisionHeight);
    collision.setVisible(false);
    platforms.add(collision);
    return collision;
  }

  /**
   * Returns floating platform collision dimensions.
   * @param {object} settings - The platform settings.
   * @param {object} placement - The platform placement.
   * @returns {{centerY: number, width: number}} The collision dimensions.
   */
  static getFloatingCollisionDimensions(settings, placement) {
    const scale = settings.displayWidth / settings.frameWidth;
    const surfaceY = placement.visualTopY +
      settings.surfaceOffsetY * scale + settings.collisionOffsetY;
    return {
      centerY: surfaceY + settings.collisionHeight / 2,
      width: settings.displayWidth - settings.edgeInset * 2,
    };
  }

  /**
   * Registers animation.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {object} settings - The configuration values to use.
   * @returns {void} No value is returned.
   */
  static registerAnimation(scene, settings) {
    if (scene.anims.exists(settings.animationKey)) return;

    scene.anims.create({
      key: settings.animationKey,
      frames: settings.animationFrames.map(({ frame, durationMs }) => ({
        key: settings.key,
        frame,
        duration: durationMs,
      })),
      frameRate: settings.frameRate,
      repeat: -1,
    });
  }

  /**
   * Creates sprite.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {object} settings - The configuration values to use.
   * @param {number} x - The horizontal position.
   * @param {number} bottomY - The bottom y value.
   * @returns {Phaser.GameObjects.Sprite} The resulting data object.
   */
  static createSprite(scene, settings, x, bottomY) {
    return scene.add
      .sprite(x, bottomY, settings.key, 0)
      .setOrigin(0.5, 1)
      .setDisplaySize(settings.displayWidth, settings.displayHeight)
      .setDepth(settings.depth)
      .play(settings.animationKey);
  }

  /**
   * Creates collision.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.Physics.Arcade.StaticGroup} platforms - The platforms value.
   * @param {object} settings - The configuration values to use.
   * @param {number} x - The horizontal position.
   * @param {number} bottomY - The bottom y value.
   * @returns {Phaser.GameObjects.Rectangle} The resulting data object.
   */
  static createCollision(scene, platforms, settings, x, bottomY) {
    const collision = scene.add.rectangle(
      x,
      bottomY - settings.collisionHeight / 2,
      settings.collisionWidth,
      settings.collisionHeight,
    );

    collision.setVisible(false);
    platforms.add(collision);
    return collision;
  }
}
