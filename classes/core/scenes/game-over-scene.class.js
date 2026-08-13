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
 * Manages game over scene behavior.
 */
export class GameOverScene extends Phaser.Scene {
  /**
   * Creates a new instance.
   */
  constructor() {
    super(SCENES.gameOver);
  }

  /**
   * Preloads the current state.
   * @returns {void} No value is returned.
   */
  preload() {
    const { video } = GAME_OVER;
    this.load.video(video.key, video.url, video.noAudio);
  }

  /**
   * Creates the current state.
   * @returns {void} No value is returned.
   */
  create() {
    setMuteButtonVisibility(false);
    this.initializeVideoState();
    this.createVideo();
    this.bindVideoEvents();
    this.events.once("shutdown", () => this.cleanup());
    EndingVideoSystem.start(this);
  }

  /**
   * Initializes the video lifecycle state.
   * @returns {void} No value is returned.
   */
  initializeVideoState() {
    this.isFinished = false;
    this.isFallbackVisible = false;
    this.isVideoSized = false;
  }

  /**
   * Creates the game-over video object.
   * @returns {void} No value is returned.
   */
  createVideo() {
    const { width, height } = this.scale;
    const { video } = GAME_OVER;
    this.video = this.add
      .video(width / 2, height / 2, video.key)
      .setAlpha(0)
      .setMute(globalMuteSystem.isMuted())
      .setVolume(video.volume);
    this.unregisterVideoMute = globalMuteSystem.registerVideo(this.video);
  }

  /**
   * Binds the game-over video lifecycle events.
   * @returns {void} No value is returned.
   */
  bindVideoEvents() {
    this.video.once("created", () => EndingVideoSystem.sizeAndReveal(this));
    this.video.once("playing", () => EndingVideoSystem.sizeAndReveal(this));
    this.video.once("complete", () => this.finish());
    this.video.once("error", () => this.showFallback());
  }

  /**
   * Completes the current state.
   * @returns {void} No value is returned.
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
   * Shows fallback.
   * @returns {void} No value is returned.
   */
  showFallback() {
    if (this.isFinished || this.isFallbackVisible) return;
    const { fallback } = GAME_OVER;
    this.isFallbackVisible = true;
    this.cleanup();
    this.cameras.main.setBackgroundColor("#050309");
    this.createFallbackText(fallback);
    this.fallbackTimer = this.time.delayedCall(
      fallback.returnDelayMs,
      () => this.finish(),
    );
  }

  /**
   * Creates the fallback message.
   * @param {object} fallback - The fallback display settings.
   * @returns {void} No value is returned.
   */
  createFallbackText(fallback) {
    const { width, height } = this.scale;
    this.add.text(width / 2, height / 2, fallback.text, {
      fontFamily: fallback.fontFamily,
      fontSize: `${fallback.fontSize}px`,
      color: fallback.color,
    }).setOrigin(0.5);
  }

  /**
   * Handles cleanup.
   * @returns {void} No value is returned.
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
