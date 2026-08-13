import Phaser from "phaser";
import { IntroSkipHint } from "../../ui/intro-skip-hint.class.js";
import { InputDeviceDetector } from
  "../../input/input-device-detector.class.js";
import { globalMuteSystem } from
  "../../systems/global-mute-system.class.js";
import { EndingVideoSystem } from
  "../../systems/ending-video-system.class.js";
import { setMuteButtonVisibility } from
  "../controllers/mute-button-controller.class.js";
import { ENDING } from "../../../js/config/ending-settings.js";
import { SCENES } from "../../../js/config/game-settings.js";
import { ENDSCREEN_RESULT } from
  "../../../js/config/game-endscreen-settings.js";

/**
 * Manages victory scene behavior.
 */
export class VictoryScene extends Phaser.Scene {
  /**
   * Creates a new instance.
   */
  constructor() {
    super(SCENES.victory);
  }

  /**
   * Preloads the current state.
   * @returns {void} No value is returned.
   */
  preload() {
    const { video } = ENDING;
    this.load.video(video.key, video.url, video.noAudio);
  }

  /**
   * Creates the current state.
   * @returns {void} No value is returned.
   */
  create() {
    setMuteButtonVisibility(false);
    this.cameras.main.setBackgroundColor("#000000");
    this.initializeVideoState();
    this.createVideo();
    this.bindVideoEvents();
    this.scheduleSkip();
    this.events.once("shutdown", () => this.cleanup());
    EndingVideoSystem.start(this);
  }

  /**
   * Initializes the video lifecycle state.
   * @returns {void} No value is returned.
   */
  initializeVideoState() {
    this.isFinished = false;
    this.isSkipping = false;
    this.isFallbackVisible = false;
    this.isVideoSized = false;
  }

  /**
   * Creates the victory video object.
   * @returns {void} No value is returned.
   */
  createVideo() {
    const { width, height } = this.scale;
    const { video, depths } = ENDING;
    this.video = this.add.video(width / 2, height / 2, video.key)
      .setDepth(depths.video)
      .setAlpha(0)
      .setMute(globalMuteSystem.isMuted())
      .setVolume(video.volume);
    this.unregisterVideoMute = globalMuteSystem.registerVideo(this.video);
  }

  /**
   * Binds the victory video lifecycle events.
   * @returns {void} No value is returned.
   */
  bindVideoEvents() {
    this.video.once("created", () => EndingVideoSystem.sizeAndReveal(this));
    this.video.once("playing", () => EndingVideoSystem.sizeAndReveal(this));
    this.video.once("complete", () => this.finish());
    this.video.once("error", () => this.showFallback());
  }

  /**
   * Handles schedule skip.
   * @returns {void} No value is returned.
   */
  scheduleSkip() {
    this.skipTimer = this.time.delayedCall(
      ENDING.skip.activationDelay,
      () => this.enableSkip(),
    );
  }

  /**
   * Enables skip.
   * @returns {void} No value is returned.
   */
  enableSkip() {
    if (this.isFinished) return;
    this.createSkipHint();
    this.bindKeyboardSkip();
    this.bindTouchSkip();
  }

  /**
   * Creates the skip hint for the active input layout.
   * @returns {void} No value is returned.
   */
  createSkipHint() {
    const { width, height } = this.scale;
    const { skip, depths } = ENDING;
    const hintStyle = this.getSkipHintStyle(skip);
    this.skipHint = new IntroSkipHint(
      this,
      width / 2,
      height - skip.hintOffsetY,
      hintStyle,
    ).setDepth(depths.skipHint).setAlpha(skip.hintAlpha);
  }

  /**
   * Returns skip hint settings for the active input layout.
   * @param {object} skip - The base skip settings.
   * @returns {object} The active skip hint settings.
   */
  getSkipHintStyle(skip) {
    if (!InputDeviceDetector.isTouchLayout()) return skip;
    return { ...skip, hint: skip.touchHint,
      actionHint: skip.touchActionHint };
  }

  /**
   * Binds keyboard video skipping.
   * @returns {void} No value is returned.
   */
  bindKeyboardSkip() {
    const keyboard = this.input.keyboard;
    if (!keyboard) return;
    this.skipHandler = (event) => this.handleSkip(event);
    keyboard.on("keydown-SPACE", this.skipHandler);
  }

  /**
   * Binds touch video skipping.
   * @returns {void} No value is returned.
   */
  bindTouchSkip() {
    if (!InputDeviceDetector.isTouchLayout()) return;
    this.touchSkipHandler = () => this.startSkip();
    this.input.on("pointerdown", this.touchSkipHandler);
  }

  /**
   * Handles skip.
   * @param {KeyboardEvent} event - The triggering event.
   * @returns {void} No value is returned.
   */
  handleSkip(event) {
    if (event.repeat) return;
    event.preventDefault();
    this.startSkip();
  }

  /**
   * Starts skip.
   * @returns {void} No value is returned.
   */
  startSkip() {
    if (this.isSkipping || this.isFinished) return;
    this.isSkipping = true;
    this.disableSkip();
    const initialVolume = this.video?.getVolume() ?? 0;
    this.tweens.add({
      targets: this.video,
      alpha: 0,
      duration: ENDING.skip.fadeDuration,
      ease: ENDING.skip.fadeEase,
      onUpdate: (tween) =>
        this.video?.setVolume(initialVolume * (1 - tween.progress)),
      onComplete: () => this.finish(),
    });
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
      result: ENDSCREEN_RESULT.victory,
    });
  }

  /**
   * Shows fallback.
   * @returns {void} No value is returned.
   */
  showFallback() {
    if (this.isFinished || this.isFallbackVisible) return;
    const { width, height } = this.scale;
    const { fallback } = ENDING;
    this.isFallbackVisible = true;
    this.cleanup();
    this.add.text(width / 2, height / 2, fallback.text, {
      fontFamily: fallback.fontFamily,
      fontSize: `${fallback.fontSize}px`,
      color: fallback.color,
    }).setOrigin(0.5);
    this.time.delayedCall(fallback.returnDelayMs, () => this.finish());
  }

  /**
   * Handles cleanup.
   * @returns {void} No value is returned.
   */
  cleanup() {
    this.disableSkip();
    this.unregisterVideoMute?.();
    this.unregisterVideoMute = null;
    if (this.video) {
      this.tweens.killTweensOf(this.video);
      this.video.stop();
      this.video.destroy();
    }
    this.video = null;
  }

  /**
   * Handles disable skip.
   * @returns {void} No value is returned.
   */
  disableSkip() {
    this.skipTimer?.remove(false);
    this.skipTimer = null;
    if (this.skipHandler) {
      this.input.keyboard?.off("keydown-SPACE", this.skipHandler);
      this.skipHandler = null;
    }
    if (this.touchSkipHandler) {
      this.input.off("pointerdown", this.touchSkipHandler);
      this.touchSkipHandler = null;
    }
    this.skipHint?.destroy();
    this.skipHint = null;
  }
}
