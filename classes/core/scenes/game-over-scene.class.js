import Phaser from "phaser";
import { globalMuteSystem } from
  "../../systems/global-mute-system.class.js";
import { setMuteButtonVisibility } from
  "../controllers/mute-button-controller.class.js";
import { SCENES } from "../../../js/config/game-settings.js";
import { GAME_OVER } from "../../../js/config/game-over-settings.js";

/**
 * Spielt nach der K.-o.-Animation die Game-over-Sequenz ab.
 */
export class GameOverScene extends Phaser.Scene {
  /**
   * Erstellt die Game-Over-Szene mit ihrem eindeutigen Szenenschlüssel.
   */
  constructor() {
    super(SCENES.gameOver);
  }

  /**
   * Lädt das weboptimierte Game-over-Video mit Ton.
   * @returns {void}
   */
  preload() {
    const { video } = GAME_OVER;
    this.load.video(video.key, video.url, video.noAudio);
  }

  /**
   * Erstellt und startet das Video in der vollständigen Canvasgröße.
   * @returns {void}
   */
  create() {
    setMuteButtonVisibility(false);
    const { width, height } = this.scale;
    const { video } = GAME_OVER;
    this.video = this.add
      .video(width / 2, height / 2, video.key)
      .setAlpha(0)
      .setMute(globalMuteSystem.isMuted())
      .setVolume(video.volume);
    this.unregisterVideoMute = globalMuteSystem.registerVideo(this.video);
    this.isVideoSized = false;
    this.video.once("created", () => this.sizeAndRevealVideo());
    this.video.once("playing", () => this.sizeAndRevealVideo());
    this.video.once("complete", () => this.returnToMenu());
    this.video.once("error", () => this.showFallback());
    this.events.once("shutdown", () => this.cleanup());
    this.video.play(false);
  }

  /**
   * Kehrt nach dem letzten Videoframe zum Hauptmenü zurück.
   * @returns {void}
   */
  returnToMenu() {
    this.cleanup();
    this.scene.start(SCENES.menu);
  }

  /**
   * Skaliert erst den verfügbaren Videoframe exakt auf die Canvasgröße.
   * @returns {void}
   */
  sizeAndRevealVideo() {
    if (this.isVideoSized) return;
    const { width, height } = this.scale;
    this.isVideoSized = true;
    this.video.setDisplaySize(width, height).setAlpha(1);
  }

  /**
   * Zeigt bei einem Wiedergabefehler einen lesbaren Ersatzbildschirm.
   * @returns {void}
   */
  showFallback() {
    const { width, height } = this.scale;
    const { fallback } = GAME_OVER;
    this.cleanup();
    this.cameras.main.setBackgroundColor("#050309");
    this.add
      .text(width / 2, height / 2, fallback.text, {
        fontFamily: fallback.fontFamily,
        fontSize: `${fallback.fontSize}px`,
        color: fallback.color,
      })
      .setOrigin(0.5);
  }

  /**
   * Meldet das Video ab und gibt die Phaser-Instanz sicher frei.
   * @returns {void}
   */
  cleanup() {
    this.unregisterVideoMute?.();
    this.unregisterVideoMute = null;
    if (this.video) {
      this.video.stop();
      this.video.destroy();
      this.video = null;
    }
  }
}
