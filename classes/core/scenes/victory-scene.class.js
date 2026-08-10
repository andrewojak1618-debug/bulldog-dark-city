import Phaser from "phaser";
import { IntroSkipHint } from "../../ui/intro-skip-hint.class.js";
import { InputDeviceDetector } from
  "../../input/input-device-detector.class.js";
import { globalMuteSystem } from
  "../../systems/global-mute-system.class.js";
import { setMuteButtonVisibility } from
  "../controllers/mute-button-controller.class.js";
import { ENDING } from "../../../js/config/ending-settings.js";
import { SCENES } from "../../../js/config/game-settings.js";

/** Spielt nach dem besiegten Endgegner die abschließende Videosequenz ab. */
export class VictoryScene extends Phaser.Scene {
  /** Erstellt die Szene mit ihrem eindeutigen Szenenschlüssel. */
  constructor() {
    super(SCENES.victory);
  }

  /**
   * Lädt das weboptimierte Endvideo mit Ton.
   * @returns {void}
   */
  preload() {
    const { video } = ENDING;
    this.load.video(video.key, video.url, video.noAudio);
  }

  /**
   * Erstellt Video, Abschlussereignisse und verzögerte Skip-Steuerung.
   * @returns {void}
   */
  create() {
    setMuteButtonVisibility(false);
    const { width, height } = this.scale;
    const { video, depths } = ENDING;
    this.cameras.main.setBackgroundColor("#000000");
    this.isFinished = false;
    this.isSkipping = false;
    this.isVideoSized = false;
    this.video = this.add.video(width / 2, height / 2, video.key)
      .setDepth(depths.video)
      .setAlpha(0)
      .setMute(globalMuteSystem.isMuted())
      .setVolume(video.volume);
    this.unregisterVideoMute = globalMuteSystem.registerVideo(this.video);
    this.video.once("created", () => this.sizeAndRevealVideo());
    this.video.once("playing", () => this.sizeAndRevealVideo());
    this.video.once("complete", () => this.finish());
    this.video.once("error", () => this.showFallback());
    this.scheduleSkip();
    this.events.once("shutdown", () => this.cleanup());
    this.startVideo();
  }

  /**
   * Startet die Wiedergabe und nutzt bei einem Fehler den Ersatzabschluss.
   * @returns {void}
   */
  startVideo() {
    try {
      this.video.play(false);
    } catch {
      this.showFallback();
    }
  }

  /**
   * Skaliert den ersten echten Videoframe exakt auf die Canvasgröße.
   * @returns {void}
   */
  sizeAndRevealVideo() {
    if (this.isVideoSized || !this.video) return;
    const { width, height } = this.scale;
    this.isVideoSized = true;
    this.video.setDisplaySize(width, height).setAlpha(1);
  }

  /**
   * Aktiviert den sichtbaren Leertastenhinweis leicht zeitversetzt.
   * @returns {void}
   */
  scheduleSkip() {
    this.skipTimer = this.time.delayedCall(
      ENDING.skip.activationDelay,
      () => this.enableSkip(),
    );
  }

  /**
   * Aktiviert den passenden Skip-Hinweis für Tastatur oder Touch.
   * @returns {void}
   */
  enableSkip() {
    const keyboard = this.input.keyboard;
    if (this.isFinished) return;
    const { width, height } = this.scale;
    const { skip, depths } = ENDING;
    const isTouchMode = this.isTouchMode();
    const hintStyle = isTouchMode ? {
      ...skip,
      hint: skip.touchHint,
      actionHint: skip.touchActionHint,
    } : skip;
    this.skipHint = new IntroSkipHint(
      this,
      width / 2,
      height - skip.hintOffsetY,
      hintStyle,
    ).setDepth(depths.skipHint).setAlpha(skip.hintAlpha);
    if (keyboard) {
      this.skipHandler = (event) => this.handleSkip(event);
      keyboard.on("keydown-SPACE", this.skipHandler);
    }
    if (isTouchMode) {
      this.touchSkipHandler = () => this.startSkip();
      this.input.on("pointerdown", this.touchSkipHandler);
    }
  }

  /**
   * Verhindert Wiederholungen und startet eine weiche Videoausblendung.
   * @param {KeyboardEvent} event - Auslösendes Leertastenereignis.
   * @returns {void}
   */
  handleSkip(event) {
    if (event.repeat) return;
    event.preventDefault();
    this.startSkip();
  }

  /**
   * Startet die gemeinsame Ausblendung für Tastatur und Touch genau einmal.
   * @returns {void}
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
   * Erkennt Handy, Tablet und den lokalen Touch-Testmodus.
   * @returns {boolean} Ob der mobile Skipbutton verwendet werden soll.
   */
  isTouchMode() {
    return InputDeviceDetector.isTouchLayout();
  }

  /**
   * Beendet die Endsequenz genau einmal und kehrt zum Hauptmenü zurück.
   * @returns {void}
   */
  finish() {
    if (this.isFinished) return;
    this.isFinished = true;
    this.cleanup();
    this.scene.start(SCENES.menu);
  }

  /**
   * Zeigt bei einem Videofehler kurz einen lesbaren Abschlussbildschirm.
   * @returns {void}
   */
  showFallback() {
    if (this.isFinished) return;
    const { width, height } = this.scale;
    const { fallback } = ENDING;
    this.disableSkip();
    this.video?.destroy();
    this.video = null;
    this.add.text(width / 2, height / 2, fallback.text, {
      fontFamily: fallback.fontFamily,
      fontSize: `${fallback.fontSize}px`,
      color: fallback.color,
    }).setOrigin(0.5);
    this.time.delayedCall(fallback.returnDelayMs, () => this.finish());
  }

  /**
   * Entfernt Timer, Eingabeereignisse, Hinweis und Video sicher.
   * @returns {void}
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
   * Entfernt Skip-Timer, Eingabeereignisse und sichtbaren Hinweis.
   * @returns {void}
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
