import Phaser from "phaser";
import { HUD } from "../../js/config/hud-settings.js";

/** Stellt nach der Freischaltung den alleinigen Mutationsrahmen dar. */
export class MutationBar extends Phaser.GameObjects.Container {
  /**
   * Erstellt den zunächst außerhalb des Canvas verborgenen Mutationsrahmen.
   * @param {Phaser.Scene} scene - Zugehörige Spielszene.
   */
  constructor(scene) {
    const settings = HUD.mutation;
    super(scene, settings.hiddenX, settings.y);
    scene.add.existing(this);
    this.energy = { value: 0 };
    this.energyTween = null;
    this.energyGraphics = scene.add.graphics();
    const frame = scene.add.image(0, 0, settings.textureKey)
      .setOrigin(0)
      .setDisplaySize(settings.width, settings.height);
    this.add([this.energyGraphics, frame]);
    this.setAlpha(0).setScrollFactor(0).setDepth(HUD.depth);
    this.once("destroy", () => this.energyTween?.stop());
  }

  /**
   * Lässt den Mutationsrahmen nach dem normalen HUD ins Canvas gleiten.
   * @returns {Phaser.Tweens.Tween} Laufender Einblendtween.
   */
  show() {
    const settings = HUD.mutation;
    this.setVisible(true);
    return this.scene.tweens.add({
      targets: this,
      x: settings.x,
      alpha: 1,
      delay: settings.entryDelayMs,
      duration: settings.entryDurationMs,
      ease: "Back.easeOut",
    });
  }

  /** Zeichnet den aktuellen grünen Energiefüllstand. */
  drawEnergy(value) {
    const settings = HUD.mutation;
    const ratio = Phaser.Math.Clamp(value, 0, 1);
    const width = settings.fillWidth * ratio;
    this.energyGraphics.clear();
    if (width <= 0) return;
    this.drawEnergyGlow(width);
    this.drawEnergyCore(width);
  }

  /** Zeichnet den weichen Außenbereich der Mutationsenergie. */
  drawEnergyGlow(width) {
    const settings = HUD.mutation;
    this.energyGraphics.fillStyle(settings.fillGlowColor, 0.3);
    this.energyGraphics.fillRoundedRect(
      settings.fillX - 2,
      settings.fillY - 2,
      width + 4,
      settings.fillHeight + 4,
      settings.fillRadius,
    );
  }

  /** Zeichnet den kräftigen Kern der Mutationsenergie. */
  drawEnergyCore(width) {
    const settings = HUD.mutation;
    this.energyGraphics.fillStyle(settings.fillColor, settings.fillAlpha);
    this.energyGraphics.fillRoundedRect(
      settings.fillX,
      settings.fillY,
      width,
      settings.fillHeight,
      settings.fillRadius,
    );
  }

  /** Setzt die Mutation-Bar ohne zeitliche Verzögerung vollständig voll. */
  fill() {
    this.energyTween?.stop();
    this.energy.value = 1;
    this.drawEnergy(1);
  }

  /** Leert die Energie gleichmäßig und meldet den Abschluss. */
  drain(duration, onComplete) {
    this.energyTween?.stop();
    this.energyTween = this.scene.tweens.add({
      targets: this.energy,
      value: 0,
      duration,
      ease: "Linear",
      onUpdate: () => this.drawEnergy(this.energy.value),
      onComplete,
    });
    return this.energyTween;
  }

  /** Blendet den Mutationsrahmen nach links aus dem Canvas aus. */
  hide() {
    const settings = HUD.mutation;
    return this.scene.tweens.add({
      targets: this,
      x: settings.hiddenX,
      alpha: 0,
      duration: settings.exitDurationMs,
      ease: "Back.easeIn",
      onComplete: () => this.setVisible(false),
    });
  }
}
