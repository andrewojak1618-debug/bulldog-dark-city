import { LoadingOverlay } from "../../ui/loading-overlay.class.js";
import { MENU_START_TRANSITION } from
  "../../../js/config/menu-transition-settings.js";

/**
 * Manages intro video lifecycle controller behavior.
 */
export class IntroVideoLifecycleController {
  /**
   * Creates a new instance.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.GameObjects.Video} video - The video value.
   * @param {{onActive: (isFirstFrame: boolean) => void, onInactive: () => void, onFinish: () => void}} callbacks - The callbacks value.
   */
  constructor(scene, video, callbacks) {
    this.scene = scene;
    this.video = video;
    this.callbacks = callbacks;
    this.isStarted = false;
    this.isFrameReady = false;
    this.isPlaybackActive = false;
    this.isFinished = false;
  }

  /**
   * Starts the current state.
   */
  start() {
    if (this.isStarted || this.isFinished) return;
    this.isStarted = true;
    LoadingOverlay.show(MENU_START_TRANSITION.video.loadingText);
    this.bindEvents();
    this.startStartupWatchdog();
    try {
      this.video.play(false);
    } catch {
      this.failSafely();
    }
  }

  /**
   * Binds events.
   */
  bindEvents() {
    this.handlers = this.createHandlers();
    this.bindPlaybackEvents();
    this.bindCompletionEvents();
  }

  /**
   * Creates handlers.
   */
  createHandlers() {
    return {
      created: () => this.handleFirstFrame(),
      playing: () => this.handlePlaying(),
      stalled: () => this.handleStalled(),
      locked: () => this.handleLocked(),
      complete: () => this.finish(),
      failure: () => this.failSafely(),
    };
  }

  /**
   * Binds playback events.
   */
  bindPlaybackEvents() {
    this.video.once("created", this.handlers.created);
    this.video.on("playing", this.handlers.playing);
    this.video.on("stalled", this.handlers.stalled);
    this.video.on("locked", this.handlers.locked);
  }

  /**
   * Binds completion events.
   */
  bindCompletionEvents() {
    this.video.once("complete", this.handlers.complete);
    this.video.once("error", this.handlers.failure);
    this.video.once("unsupported", this.handlers.failure);
  }

  /**
   * Handles first frame.
   */
  handleFirstFrame() {
    if (this.isFinished || this.isFrameReady) return;
    this.isFrameReady = true;
    this.clearWatchdogs();
    this.activatePlayback(true);
  }

  /**
   * Handles playing.
   */
  handlePlaying() {
    if (this.isFinished || !this.isFrameReady || this.isPlaybackActive) return;
    this.clearWatchdogs();
    this.activatePlayback(false);
  }

  /**
   * Handles activate playback.
   */
  activatePlayback(isFirstFrame) {
    this.isPlaybackActive = true;
    LoadingOverlay.hide();
    this.callbacks.onActive(isFirstFrame);
  }

  /**
   * Handles stalled.
   */
  handleStalled() {
    if (this.isFinished) return;
    this.deactivatePlayback();
    LoadingOverlay.show(MENU_START_TRANSITION.video.stalledText);
    this.startStalledWatchdog();
  }

  /**
   * Handles locked.
   */
  handleLocked() {
    if (this.isFinished) return;
    this.deactivatePlayback();
    LoadingOverlay.show(MENU_START_TRANSITION.video.lockedText);
    this.startStalledWatchdog();
  }

  /**
   * Handles deactivate playback.
   */
  deactivatePlayback() {
    this.isPlaybackActive = false;
    this.callbacks.onInactive();
  }

  /**
   * Starts startup watchdog.
   */
  startStartupWatchdog() {
    this.startupTimer = this.scene.time.delayedCall(
      MENU_START_TRANSITION.video.startTimeout,
      () => this.failSafely(),
    );
  }

  /**
   * Starts stalled watchdog.
   */
  startStalledWatchdog() {
    this.stalledTimer?.remove(false);
    this.stalledTimer = this.scene.time.delayedCall(
      MENU_START_TRANSITION.video.stalledTimeout,
      () => this.failSafely(),
    );
  }

  /**
   * Handles fail safely.
   */
  failSafely() {
    if (this.isFinished) return;
    this.stopVideo();
    this.finish();
  }

  /**
   * Completes the current state.
   */
  finish() {
    if (this.isFinished) return;
    this.isFinished = true;
    this.isPlaybackActive = false;
    this.clearWatchdogs();
    this.unbindEvents();
    LoadingOverlay.hide();
    this.callbacks.onFinish();
  }

  /**
   * Releases the current state.
   */
  destroy() {
    this.isFinished = true;
    this.isPlaybackActive = false;
    this.clearWatchdogs();
    this.unbindEvents();
    this.stopVideo();
    LoadingOverlay.hide();
  }

  /**
   * Stops video.
   */
  stopVideo() {
    if (this.hasStopped) return;
    this.hasStopped = true;
    try {
      this.video.stop(false);
    } catch {
      // Aufräumen und Szenenwechsel funktionieren auch ohne Videoelement.
    }
  }

  /**
   * Clears watchdogs.
   */
  clearWatchdogs() {
    this.startupTimer?.remove(false);
    this.stalledTimer?.remove(false);
    this.startupTimer = null;
    this.stalledTimer = null;
  }

  /**
   * Handles unbind events.
   */
  unbindEvents() {
    if (!this.handlers) return;
    this.video.off("created", this.handlers.created);
    this.video.off("playing", this.handlers.playing);
    this.video.off("stalled", this.handlers.stalled);
    this.video.off("locked", this.handlers.locked);
    this.video.off("complete", this.handlers.complete);
    this.video.off("error", this.handlers.failure);
    this.video.off("unsupported", this.handlers.failure);
    this.handlers = null;
  }

  /**
   * Checks the active condition.
   * @returns {boolean} Whether the requested condition is met.
   */
  isActive() {
    return this.isPlaybackActive && !this.isFinished;
  }
}
