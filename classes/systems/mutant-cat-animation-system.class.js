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

/** Registriert sämtliche Animationen der mutierten Katze. */
export class MutantCatAnimationSystem {
  /**
   * Erstellt die Animation höchstens einmal im globalen Phaser-Manager.
   * @param {Phaser.Scene} scene - Szene mit geladener Katzentextur.
   * @returns {void}
   */
  static register(scene) {
    STANDARD_ANIMATIONS.forEach((animation) =>
      this.registerAnimation(scene, animation),
    );
    this.registerAttackAnimation(scene);
  }

  /**
   * Registriert eine konfigurierte Katzenanimation genau einmal.
   * @param {Phaser.Scene} scene - Szene mit globalem Animationsmanager.
   * @param {{key: string, texture: object, frameRate: number, repeat: number}}
   * animation - Zentrale Animationskonfiguration.
   * @returns {void}
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
   * Registriert den Angriff mit individuell abgestimmten Framezeiten.
   * @param {Phaser.Scene} scene - Szene mit globalem Animationsmanager.
   * @returns {void}
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
   * Erstellt die Framefolge mit einer verlangsamten zweiten Angriffshälfte.
   * @returns {Phaser.Types.Animations.AnimationFrame[]} Angriffsframes.
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
