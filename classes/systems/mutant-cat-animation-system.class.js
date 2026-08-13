import {
  MUTANT_CAT,
  MUTANT_CAT_ANIMATION_KEY,
  MUTANT_CAT_ATTENTIVE_ANIMATION_KEY,
  MUTANT_CAT_ATTENTIVE_TEXTURE,
  MUTANT_CAT_ATTACK_ANIMATION_KEY,
  MUTANT_CAT_ATTACK_TEXTURE,
  MUTANT_CAT_DEAD_ANIMATION_KEY,
  MUTANT_CAT_DEAD_TEXTURE,
  MUTANT_CAT_TEXTURE,
} from "../../js/config/mutant-cat-settings.js";

const STANDARD_ANIMATIONS = Object.freeze([
  Object.freeze({
    key: MUTANT_CAT_ANIMATION_KEY,
    texture: MUTANT_CAT_TEXTURE,
    frameRate: MUTANT_CAT.frameRate,
    repeat: -1,
  }),
  Object.freeze({
    key: MUTANT_CAT_ATTENTIVE_ANIMATION_KEY,
    texture: MUTANT_CAT_ATTENTIVE_TEXTURE,
    frameRate: MUTANT_CAT.attentiveFrameRate,
    repeat: 0,
  }),
  Object.freeze({
    key: MUTANT_CAT_DEAD_ANIMATION_KEY,
    texture: MUTANT_CAT_DEAD_TEXTURE,
    frameRate: MUTANT_CAT.deadFrameRate,
    repeat: 0,
  }),
]);

/**
 * Manages mutant cat animation system behavior.
 */
export class MutantCatAnimationSystem {
  /**
   * Registers the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static register(scene) {
    STANDARD_ANIMATIONS.forEach((animation) =>
      this.registerAnimation(scene, animation),
    );
    this.registerAttackAnimation(scene);
  }

  /**
   * Registers animation.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {{key: string, texture: object, frameRate: number, repeat: number}} animation - The animation configuration to use.
   * @returns {void} No value is returned.
   */
  static registerAnimation(scene, animation) {
    if (scene.anims.exists(animation.key)) return;
    scene.anims.create({
      key: animation.key,
      frames: scene.anims.generateFrameNumbers(animation.texture.key, {
        start: 0,
        end: animation.texture.frameCount - 1,
      }),
      frameRate: animation.frameRate,
      repeat: animation.repeat,
    });
  }

  /**
   * Registers attack animation.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static registerAttackAnimation(scene) {
    if (scene.anims.exists(MUTANT_CAT_ATTACK_ANIMATION_KEY)) return;
    const frames = this.createAttackFrames();
    scene.anims.create({
      key: MUTANT_CAT_ATTACK_ANIMATION_KEY,
      frames,
      frameRate: MUTANT_CAT.attackFrameRate,
      repeat: 0,
      skipMissedFrames: false,
    });
  }

  /**
   * Creates attack frames.
   * @returns {Phaser.Types.Animations.AnimationFrame[]} The resulting collection.
   */
  static createAttackFrames() {
    const standardFrameDurationMs = 1000 / MUTANT_CAT.attackFrameRate;
    return Array.from(
      { length: MUTANT_CAT_ATTACK_TEXTURE.frameCount },
      (_, frame) => ({
        key: MUTANT_CAT_ATTACK_TEXTURE.key,
        frame,
        duration:
          frame >= MUTANT_CAT.attackSlowFromFrame
            ? standardFrameDurationMs *
              (MUTANT_CAT.attackSlowDurationMultiplier - 1)
            : 0,
      }),
    );
  }
}
