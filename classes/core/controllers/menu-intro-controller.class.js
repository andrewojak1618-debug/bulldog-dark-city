import { IntroSkipHint } from "../../ui/intro-skip-hint.class.js";
import { MENU_START_TRANSITION } from "../../../js/config/menu-transition-settings.js";

/**
 * Koordiniert Introvideo, Skip-Eingabe und den Übergang aus dem Hauptmenü.
 */
export class MenuIntroController {
  /**
   * Speichert die Menüszene als gemeinsame Schnittstelle zu Phaser.
   * @param {Phaser.Scene} scene - Aktive Menüszene.
   */
  constructor(scene) {
    this.scene = scene;
  }

  /**
   * Startet den vollständigen Vorspann und schließt ihn genau einmal ab.
   * @param {Function} onComplete - Aktion nach Ende oder Überspringen.
   * @returns {void}
   */
  play(onComplete) {
    this.finishIntro = this.createFinishHandler(onComplete);
    this.createVideo();
    this.bindVideoEvents();
    this.animateMenuExit();
    this.scheduleSkip();
    this.startVideo();
  }

  /**
   * Erzeugt einen gegen Mehrfachausführung geschützten Abschluss.
   * @param {Function} onComplete - Aktion nach der Intro-Sequenz.
   * @returns {Function} Einmalig ausführbarer Abschluss.
   */
  createFinishHandler(onComplete) {
    let isFinished = false;
    return () => {
      if (isFinished) return;
      isFinished = true;
      this.disableSkip();
      onComplete();
    };
  }

  /**
   * Erstellt das zunächst unsichtbare Introvideo in Canvasgröße.
   * @returns {void}
   */
  createVideo() {
    const { width, height } = this.scene.scale;
    this.video = this.scene.add
      .video(width / 2, height / 2, MENU_START_TRANSITION.video.key)
      .setDepth(MENU_START_TRANSITION.depths.video)
      .setAlpha(0)
      .setMute(false)
      .setVolume(MENU_START_TRANSITION.video.volume);
    this.isVideoSized = false;
  }

  /**
   * Verbindet Videozustände mit Skalierung und Abschluss.
   * @returns {void}
   */
  bindVideoEvents() {
    const sizeVideo = () => this.sizeAndRevealVideo();
    this.video.once("created", sizeVideo);
    this.video.once("playing", sizeVideo);
    this.video.once("complete", this.finishIntro);
    this.video.once("error", this.finishIntro);
  }

  /**
   * Startet das Video und beendet bei einem synchronen Fehler kontrolliert.
   * @returns {void}
   */
  startVideo() {
    try {
      this.video.play(false);
    } catch {
      this.finishIntro();
    }
  }

  /**
   * Aktiviert die Skip-Taste zeitversetzt nach dem Start-Tastendruck.
   * @returns {void}
   */
  scheduleSkip() {
    this.isSkipping = false;
    this.skipTimer = this.scene.time.delayedCall(
      MENU_START_TRANSITION.skip.activationDelay,
      () => this.enableSkip(),
    );
  }

  /**
   * Bindet die Leertaste einmalig an das Überspringen des Vorspanns.
   * @returns {void}
   */
  enableSkip() {
    const keyboard = this.scene.input.keyboard;
    if (!keyboard || this.isSkipping) return;
    this.createSkipHint();
    this.skipHandler = (event) => this.handleSkip(event);
    keyboard.on("keydown-SPACE", this.skipHandler);
  }

  /**
   * Erstellt und blendet den zentrierten Leertastenhinweis ein.
   * @returns {void}
   */
  createSkipHint() {
    const { width, height } = this.scene.scale;
    const { skip, depths, videoReveal } = MENU_START_TRANSITION;
    this.skipHint = new IntroSkipHint(
      this.scene,
      width / 2,
      height - skip.hintOffsetY,
      skip,
    )
      .setDepth(depths.skipHint)
      .setAlpha(0);
    this.scene.tweens.add({
      targets: this.skipHint,
      alpha: skip.hintAlpha,
      duration: videoReveal.duration,
      ease: videoReveal.ease,
    });
  }

  /**
   * Reagiert auf einen neuen Leertastendruck genau einmal.
   * @param {KeyboardEvent} event - Auslösendes Tastaturereignis.
   * @returns {void}
   */
  handleSkip(event) {
    if (event.repeat || this.isSkipping) return;
    event.preventDefault();
    this.skip();
  }

  /**
   * Blendet Video und Ton aus und schließt anschließend das Intro ab.
   * @returns {void}
   */
  skip() {
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
   * Entfernt Skip-Timer, Tastaturereignis und sichtbaren Hinweis.
   * @returns {void}
   */
  disableSkip() {
    this.skipTimer?.remove(false);
    this.skipTimer = null;
    this.unbindSkipKey();
    if (this.skipHint) {
      this.scene.tweens.killTweensOf(this.skipHint);
      this.skipHint.destroy();
      this.skipHint = null;
    }
  }

  /**
   * Entfernt den gebundenen Leertasten-Handler.
   * @returns {void}
   */
  unbindSkipKey() {
    const keyboard = this.scene.input.keyboard;
    if (keyboard && this.skipHandler) {
      keyboard.off("keydown-SPACE", this.skipHandler);
    }
    this.skipHandler = null;
  }

  /**
   * Skaliert den ersten echten Videoframe auf die Canvasgröße.
   * @returns {void}
   */
  sizeAndRevealVideo() {
    if (this.isVideoSized) return;
    const { width, height } = this.scene.scale;
    this.isVideoSized = true;
    this.video.setDisplaySize(width, height);
    this.revealVideo();
  }

  /**
   * Verteilt die Menüelemente auf drei zeitversetzte Flugrichtungen.
   * @returns {void}
   */
  animateMenuExit() {
    const { leftObjects, rightObjects } = this.getExitGroups();
    const interfaceObjects = [
      ...leftObjects,
      ...rightObjects,
      this.scene.inputHint,
    ];
    interfaceObjects.forEach((gameObject) =>
      gameObject?.setDepth(MENU_START_TRANSITION.depths.interface),
    );
    this.tweenExitGroups(leftObjects, rightObjects);
  }

  /**
   * Ordnet die sichtbaren Menüelemente ihren Austrittsrichtungen zu.
   * @returns {{leftObjects: Object[], rightObjects: Object[]}} UI-Gruppen.
   */
  getExitGroups() {
    return {
      leftObjects: [
        this.scene.logo,
        ...this.scene.menuButtons,
        ...this.scene.unavailableLabels,
        this.scene.versionInfo,
      ],
      rightObjects: [
        ...this.scene.quickActionButtons,
        this.scene.socialMediaHeading,
        ...this.scene.socialMediaButtons,
      ],
    };
  }

  /**
   * Startet die drei Austrittsanimationen mit zentralen Distanzen.
   * @param {Object[]} leftObjects - Nach links fliegende Elemente.
   * @param {Object[]} rightObjects - Nach rechts fliegende Elemente.
   * @returns {void}
   */
  tweenExitGroups(leftObjects, rightObjects) {
    const { flyOut } = MENU_START_TRANSITION;
    this.tweenExitGroup(leftObjects, { x: `-=${flyOut.leftDistance}` });
    this.tweenExitGroup(rightObjects, { x: `+=${flyOut.rightDistance}` });
    this.tweenExitGroup(
      [this.scene.inputHint],
      { y: `+=${flyOut.bottomDistance}` },
    );
  }

  /**
   * Animiert eine UI-Gruppe zeitversetzt aus dem Canvas.
   * @param {Object[]} targets - Zu animierende Elemente.
   * @param {{x?: string, y?: string}} destination - Relative Zielposition.
   * @returns {void}
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
   * Blendet das gestartete Introvideo hinter der fliegenden Oberfläche ein.
   * @returns {void}
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
}
