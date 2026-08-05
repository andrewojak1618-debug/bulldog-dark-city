import { DOG_CATCHER_AUDIO } from
  "../../js/config/dog-catcher-audio-settings.js";

/** Lädt und spielt die kurzen Soundeffekte des Hundefängers. */
export class DogCatcherAudioSystem {
  /**
   * Lädt alle Hundefängersounds genau einmal in den Phaser-Audiocache.
   * @param {Phaser.Scene} scene - Zugehörige Spielszene.
   * @returns {void}
   */
  static load(scene) {
    Object.values(DOG_CATCHER_AUDIO).forEach((audio) => {
      if (scene.cache.audio.exists(audio.key)) return;
      scene.load.audio(audio.key, audio.path);
    });
  }

  /**
   * Spielt den einmaligen Ruf beim Entdecken der Bulldogge.
   * @param {Phaser.Scene} scene - Aktive Spielszene.
   * @returns {void}
   */
  static playAlert(scene) {
    const audio = DOG_CATCHER_AUDIO.alert;
    scene.sound.play(audio.key, { volume: audio.volume });
  }
}
