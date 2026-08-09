import Phaser from "phaser";
import { IntroSkipHint } from "../../ui/intro-skip-hint.class.js";
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
    const { width, height } = this.scale;
    const { video, depths } = ENDING;
    this.cameras.main.setBackgroundColor("#000000");
    this.isFinished = false;
    this.isSkipping = false;
    this.isVideoSized = false;
    this.video = this.add.video(width / 2, height / 2, video.key)
      .setDepth(depths.video)
      .setAlpha(0)
      .setMute(false)
      .setVolume(video.volume);
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
   * Bindet die Leertaste einmalig an das Überspringen der Endsequenz.
   * @returns {void}
   */
  enableSkip() {
    const keyboard = this.input.keyboard;
    if (!keyboard || this.isFinished) return;
    const { width, height } = this.scale;
    const { skip, depths } = ENDING;
    this.skipHint = new IntroSkipHint(
      this,
      width / 2,
      height - skip.hintOffsetY,
      skip,
    ).setDepth(depths.skipHint).setAlpha(skip.hintAlpha);
    this.skipHandler = (event) => this.handleSkip(event);
    keyboard.on("keydown-SPACE", this.skipHandler);
  }

  /**
   * Verhindert Wiederholungen und startet eine weiche Videoausblendung.
   * @param {KeyboardEvent} event - Auslösendes Leertastenereignis.
   * @returns {void}
   */
  handleSkip(event) {
    if (event.repeat || this.isSkipping || this.isFinished) return;
    event.preventDefault();
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
   * Entfernt Timer, Tastaturereignis, Hinweis und Video sicher.
   * @returns {void}
   */
  cleanup() {
    this.disableSkip();
    if (this.video) {
      this.tweens.killTweensOf(this.video);
      this.video.stop();
      this.video.destroy();
    }
    this.video = null;
  }

  /**
   * Entfernt Skip-Timer, Tastaturereignis und sichtbaren Hinweis.
   * @returns {void}
   */
  disableSkip() {
    this.skipTimer?.remove(false);
    this.skipTimer = null;
    if (this.skipHandler) {
      this.input.keyboard?.off("keydown-SPACE", this.skipHandler);
      this.skipHandler = null;
    }
    this.skipHint?.destroy();
    this.skipHint = null;
  }
}
