import { ROBOT_CAT_AUDIO } from
  "../../js/config/robot-cat-audio-settings.js";

/** Lädt und spielt die kurzen Soundeffekte der Roboterkatze. */
export class RobotCatAudioSystem {
  /**
   * Lädt alle Roboterkatzen-Sounds genau einmal in den Phaser-Audiocache.
   * @param {Phaser.Scene} scene - Zugehörige Level-3-Szene.
   * @returns {void}
   */
  static load(scene) {
    Object.values(ROBOT_CAT_AUDIO).forEach((audio) => {
      if (scene.cache.audio.exists(audio.key)) return;
      scene.load.audio(audio.key, audio.path);
    });
  }

  /**
   * Spielt den Schnittsound synchron zum Abschuss des Klauenprojektils.
   * @param {Phaser.Scene} scene - Aktive Level-3-Szene.
   * @returns {void}
   */
  static playClawAttack(scene) {
    const audio = ROBOT_CAT_AUDIO.clawAttack;
    scene.sound.play(audio.key, { volume: audio.volume });
  }

  /**
   * Startet den einmaligen Schub-Sound für eine vollständige Flugsequenz.
   * @param {Phaser.GameObjects.Sprite} robotCat - Fliegende Roboterkatze.
   * @returns {void}
   */
  static playThrustFlight(robotCat) {
    this.stopThrustFlight(robotCat);
    const sound = this.createThrustSound(robotCat);
    robotCat.setData("thrustFlightSound", sound);
    robotCat.setData("thrustFlightFadeTween", null);
    this.bindThrustCompletion(robotCat, sound);
    sound.play();
  }

  /**
   * Erstellt eine eigene Soundinstanz für die aktuelle Flugsequenz.
   * @param {Phaser.GameObjects.Sprite} robotCat - Fliegende Roboterkatze.
   * @returns {Phaser.Sound.BaseSound} Erstellter Schub-Sound.
   */
  static createThrustSound(robotCat) {
    const audio = ROBOT_CAT_AUDIO.thrustFlight;
    return robotCat.scene.sound.add(audio.key, { volume: audio.volume });
  }

  /**
   * Räumt den Schub-Sound nach seinem natürlichen Ende sicher auf.
   * @param {Phaser.GameObjects.Sprite} robotCat - Fliegende Roboterkatze.
   * @param {Phaser.Sound.BaseSound} sound - Aktive Soundinstanz.
   * @returns {void}
   */
  static bindThrustCompletion(robotCat, sound) {
    sound.once("complete", () => {
      if (robotCat.getData("thrustFlightSound") !== sound) return;
      robotCat.getData("thrustFlightFadeTween")?.stop();
      robotCat.setData("thrustFlightFadeTween", null);
      robotCat.setData("thrustFlightSound", null);
      sound.destroy();
    });
  }

  /**
   * Stoppt einen noch aktiven Flug-Sound ohne verwaiste Audioinstanz.
   * @param {Phaser.GameObjects.Sprite} robotCat - Roboterkatze mit Audiostatus.
   * @returns {void}
   */
  static stopThrustFlight(robotCat) {
    const fadeTween = robotCat?.getData("thrustFlightFadeTween");
    fadeTween?.stop();
    robotCat?.setData("thrustFlightFadeTween", null);
    const sound = robotCat?.getData("thrustFlightSound");
    if (!sound) return;
    robotCat.setData("thrustFlightSound", null);
    sound.stop();
    sound.destroy();
  }

  /**
   * Blendet den Schub kurz vor Bodenkontakt genau einmal weich aus.
   * @param {Phaser.GameObjects.Sprite} robotCat - Landende Roboterkatze.
   * @param {number} duration - Dauer bis zum erwarteten Bodenkontakt.
   * @returns {void}
   */
  static fadeOutThrustFlight(robotCat, duration) {
    const sound = robotCat?.getData("thrustFlightSound");
    if (!sound || robotCat.getData("thrustFlightFadeTween")) return;
    const fadeTween = robotCat.scene.tweens.add({
      targets: sound,
      volume: 0,
      duration,
      onComplete: () => {
        robotCat.setData("thrustFlightFadeTween", null);
        this.stopThrustFlight(robotCat);
      },
    });
    robotCat.setData("thrustFlightFadeTween", fadeTween);
  }
}
