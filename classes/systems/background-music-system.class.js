import { AssetLoaderSystem } from "./asset-loader-system.class.js";

/**
 * Lädt, startet und beendet die Hintergrundmusik einer Spielszene.
 */
export class BackgroundMusicSystem {
  /**
   * Verknüpft die Musik mit dem Lebenszyklus der zugehörigen Szene.
   * @param {Phaser.Scene} scene - Aktive Spielszene.
   */
  constructor(scene) {
    this.scene = scene;
    this.music = null;
    scene.events.once("shutdown", () => this.stop());
  }

  /**
   * Lädt einen zentral konfigurierten Musiktitel.
   * @param {Phaser.Scene} scene - Szene mit Phaser-Loader.
   * @param {{key: string, path: string}} track - Zu ladender Titel.
   * @returns {void}
   */
  static load(scene, track) {
    AssetLoaderSystem.loadAudio(scene, track);
  }

  /**
   * Startet einen Titel einmalig und blendet ihn weich ein.
   * @param {{key: string, volume: number, loop: boolean,
   * fadeInMs: number}} track - Abspielwerte des Titels.
   * @returns {void}
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
   * Blendet den aktiven Titel aus und gibt die Audioinstanz frei.
   * @param {number} duration - Dauer der Ausblendung in Millisekunden.
   * @returns {void}
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
   * Beendet und entfernt den aktuell verwalteten Titel sofort.
   * @returns {void}
   */
  stop() {
    if (!this.music) return;
    this.scene.tweens.killTweensOf(this.music);
    this.music.stop();
    this.music.destroy();
    this.music = null;
  }
}
