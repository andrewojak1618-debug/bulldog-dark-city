import {
  BULLDOG_ANIMATIONS,
  BULLDOG_TEXTURES,
} from
  "../../js/config/bulldog-animation-settings.js";
import { BulldogAudioSystem } from "./bulldog-audio-system.class.js";
import { AssetLoaderSystem } from "./asset-loader-system.class.js";

/**
 * Manages bulldog animation system behavior.
 */
export class BulldogAnimationSystem {
  /**
   * Loads the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static load(scene) {
    Object.values(BULLDOG_TEXTURES).forEach((texture) => {
      AssetLoaderSystem.loadSpritesheet(scene, texture);
    });

    BulldogAudioSystem.load(scene);
  }

  /**
   * Registers the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static register(scene) {
    BULLDOG_ANIMATIONS.forEach((animation) =>
      this.registerAnimation(scene, animation)
    );
  }

  /**
   * Registers animation.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {object} animation - The animation configuration to use.
   * @returns {void} No value is returned.
   */
  static registerAnimation(scene, animation) {
    if (scene.anims.exists(animation.key)) return;
    scene.anims.create({
      key: animation.key,
      frames: this.createFrames(scene, animation),
      frameRate: animation.frameRate,
      repeat: animation.repeat,
    });
  }

  /**
   * Creates frames.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {object} animation - The animation configuration to use.
   * @returns {Phaser.Types.Animations.AnimationFrame[]} The resulting collection.
   */
  static createFrames(scene, animation) {
    const frames = scene.anims.generateFrameNumbers(animation.textureKey, {
      start: animation.startFrame,
      end: animation.endFrame,
    }).map((frame, index) => ({
      ...frame,
      duration: animation.frameDurations?.[index] ?? 0,
    }));
    return animation.reverseFrames ? frames.reverse() : frames;
  }
}
