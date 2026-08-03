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

/** Registriert die Laufanimation der mutierten Katze. */
export class MutantCatAnimationSystem {
  /**
   * Erstellt die Animation höchstens einmal im globalen Phaser-Manager.
   * @param {Phaser.Scene} scene - Szene mit geladener Katzentextur.
   * @returns {void}
   */
  static register(scene) {
    this.registerAnimation(
      scene,
      MUTANT_CAT_ANIMATION_KEY,
      MUTANT_CAT_TEXTURE,
      MUTANT_CAT.frameRate,
      -1,
    );
    this.registerAnimation(
      scene,
      MUTANT_CAT_ATTENTIVE_ANIMATION_KEY,
      MUTANT_CAT_ATTENTIVE_TEXTURE,
      MUTANT_CAT.attentiveFrameRate,
      0,
    );
    this.registerAttackAnimation(scene);
    this.registerAnimation(
      scene,
      MUTANT_CAT_DEAD_ANIMATION_KEY,
      MUTANT_CAT_DEAD_TEXTURE,
      MUTANT_CAT.deadFrameRate,
      0,
    );
  }

  /**
   * Registriert eine konfigurierte Katzenanimation genau einmal.
   * @param {Phaser.Scene} scene - Szene mit globalem Animationsmanager.
   * @param {string} key - Eindeutiger Animationsschlüssel.
   * @param {object} texture - Quelldaten des Spritesheets.
   * @param {number} frameRate - Abspielgeschwindigkeit.
   * @param {number} repeat - Anzahl der Wiederholungen.
   * @returns {void}
   */
  static registerAnimation(scene, key, texture, frameRate, repeat) {
    if (scene.anims.exists(key)) return;
    scene.anims.create({
      key,
      frames: scene.anims.generateFrameNumbers(texture.key, {
        start: 0,
        end: texture.frameCount - 1,
      }),
      frameRate,
      repeat,
    });
  }

  /**
   * Registriert den Angriff mit einem doppelt so schnellen Abschlussframe.
   * @param {Phaser.Scene} scene - Szene mit globalem Animationsmanager.
   * @returns {void}
   */
  static registerAttackAnimation(scene) {
    if (scene.anims.exists(MUTANT_CAT_ATTACK_ANIMATION_KEY)) return;
    const speedMultiplier = MUTANT_CAT.attackLastFrameSpeedMultiplier;
    const acceleratedFrameRate = MUTANT_CAT.attackFrameRate * speedMultiplier;
    const frames = this.createAttackFrames(acceleratedFrameRate);
    scene.anims.create({
      key: MUTANT_CAT_ATTACK_ANIMATION_KEY,
      frames,
      frameRate: acceleratedFrameRate,
      repeat: 0,
    });
  }

  /**
   * Erstellt die Framefolge mit einem kürzeren sichtbaren Abschlussframe.
   * @param {number} acceleratedFrameRate - Beschleunigte Gesamtbildrate.
   * @returns {Phaser.Types.Animations.AnimationFrame[]} Angriffsframes.
   */
  static createAttackFrames(acceleratedFrameRate) {
    const standardFrameDurationMs = 1000 / MUTANT_CAT.attackFrameRate;
    const acceleratedFrameDurationMs = 1000 / acceleratedFrameRate;
    const additionalStandardHoldMs = standardFrameDurationMs -
      acceleratedFrameDurationMs;
    const lastFrame = MUTANT_CAT_ATTACK_TEXTURE.frameCount - 1;
    return Array.from(
      { length: MUTANT_CAT_ATTACK_TEXTURE.frameCount },
      (_, frame) => ({
        key: MUTANT_CAT_ATTACK_TEXTURE.key,
        frame,
        duration: frame === lastFrame ? 0 : additionalStandardHoldMs,
      }),
    );
  }
}
