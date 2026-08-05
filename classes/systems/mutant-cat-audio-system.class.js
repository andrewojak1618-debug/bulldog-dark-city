import { MUTANT_CAT_AUDIO } from
  "../../js/config/mutant-cat-audio-settings.js";

/** Lädt und spielt die kurzen Soundeffekte der mutierten Katze. */
export class MutantCatAudioSystem {
  /**
   * Lädt alle Katzensounds genau einmal in den Phaser-Audiocache.
   * @param {Phaser.Scene} scene - Zugehörige Level-2-Szene.
   * @returns {void}
   */
  static load(scene) {
    Object.values(MUTANT_CAT_AUDIO).forEach((audio) => {
      if (scene.cache.audio.exists(audio.key)) return;
      scene.load.audio(audio.key, audio.path);
    });
  }

  /**
   * Spielt den einmaligen Laut beim Entdecken der Bulldogge.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @returns {void}
   */
  static playAttentive(scene) {
    const audio = MUTANT_CAT_AUDIO.attentive;
    scene.sound.play(audio.key, { volume: audio.volume });
  }
}
