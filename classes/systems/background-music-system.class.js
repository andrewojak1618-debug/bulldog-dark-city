import { AssetLoaderSystem } from "./asset-loader-system.class.js";

/**
 * Manages background music system behavior.
 */
export class BackgroundMusicSystem {
  /**
   * Creates a new instance.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   */
  constructor(scene) {
    this.scene = scene;
    this.music = null;
    scene.events.once("shutdown", () => this.stop());
  }

  /**
   * Loads the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {{key: string, path: string}} track - The track value.
   * @returns {void} No value is returned.
   */
  static load(scene, track) {
    AssetLoaderSystem.loadAudio(scene, track);
  }

  /**
   * Plays the current state.
   * @param {{key: string, volume: number, loop: boolean, fadeInMs: number}} track - The track value.
   * @returns {void} No value is returned.
   */
  play(track) {
    if (this.music?.isPlaying && this.music.key === track.key) return;
    this.stop();
    this.music = this.scene.sound.add(track.key, {
      loop: track.loop,
      volume: 0,
    });
    this.music.play();
    this.scene.tweens.add({
      targets: this.music,
      volume: track.volume,
      duration: track.fadeInMs,
      ease: "Sine.easeOut",
    });
  }

  /**
   * Fades out and stop.
   * @param {number} duration - The duration in milliseconds.
   * @returns {void} No value is returned.
   */
  fadeOutAndStop(duration) {
    if (!this.music?.isPlaying) return;
    this.scene.tweens.killTweensOf(this.music);
    this.scene.tweens.add({
      targets: this.music,
      volume: 0,
      duration,
      ease: "Sine.easeIn",
      onComplete: () => this.stop(),
    });
  }

  /**
   * Stops the current state.
   * @returns {void} No value is returned.
   */
  stop() {
    if (!this.music) return;
    this.scene.tweens.killTweensOf(this.music);
    this.music.stop();
    this.music.destroy();
    this.music = null;
  }
}
