import Phaser from "phaser";
import { COLLECTIBLE_KEYS, HUD } from "../../js/config/hud-settings.js";
import { InputDeviceDetector } from
  "../input/input-device-detector.class.js";

/** Zeigt die verfügbare Tastenkombination bei vollständig gefülltem Serum. */
export class MutationReadyPrompt extends Phaser.GameObjects.Container {
  /**
   * Erstellt die zunächst verborgene, kamerafeste Mutationsanzeige.
   * @param {Phaser.Scene} scene - Zugehörige Spielszene.
   * @param {import("../systems/collectible-system.class.js").CollectibleSystem}
   * collectibles - Aktuelle Sammelstände.
   */
  constructor(scene, collectibles) {
    const settings = HUD.mutationReady;
    super(scene, settings.x, settings.y);
    scene.add.existing(this);
    this.settings = settings;
    this.pulseTween = null;
    this.isReady = false;
    this.add(this.createContent(scene));
    this.setScrollFactor(0).setDepth(HUD.depth).setVisible(false);
    this.bindCollectibles(collectibles);
  }

  /** Erstellt Tastenkappe und erklärende Beschriftung. */
  createContent(scene) {
    if (this.isTouchMode()) {
      return [
        scene.add.text(
          0,
          12,
          "PRESS M MUTATION",
          this.settings.labelStyle,
        ).setOrigin(0, 0.5),
      ];
    }
    const keyCap = this.createKeyCap(scene);
    const keyText = scene.add.text(24, 12, "J + F", this.settings.keyStyle)
      .setOrigin(0.5);
    const label = scene.add.text(55, 12, "MUTATION BEREIT", this.settings.labelStyle)
      .setOrigin(0, 0.5);
    return [keyCap, keyText, label];
  }

  /**
   * Erkennt Handy, Tablet und den lokalen Touch-Testmodus.
   * @returns {boolean} Ob die mobile Mutationsanweisung sichtbar sein soll.
   */
  isTouchMode() {
    return InputDeviceDetector.isTouchLayout();
  }

  /** Zeichnet eine kompakte Tastenkappe mit leichtem Schatten. */
  createKeyCap(scene) {
    const { keyWidth, keyHeight } = this.settings;
    return scene.add.graphics()
      .fillStyle(0x050308, 0.55)
      .fillRoundedRect(2, 3, keyWidth, keyHeight, 4)
      .lineStyle(1, 0xb52cff, 0.95)
      .fillStyle(0x302a35, 0.96)
      .fillRoundedRect(0, 0, keyWidth, keyHeight, 4)
      .strokeRoundedRect(0, 0, keyWidth, keyHeight, 4);
  }

  /** Reagiert auf den Serumstand und entfernt den Listener beim Zerstören. */
  bindCollectibles(collectibles) {
    const update = (key, count) => {
      if (key === COLLECTIBLE_KEYS.serum) this.setReady(count);
    };
    const unsubscribe = collectibles.onChange(update);
    this.setReady(collectibles.getCount(COLLECTIBLE_KEYS.serum));
    this.once("destroy", () => {
      unsubscribe();
      this.pulseTween?.stop();
    });
  }

  /** Schaltet die Anzeige abhängig vom vollständigen Serumstand. */
  setReady(count) {
    const isReady = count >= HUD.serum.fill.maximum;
    this.isReady = isReady;
    this.setVisible(isReady);
    if (isReady && !this.pulseTween) this.startPulse();
    if (!isReady) this.stopPulse();
  }

  /** Stellt den Hinweis nach einem HUD-Wechsel nur bei vollem Serum wieder her. */
  restoreVisibility() {
    this.setVisible(this.isReady);
  }

  /** Startet den dezenten Neon-Puls der Bereitschaftsanzeige. */
  startPulse() {
    this.setAlpha(this.settings.pulseAlphaMax);
    this.pulseTween = this.scene.tweens.add({
      targets: this,
      alpha: this.settings.pulseAlphaMin,
      duration: this.settings.pulseDurationMs,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1,
    });
  }

  /** Beendet den Puls und stellt die volle Deckkraft wieder her. */
  stopPulse() {
    this.pulseTween?.stop();
    this.pulseTween = null;
    this.setAlpha(this.settings.pulseAlphaMax);
  }
}
