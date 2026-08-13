import { DOG_CATCHER_ANIMATIONS } from
  "../../js/config/dog-catcher-settings.js";

/**
 * Manages dog catcher animation system behavior.
 */
export class DogCatcherAnimationSystem {
  /**
   * Registers the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static register(scene) {
    DOG_CATCHER_ANIMATIONS.forEach((animation) => {
      if (scene.anims.exists(animation.key)) return;
      scene.anims.create({
        key: animation.key,
        frames: this.createFrames(scene, animation),
        frameRate: animation.frameRate,
        repeat: animation.repeat,
      });
    });
  }

  /**
   * Creates frames.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {{textureKey: string, endFrame: number, frameOrder?: ReadonlyArray<number>}} animation - The animation configuration to use.
   * @returns {Array<Phaser.Types.Animations.AnimationFrame>} The resulting collection.
   */
  static createFrames(scene, animation) {
    if (animation.frameOrder) {
      return animation.frameOrder.map((frame) => ({
        key: animation.textureKey,
        frame,
      }));
    }

    return scene.anims.generateFrameNumbers(animation.textureKey, {
      start: 0,
      end: animation.endFrame,
    });
  }
}
