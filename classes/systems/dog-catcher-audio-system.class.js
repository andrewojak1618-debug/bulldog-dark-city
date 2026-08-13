import { DOG_CATCHER_AUDIO } from
  "../../js/config/dog-catcher-audio-settings.js";

/**
 * Manages dog catcher audio system behavior.
 */
export class DogCatcherAudioSystem {
  /**
   * Loads the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static load(scene) {
    Object.values(DOG_CATCHER_AUDIO).forEach((audio) => {
      if (scene.cache.audio.exists(audio.key)) return;
      scene.load.audio(audio.key, audio.path);
    });
  }

  /**
   * Plays alert.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static playAlert(scene) {
    const audio = DOG_CATCHER_AUDIO.alert;
    scene.sound.play(audio.key, { volume: audio.volume });
  }
}
