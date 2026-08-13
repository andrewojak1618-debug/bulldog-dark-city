import { LEVEL_EXIT } from "../../js/config/level-exit-settings.js";
import {
  BULLDOG_ANIMATION_KEYS,
} from "../../js/config/bulldog-animation-settings.js";
import { AssetLoaderSystem } from "./asset-loader-system.class.js";

/**
 * Manages level exit system behavior.
 */
export class LevelExitSystem {
  /**
   * Loads the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static load(scene) {
    AssetLoaderSystem.loadImage(scene, {
      key: LEVEL_EXIT.postTextureKey,
      path: LEVEL_EXIT.postPath,
    });
    AssetLoaderSystem.loadSpritesheet(scene, {
      key: LEVEL_EXIT.textureKey,
      path: LEVEL_EXIT.path,
      frameWidth: LEVEL_EXIT.frameWidth,
      frameHeight: LEVEL_EXIT.frameHeight,
    });
  }

  /**
   * Creates the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {LevelExitSystem} The created instance.
   */
  static create(scene) {
    this.registerAnimation(scene);
    return new LevelExitSystem(scene);
  }

  /**
   * Registers animation.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static registerAnimation(scene) {
    if (scene.anims.exists(LEVEL_EXIT.animationKey)) return;
    scene.anims.create({
      key: LEVEL_EXIT.animationKey,
      frames: LEVEL_EXIT.frameSequence.map((frame) => ({
        key: LEVEL_EXIT.textureKey,
        frame,
      })),
      frameRate: LEVEL_EXIT.frameRate,
      repeat: -1,
    });
  }

  /**
   * Creates a new instance.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   */
  constructor(scene) {
    this.scene = scene;
    this.isUnlocked = false;
    this.isTransitioning = false;
    this.hasCompleted = false;
    this.post = this.createExitObject(scene, "image", LEVEL_EXIT.postTextureKey)
      .setAlpha(0).setVisible(false);
    this.sign = this.createExitObject(scene, "sprite", LEVEL_EXIT.textureKey, 0)
      .setDepth(LEVEL_EXIT.depth + 0.1).setAlpha(0).setVisible(false);
  }

  /**
   * Creates one exit sign display object.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {"image"|"sprite"} type - The display object type.
   * @param {string} texture - The texture key.
   * @param {number} [frame] - The optional texture frame.
   * @returns {Phaser.GameObjects.Image|Phaser.GameObjects.Sprite} The exit object.
   */
  createExitObject(scene, type, texture, frame) {
    return scene.add[type](LEVEL_EXIT.x, LEVEL_EXIT.groundY, texture, frame)
      .setOrigin(0.5, 1)
      .setDisplaySize(LEVEL_EXIT.displayWidth, LEVEL_EXIT.displayHeight)
      .setDepth(LEVEL_EXIT.depth);
  }

  /**
   * Handles unlock.
   * @returns {boolean} Whether the requested condition is met.
   */
  unlock() {
    if (this.isUnlocked) return false;
    this.isUnlocked = true;
    this.post.setVisible(true);
    this.sign.setVisible(true).play(LEVEL_EXIT.animationKey);
    this.scene.tweens.add({
      targets: [this.post, this.sign],
      alpha: 1,
      duration: LEVEL_EXIT.unlockFadeMs,
      ease: "Sine.easeOut",
    });
    return true;
  }

  /**
   * Updates the current state.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - The player-controlled bulldog.
   * @returns {boolean} Whether the requested condition is met.
   */
  update(player) {
    if (!this.isUnlocked || this.hasCompleted) return false;
    if (!this.isTransitioning && player.x >= LEVEL_EXIT.triggerX) {
      this.startTransition(player);
    }
    if (!this.isTransitioning) return false;
    player.setVelocityX(LEVEL_EXIT.exitSpeed);
    player.play(BULLDOG_ANIMATION_KEYS.run, true);
    if (player.x < LEVEL_EXIT.leaveWorldX) return false;
    this.hasCompleted = true;
    return true;
  }

  /**
   * Starts transition.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - The player-controlled bulldog.
   * @returns {void} No value is returned.
   */
  startTransition(player) {
    this.isTransitioning = true;
    player.setCollideWorldBounds(false);
    player.setFlipX(false);
    player.play(BULLDOG_ANIMATION_KEYS.run, true);
  }
}
