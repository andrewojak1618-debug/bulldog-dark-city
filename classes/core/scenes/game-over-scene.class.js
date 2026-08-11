import Phaser from "phaser";
import { globalMuteSystem } from
  "../../systems/global-mute-system.class.js";
import { EndingVideoSystem } from
  "../../systems/ending-video-system.class.js";
import { setMuteButtonVisibility } from
  "../controllers/mute-button-controller.class.js";
import { SCENES } from "../../../js/config/game-settings.js";
import { GAME_OVER } from "../../../js/config/game-over-settings.js";
import { ENDSCREEN_RESULT } from
  "../../../js/config/game-endscreen-settings.js";

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
    this.isFinished = false;
    this.isFallbackVisible = false;
    this.isVideoSized = false;
    this.video.once("created", () => EndingVideoSystem.sizeAndReveal(this));
    this.video.once("playing", () => EndingVideoSystem.sizeAndReveal(this));
    this.video.once("complete", () => this.finish());
    this.video.once("error", () => this.showFallback());
    this.events.once("shutdown", () => this.cleanup());
    EndingVideoSystem.start(this);
  }

  /**
   * Beendet die Sequenz genau einmal und öffnet den gemeinsamen Endscreen.
   * @returns {void}
   */
  finish() {
    if (this.isFinished) return;
    this.isFinished = true;
    this.cleanup();
    this.sound.stopAll();
    this.scene.start(SCENES.endscreen, {
      result: ENDSCREEN_RESULT.gameOver,
    });
  }

  /**
   * Zeigt bei einem Wiedergabefehler einen lesbaren Ersatzbildschirm.
   * @returns {void}
   */
  showFallback() {
    if (this.isFinished || this.isFallbackVisible) return;
    const { width, height } = this.scale;
    const { fallback } = GAME_OVER;
    this.isFallbackVisible = true;
    this.cleanup();
    this.cameras.main.setBackgroundColor("#050309");
    this.add
      .text(width / 2, height / 2, fallback.text, {
        fontFamily: fallback.fontFamily,
        fontSize: `${fallback.fontSize}px`,
        color: fallback.color,
      })
      .setOrigin(0.5);
    this.fallbackTimer = this.time.delayedCall(
      fallback.returnDelayMs,
      () => this.finish(),
    );
  }

  /**
   * Meldet das Video ab und gibt die Phaser-Instanz sicher frei.
   * @returns {void}
   */
  cleanup() {
    this.fallbackTimer?.remove(false);
    this.fallbackTimer = null;
    this.unregisterVideoMute?.();
    this.unregisterVideoMute = null;
    if (this.video) {
      this.video.stop();
      this.video.destroy();
      this.video = null;
    }
  }
}
