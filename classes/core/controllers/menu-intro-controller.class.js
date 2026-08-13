import { IntroSkipHint } from "../../ui/intro-skip-hint.class.js";
import { InputDeviceDetector } from
  "../../input/input-device-detector.class.js";
import { globalMuteSystem } from
  "../../systems/global-mute-system.class.js";
import { setMuteButtonVisibility } from
  "./mute-button-controller.class.js";
import { setMenuSocialLinkVisibility } from
  "./menu-social-link-controller.js";
import { setMenuLegalNavigationVisibility } from
  "./menu-legal-navigation-controller.js";
import { IntroVideoLifecycleController } from
  "./intro-video-lifecycle-controller.class.js";
import { MENU_START_TRANSITION } from "../../../js/config/menu-transition-settings.js";

/**
 * Manages menu intro controller behavior.
 */
export class MenuIntroController {
  /**
   * Creates a new instance.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   */
  constructor(scene) {
    this.scene = scene;
  }

  /**
   * Plays the current state.
   * @param {Function} onComplete - The callback invoked after completion.
   * @returns {void} No value is returned.
   */
  play(onComplete) {
    if (this.isPlayingIntro) return;
    this.isPlayingIntro = true;
    this.finishIntro = this.createFinishHandler(onComplete);
    this.prepare();
    this.animateMenuExit();
    this.startVideoLifecycle();
  }

  /**
   * Handles prepare.
   */
  prepare() {
    if (!this.video) this.createVideo();
  }

  /**
   * Creates finish handler.
   * @param {Function} onComplete - The callback invoked after completion.
   * @returns {Function} The generated callback function.
   */
  createFinishHandler(onComplete) {
    let isFinished = false;
    return () => {
      if (isFinished) return;
      isFinished = true;
      this.isPlayingIntro = false;
      this.disableSkip();
      this.videoLifecycle?.destroy();
      this.videoLifecycle = null;
      this.unregisterVideoMute?.();
      this.unregisterVideoMute = null;
      onComplete();
    };
  }

  /**
   * Creates video.
   * @returns {void} No value is returned.
   */
  createVideo() {
    const { width, height } = this.scene.scale;
    this.video = this.scene.add
      .video(width / 2, height / 2, MENU_START_TRANSITION.video.key)
      .setDepth(MENU_START_TRANSITION.depths.video)
      .setAlpha(0)
      .setMute(globalMuteSystem.isMuted())
      .setVolume(MENU_START_TRANSITION.video.volume);
    this.unregisterVideoMute = globalMuteSystem.registerVideo(this.video);
    this.isVideoSized = false;
  }

  /**
   * Starts video lifecycle.
   */
  startVideoLifecycle() {
    this.videoLifecycle = new IntroVideoLifecycleController(
      this.scene,
      this.video,
      {
        onActive: (isFirstFrame) => this.activateVideo(isFirstFrame),
        onInactive: () => this.disableSkip(),
        onFinish: () => this.finishIntro(),
      },
    );
    this.videoLifecycle.start();
  }

  /**
   * Handles activate video.
   * @param {boolean} isFirstFrame - The is first frame value.
   */
  activateVideo(isFirstFrame) {
    if (isFirstFrame) this.sizeAndRevealVideo();
    this.scheduleSkip();
  }

  /**
   * Handles schedule skip.
   */
  scheduleSkip() {
    if (!this.videoLifecycle?.isActive()) return;
    this.isSkipping = false;
    this.skipTimer?.remove(false);
    this.skipTimer = this.scene.time.delayedCall(
      MENU_START_TRANSITION.skip.activationDelay,
      () => this.enableSkip(),
    );
  }

  /**
   * Enables skip.
   * @returns {void} No value is returned.
   */
  enableSkip() {
    const keyboard = this.scene.input.keyboard;
    if (this.isSkipping || this.skipHint || !this.videoLifecycle?.isActive()) {
      return;
    }
    this.createSkipHint();
    if (keyboard) {
      this.skipHandler = (event) => this.handleSkip(event);
      keyboard.on("keydown-SPACE", this.skipHandler);
    }
    if (InputDeviceDetector.isTouchLayout()) {
      this.touchSkipHandler = () => this.handleTouchSkip();
      this.scene.input.on("pointerdown", this.touchSkipHandler);
    }
  }

  /**
   * Creates skip hint.
   * @returns {void} No value is returned.
   */
  createSkipHint() {
    const { width, height } = this.scene.scale;
    const { skip, depths } = MENU_START_TRANSITION;
    const hintStyle = this.getSkipHintStyle(skip);
    this.skipHint = new IntroSkipHint(
      this.scene,
      width / 2,
      height - skip.hintOffsetY,
      hintStyle,
    )
      .setDepth(depths.skipHint)
      .setAlpha(0);
    this.fadeInSkipHint();
  }

  /**
   * Returns skip hint style.
   */
  getSkipHintStyle(skip) {
    if (!InputDeviceDetector.isTouchLayout()) return skip;
    return {
      ...skip,
      hint: skip.touchHint,
      actionHint: skip.touchActionHint,
    };
  }

  /**
   * Fades in skip hint.
   */
  fadeInSkipHint() {
    const { skip, videoReveal } = MENU_START_TRANSITION;
    this.scene.tweens.add({
      targets: this.skipHint,
      alpha: skip.hintAlpha,
      duration: videoReveal.duration,
      ease: videoReveal.ease,
    });
  }

  /**
   * Handles skip.
   * @param {KeyboardEvent} event - The triggering event.
   * @returns {void} No value is returned.
   */
  handleSkip(event) {
    if (event.repeat || this.isSkipping) return;
    event.preventDefault();
    this.skip();
  }

  /**
   * Handles touch skip.
   * @returns {void} No value is returned.
   */
  handleTouchSkip() {
    if (this.isSkipping) return;
    this.skip();
  }

  /**
   * Handles skip.
   * @returns {void} No value is returned.
   */
  skip() {
    if (!this.videoLifecycle?.isActive() || this.isSkipping) return;
    this.isSkipping = true;
    this.disableSkip();
    this.scene.tweens.killTweensOf(this.video);
    const initialVolume = this.video.getVolume();
    this.scene.tweens.add({
      targets: this.video,
      alpha: 0,
      duration: MENU_START_TRANSITION.skip.fadeDuration,
      ease: MENU_START_TRANSITION.skip.fadeEase,
      onUpdate: (tween) =>
        this.video.setVolume(initialVolume * (1 - tween.progress)),
      onComplete: this.finishIntro,
    });
  }

  /**
   * Handles disable skip.
   * @returns {void} No value is returned.
   */
  disableSkip() {
    this.skipTimer?.remove(false);
    this.skipTimer = null;
    this.unbindSkipKey();
    this.unbindTouchSkip();
    if (this.skipHint) {
      this.scene.tweens.killTweensOf(this.skipHint);
      this.skipHint.destroy();
      this.skipHint = null;
    }
  }

  /**
   * Handles unbind skip key.
   * @returns {void} No value is returned.
   */
  unbindSkipKey() {
    const keyboard = this.scene.input.keyboard;
    if (keyboard && this.skipHandler) {
      keyboard.off("keydown-SPACE", this.skipHandler);
    }
    this.skipHandler = null;
  }

  /**
   * Handles unbind touch skip.
   * @returns {void} No value is returned.
   */
  unbindTouchSkip() {
    if (this.touchSkipHandler) {
      this.scene.input.off("pointerdown", this.touchSkipHandler);
    }
    this.touchSkipHandler = null;
  }

  /**
   * Handles size and reveal video.
   * @returns {void} No value is returned.
   */
  sizeAndRevealVideo() {
    if (this.isVideoSized) return;
    const { width, height } = this.scene.scale;
    this.isVideoSized = true;
    this.coverCanvasWithVisibleVideoFrame(width, height);
    this.revealVideo();
  }

  /**
   * Handles cover canvas with visible video frame.
   * @param {number} canvasWidth - The canvas width value.
   * @param {number} canvasHeight - The canvas height value.
   * @returns {void} No value is returned.
   */
  coverCanvasWithVisibleVideoFrame(canvasWidth, canvasHeight) {
    const { visibleFrame } = MENU_START_TRANSITION.video;
    const sourceWidth = this.video.video?.videoWidth || 1440;
    const sourceHeight = this.video.video?.videoHeight || 960;
    const scale = Math.max(
      canvasWidth / visibleFrame.width,
      canvasHeight / visibleFrame.height,
    );
    const visibleCenterX = visibleFrame.x + visibleFrame.width / 2;
    const visibleCenterY = visibleFrame.y + visibleFrame.height / 2;
    const offsetX = (visibleCenterX - sourceWidth / 2) * scale;
    const offsetY = (visibleCenterY - sourceHeight / 2) * scale;

    this.video
      .setPosition(canvasWidth / 2 - offsetX, canvasHeight / 2 - offsetY)
      .setDisplaySize(sourceWidth * scale, sourceHeight * scale);
  }

  /**
   * Handles animate menu exit.
   */
  animateMenuExit() {
    setMuteButtonVisibility(false);
    setMenuSocialLinkVisibility(false);
    setMenuLegalNavigationVisibility(false);
    const { flyOut } = MENU_START_TRANSITION;
    this.scene.menuInterface?.animateExit();
    this.scene.logo?.setDepth(MENU_START_TRANSITION.depths.interface);
    this.tweenExitGroup([this.scene.logo], {
      x: `-=${flyOut.leftDistance}`,
    });
  }

  /**
   * Handles tween exit group.
   * @param {Object[]} targets - The targets value.
   * @param {{x?: string, y?: string}} destination - The destination value.
   * @returns {void} No value is returned.
   */
  tweenExitGroup(targets, destination) {
    targets.filter(Boolean).forEach((target, index) =>
      this.scene.tweens.add({
        targets: target,
        ...destination,
        alpha: 0,
        duration: MENU_START_TRANSITION.flyOut.duration,
        delay: index * MENU_START_TRANSITION.flyOut.stagger,
        ease: MENU_START_TRANSITION.flyOut.ease,
      }),
    );
  }

  /**
   * Handles reveal video.
   * @returns {void} No value is returned.
   */
  revealVideo() {
    const { videoReveal } = MENU_START_TRANSITION;
    this.scene.tweens.add({
      targets: this.video,
      alpha: 1,
      delay: videoReveal.delay,
      duration: videoReveal.duration,
      ease: videoReveal.ease,
    });
  }

  /**
   * Releases the current state.
   */
  destroy() {
    this.disableSkip();
    this.videoLifecycle?.destroy();
    this.videoLifecycle = null;
    this.unregisterVideoMute?.();
    this.unregisterVideoMute = null;
  }
}
