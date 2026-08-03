import Phaser from "phaser";
import { HUD } from "../../js/config/hud-settings.js";

/**
 * Zeigt einen einzelnen Sammelzähler in einem grafischen HUD-Rahmen.
 */
export class CollectibleCounter extends Phaser.GameObjects.Container {
  /**
   * Erstellt einen kamerafesten Zähler für eine Objektart.
   * @param {Phaser.Scene} scene - Zugehörige Spielszene.
   * @param {string} key - Schlüssel des Sammelobjekts.
   * @param {{x: number, y: number, width: number, height: number,
   * textX: number, textY: number, textureKey: string}} settings - Darstellung.
   * @param {import(
   * "../systems/collectible-system.class.js"
   * ).CollectibleSystem} system - Zählerdaten.
   */
  constructor(scene, key, settings, system) {
    super(scene, settings.x, settings.y);
    scene.add.existing(this);
    this.key = key;
    this.settings = settings;
    this.fillProgress = { value: 0 };
    this.fillTween = null;
    this.fillGraphics = this.createFillGraphics(scene, settings);
    const frame = this.createFrame(scene, settings);
    this.valueText = this.createValueText(scene, settings);
    this.add([this.fillGraphics, frame, this.valueText].filter(Boolean));
    this.setScrollFactor(0).setDepth(HUD.depth);
    this.setInitialValue(system.getCount(key));
    this.bindSystem(system);
    this.once("destroy", () => this.fillTween?.stop());
  }

  /**
   * Zeigt einen übernommenen Sammelstand ohne verzögerten Start-Tween an.
   * @param {number} count - Anfangswert des Sammelobjekts.
   * @returns {void}
   */
  setInitialValue(count) {
    this.valueText.setText(String(count));
    const fill = this.settings.fill;
    if (!fill || !this.fillGraphics) return;

    const ratio = Phaser.Math.Clamp(count / fill.maximum, 0, 1);
    this.fillProgress.value = ratio;
    this.drawFill(ratio);
  }

  /**
   * Erstellt den Rahmen des Sammelzählers.
   * @param {Phaser.Scene} scene - Zugehörige Spielszene.
   * @param {object} settings - Zentrale Darstellungswerte.
   * @returns {Phaser.GameObjects.Image} Rahmenbild.
   */
  createFrame(scene, settings) {
    return scene.add.image(0, 0, settings.textureKey)
      .setOrigin(0)
      .setDisplaySize(settings.width, settings.height);
  }

  /**
   * Erstellt optional eine dynamische Füllfläche hinter dem HUD-Rahmen.
   * @param {Phaser.Scene} scene - Zugehörige Spielszene.
   * @param {object} settings - Zentrale Darstellungswerte.
   * @returns {Phaser.GameObjects.Graphics|null} Füllgrafik oder `null`.
   */
  createFillGraphics(scene, settings) {
    return settings.fill ? scene.add.graphics() : null;
  }

  /**
   * Erstellt den Zahlenwert im Sammelrahmen.
   * @param {Phaser.Scene} scene - Zugehörige Spielszene.
   * @param {object} settings - Zentrale Darstellungswerte.
   * @returns {Phaser.GameObjects.Text} Textobjekt des Zählers.
   */
  createValueText(scene, settings) {
    return scene.add.text(
      settings.textX,
      settings.textY,
      "0",
      HUD.collectibleTextStyle,
    ).setOrigin(0.5);
  }

  /**
   * Reagiert nur auf Änderungen der zugehörigen Sammelobjektart.
   * @param {import(
   * "../systems/collectible-system.class.js"
   * ).CollectibleSystem} system - Zählerdaten.
   * @returns {void}
   */
  bindSystem(system) {
    const unsubscribe = system.onChange((changedKey, count) => {
      if (changedKey === this.key) {
        this.valueText.setText(String(count));
        this.updateFill(count);
      }
    });
    this.once("destroy", unsubscribe);
  }

  /**
   * Animiert den grün-violetten Serumstand zum nächsten Zielwert.
   * @param {number} count - Aktueller Serum-Zählerstand.
   * @returns {void}
   */
  updateFill(count) {
    const fill = this.settings.fill;
    if (!fill || !this.fillGraphics) return;

    const targetRatio = Phaser.Math.Clamp(count / fill.maximum, 0, 1);
    this.fillTween?.stop();
    this.fillTween = this.createFillTween(targetRatio);
  }

  /**
   * Erstellt die langsame Übergangsanimation zum neuen Serumstand.
   * @param {number} targetRatio - Zielfüllstand zwischen null und eins.
   * @returns {Phaser.Tweens.Tween} Laufender Fülltween.
   */
  createFillTween(targetRatio) {
    return this.scene.tweens.add({
      targets: this.fillProgress,
      value: targetRatio,
      duration: this.settings.fill.durationMs,
      ease: "Sine.easeInOut",
      onUpdate: () => this.drawFill(this.fillProgress.value),
      onComplete: () => this.finishFillTween(targetRatio),
    });
  }

  /**
   * Fixiert nach dem Tween den exakten Zielstand und gibt die Referenz frei.
   * @param {number} targetRatio - Erreichter Zielfüllstand.
   * @returns {void}
   */
  finishFillTween(targetRatio) {
    this.fillProgress.value = targetRatio;
    this.drawFill(targetRatio);
    this.fillTween = null;
  }

  /**
   * Zeichnet den aktuellen Füllfortschritt mit bewegter Wellenkante.
   * @param {number} ratio - Sichtbarer Füllstand zwischen null und eins.
   * @returns {void}
   */
  drawFill(ratio) {
    const fill = this.settings.fill;
    const filledWidth = fill.width * ratio;
    this.fillGraphics.clear();
    if (filledWidth <= 0) return;

    const points = this.getFillPoints(fill, filledWidth, ratio);
    this.applyFillStyle(fill);
    this.fillGraphics.fillPoints(points, true);
  }

  /**
   * Berechnet die geschlossene Fläche inklusive bewegter Wellenkante.
   * @param {object} fill - Zentrale Füllkonfiguration.
   * @param {number} filledWidth - Sichtbare Breite der Füllung.
   * @param {number} ratio - Aktueller Füllstand.
   * @returns {Phaser.Geom.Point[]} Punkte der geschlossenen Fläche.
   */
  getFillPoints(fill, filledWidth, ratio) {
    const points = [
      new Phaser.Geom.Point(fill.x, fill.y + fill.height),
      new Phaser.Geom.Point(fill.x + filledWidth, fill.y + fill.height),
    ];
    for (let offset = filledWidth; offset >= 0; offset -= 2) {
      const waveY = this.getWaveY(fill, offset, ratio);
      points.push(new Phaser.Geom.Point(fill.x + offset, waveY));
    }
    return points;
  }

  /**
   * Berechnet die vertikale Position eines Punkts der Wellenkante.
   * @param {object} fill - Zentrale Füllkonfiguration.
   * @param {number} offset - Horizontaler Abstand innerhalb der Füllung.
   * @param {number} ratio - Aktueller Füllstand.
   * @returns {number} Vertikale Position des Wellenpunkts.
   */
  getWaveY(fill, offset, ratio) {
    const phase = (offset / fill.waveLength + ratio) * Math.PI * 2;
    return fill.y + Math.sin(phase) * fill.waveAmplitude;
  }

  /**
   * Setzt den zentral konfigurierten Farbverlauf der Serumfüllung.
   * @param {object} fill - Zentrale Füllkonfiguration.
   * @returns {void}
   */
  applyFillStyle(fill) {
    this.fillGraphics.fillGradientStyle(
      fill.colorLeft,
      fill.colorRight,
      fill.colorBottomLeft,
      fill.colorBottomRight,
      fill.alpha,
    );
  }
}
