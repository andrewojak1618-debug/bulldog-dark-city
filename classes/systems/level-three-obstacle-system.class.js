import { LEVEL_THREE } from "../../js/config/level-three-settings.js";
import { AssetLoaderSystem } from "./asset-loader-system.class.js";

/**
 * Manages level three obstacle system behavior.
 */
export class LevelThreeObstacleSystem {
  /**
   * Loads the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static load(scene) {
    this.getCatBoxSettings().forEach((settings) => {
      AssetLoaderSystem.loadSpritesheet(scene, settings);
    });
  }

  /**
   * Creates the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.Physics.Arcade.StaticGroup} platforms - The platforms value.
   * @param {number} surfaceY - The surface y value.
   * @returns {Phaser.GameObjects.Sprite[]} The resulting collection.
   */
  static create(scene, platforms, surfaceY) {
    return this.getCatBoxSettings().map((settings) =>
      this.createCatBox(scene, platforms, settings, surfaceY),
    );
  }

  /**
   * Creates cat box.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.Physics.Arcade.StaticGroup} platforms - The platforms value.
   * @param {object} settings - The configuration values to use.
   * @param {number} surfaceY - The surface y value.
   * @returns {Phaser.GameObjects.Sprite} The resulting data object.
   */
  static createCatBox(scene, platforms, settings, surfaceY) {
    const bottomY = surfaceY + settings.verticalOffsetY;
    this.registerAnimation(scene, settings);
    this.createCollision(scene, platforms, settings, bottomY);

    return scene.add.sprite(settings.x, bottomY, settings.key, 0)
      .setOrigin(0.5, 1)
      .setDisplaySize(settings.displayWidth, settings.displayHeight)
      .setDepth(settings.depth)
      .play(settings.animationKey);
  }

  /**
   * Returns cat box settings.
   * @returns {object[]} The resulting collection.
   */
  static getCatBoxSettings() {
    return [LEVEL_THREE.catBoxSmall, LEVEL_THREE.catBoxLarge];
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
      frames: scene.anims.generateFrameNumbers(settings.key, {
        start: 0,
        end: settings.frameCount - 1,
      }),
      frameRate: settings.frameRate,
      repeat: -1,
    });
  }

  /**
   * Creates collision.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.Physics.Arcade.StaticGroup} platforms - The platforms value.
   * @param {object} settings - The configuration values to use.
   * @param {number} bottomY - The bottom y value.
   * @returns {Phaser.GameObjects.Rectangle} The resulting data object.
   */
  static createCollision(scene, platforms, settings, bottomY) {
    const collision = scene.add.rectangle(
      settings.x,
      bottomY - settings.collisionHeight / 2,
      settings.collisionWidth,
      settings.collisionHeight,
    ).setVisible(false);

    platforms.add(collision);
    return collision;
  }
}
