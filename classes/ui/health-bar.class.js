import Phaser from "phaser";
import { HUD } from "../../js/config/hud-settings.js";

/**
 * Stellt den aktuellen Lebenspunktestand im HUD dar.
 */
export class HealthBar extends Phaser.GameObjects.Container {
  /**
   * Erstellt Rahmen, dynamische Füllung und numerische Lebenspunkte.
   * @param {Phaser.Scene} scene - Zugehörige Spielszene.
   * @param {import("../systems/health-system.class.js").HealthSystem} system - Lebenspunkte.
   */
  constructor(scene, system) {
    const settings = HUD.health;
    super(scene, settings.x, settings.y);
    scene.add.existing(this);
    this.settings = settings;
    this.fillGraphics = scene.add.graphics();
    this.frame = this.createFrame(scene);
    this.valueText = this.createValueText(scene);
    this.add([this.fillGraphics, this.frame, this.valueText]);
    this.setScrollFactor(0).setDepth(HUD.depth);
    this.bindSystem(system);
  }

  /**
   * Erstellt den grafischen Rahmen in den zentral konfigurierten Maßen.
   * @param {Phaser.Scene} scene - Zugehörige Spielszene.
   * @returns {Phaser.GameObjects.Image} Rahmenbild.
   */
  createFrame(scene) {
    return scene.add
      .image(0, 0, this.settings.textureKey)
      .setOrigin(0)
      .setDisplaySize(this.settings.width, this.settings.height);
  }

  /**
   * Erstellt den mittig in der Füllfläche liegenden Zahlenwert.
   * @param {Phaser.Scene} scene - Zugehörige Spielszene.
   * @returns {Phaser.GameObjects.Text} Textobjekt der Lebenspunkte.
   */
  createValueText(scene) {
    const { fillX, fillY, fillWidth, fillHeight } = this.settings;
    return scene.add.text(
      fillX + fillWidth / 2,
      fillY + fillHeight / 2,
      "",
      this.settings.textStyle,
    ).setOrigin(0.5);
  }

  /**
   * Verbindet die Anzeige mit den Lebenspunkten und räumt den Listener auf.
   * @param {import("../systems/health-system.class.js").HealthSystem} system - Lebenspunkte.
   * @returns {void}
   */
  bindSystem(system) {
    const unsubscribe = system.onChange((current, maximum) => {
      this.updateValue(current, maximum);
    });
    this.once("destroy", unsubscribe);
  }

  /**
   * Zeichnet den aktuellen Füllstand innerhalb des Bildrahmens neu.
   * @param {number} current - Aktuelle Lebenspunkte.
   * @param {number} maximum - Maximale Lebenspunkte.
   * @returns {void}
   */
  updateValue(current, maximum) {
    const ratio = maximum > 0 ? Phaser.Math.Clamp(current / maximum, 0, 1) : 0;
    const settings = this.settings;
    this.fillGraphics.clear();
    this.fillGraphics.fillStyle(
      settings.fillBackgroundColor,
      settings.fillBackgroundAlpha,
    );
    this.fillGraphics.fillRoundedRect(
      settings.fillX,
      settings.fillY,
      settings.fillWidth,
      settings.fillHeight,
      settings.fillRadius,
    );
    this.fillGraphics.fillStyle(settings.fillColor, 1);
    this.fillGraphics.fillRoundedRect(
      settings.fillX,
      settings.fillY,
      settings.fillWidth * ratio,
      settings.fillHeight,
      settings.fillRadius,
    );
    this.valueText.setText(`${current} / ${maximum}`);
  }
}
