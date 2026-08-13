import { ROBOT_CAT_AUDIO } from
  "../../js/config/robot-cat-audio-settings.js";

/**
 * Manages robot cat audio system behavior.
 */
export class RobotCatAudioSystem {
  /**
   * Loads the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static load(scene) {
    Object.values(ROBOT_CAT_AUDIO).forEach((audio) => {
      if (scene.cache.audio.exists(audio.key)) return;
      scene.load.audio(audio.key, audio.path);
    });
  }

  /**
   * Plays claw attack.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static playClawAttack(scene) {
    const audio = ROBOT_CAT_AUDIO.clawAttack;
    scene.sound.play(audio.key, { volume: audio.volume });
  }

  /**
   * Plays thrust flight.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @returns {void} No value is returned.
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
   * Creates thrust sound.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @returns {Phaser.Sound.BaseSound} The created instance.
   */
  static createThrustSound(robotCat) {
    const audio = ROBOT_CAT_AUDIO.thrustFlight;
    return robotCat.scene.sound.add(audio.key, { volume: audio.volume });
  }

  /**
   * Binds thrust completion.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @param {Phaser.Sound.BaseSound} sound - The sound value.
   * @returns {void} No value is returned.
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
   * Stops thrust flight.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @returns {void} No value is returned.
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
   * Fades out thrust flight.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @param {number} duration - The duration in milliseconds.
   * @returns {void} No value is returned.
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
