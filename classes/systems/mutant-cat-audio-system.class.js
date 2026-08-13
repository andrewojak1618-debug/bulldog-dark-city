import { MUTANT_CAT_AUDIO } from
  "../../js/config/mutant-cat-audio-settings.js";

/**
 * Manages mutant cat audio system behavior.
 */
export class MutantCatAudioSystem {
  /**
   * Loads the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static load(scene) {
    Object.values(MUTANT_CAT_AUDIO).forEach((audio) => {
      if (scene.cache.audio.exists(audio.key)) return;
      scene.load.audio(audio.key, audio.path);
    });
  }

  /**
   * Plays attentive.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static playAttentive(scene) {
    const audio = MUTANT_CAT_AUDIO.attentive;
    scene.sound.play(audio.key, { volume: audio.volume });
  }
}
