import Phaser from "phaser";
import { ROBOT_CAT_HEALTH_BAR } from
  "../../js/config/robot-cat-settings.js";

/** Zeigt neun Boss-Lebenspunkte in drei farbigen Phasen an. */
export class BossPhaseHealthBar extends Phaser.GameObjects.Container {
  /**
   * Erstellt die kamerafeste Bossanzeige und verbindet sie mit dem Lebenssystem.
   * @param {Phaser.Scene} scene - Aktive Boss-Szene.
   * @param {import("../systems/health-system.class.js").HealthSystem} health - Bossleben.
   */
  constructor(scene, health) {
    const settings = ROBOT_CAT_HEALTH_BAR;
    super(scene, settings.x, settings.y);
    scene.add.existing(this);
    this.settings = settings;
    this.graphics = scene.add.graphics();
    this.add(this.graphics);
    this.setScrollFactor(0).setDepth(settings.depth);
    this.bindHealth(health);
  }

  /**
   * Verbindet die Anzeige mit dem Bossleben und entfernt den Listener sauber.
   * @param {import("../systems/health-system.class.js").HealthSystem} health - Bossleben.
   * @returns {void}
   */
  bindHealth(health) {
    const unsubscribe = health.onChange((current, maximum) => {
      this.draw(current, maximum);
    });
    this.once("destroy", unsubscribe);
  }

  /**
   * Zeichnet Rahmen, leere Slots und die noch aktiven Farbsegmente neu.
   * @param {number} current - Aktuell vorhandene Lebenspunkte.
   * @param {number} maximum - Maximale Anzahl der Lebenspunkte.
   * @returns {void}
   */
  draw(current, maximum) {
    const settings = this.settings;
    this.graphics.clear();
    this.drawBackground();
    const segmentWidth = this.getSegmentWidth(maximum);
    for (let index = 0; index < maximum; index += 1) {
      this.drawSegment(index, index < current, segmentWidth);
    }
  }

  /**
   * Zeichnet den dezenten gemeinsamen Hintergrund der Bossanzeige.
   * @returns {void}
   */
  drawBackground() {
    const settings = this.settings;
    const left = -settings.width / 2;
    this.graphics.fillStyle(settings.backgroundColor, settings.backgroundAlpha)
      .fillRoundedRect(left, 0, settings.width, settings.height, settings.radius)
      .lineStyle(1, settings.borderColor, settings.borderAlpha)
      .strokeRoundedRect(left, 0, settings.width, settings.height, settings.radius);
  }

  /**
   * Berechnet eine einheitliche Breite für alle neun Lebenssegmente.
   * @param {number} maximum - Anzahl der anzuzeigenden Segmente.
   * @returns {number} Breite eines einzelnen Segments.
   */
  getSegmentWidth(maximum) {
    const settings = this.settings;
    const innerWidth = settings.width - settings.padding * 2;
    const totalGaps = settings.groupGap * 2 + settings.segmentGap * 6;
    return (innerWidth - totalGaps) / maximum;
  }

  /**
   * Zeichnet ein einzelnes Segment in Phasenfarbe oder als leeren Slot.
   * @param {number} index - Nullbasierter Segmentindex.
   * @param {boolean} isActive - Ob der Lebenspunkt noch vorhanden ist.
   * @param {number} segmentWidth - Berechnete Segmentbreite.
   * @returns {void}
   */
  drawSegment(index, isActive, segmentWidth) {
    const settings = this.settings;
    const groupIndex = Math.floor(index / 3);
    const gapCount = index - groupIndex;
    const x = -settings.width / 2 + settings.padding +
      index * segmentWidth + gapCount * settings.segmentGap +
      groupIndex * settings.groupGap;
    const y = settings.padding;
    const color = isActive ? settings.phaseColors[groupIndex] :
      settings.emptyColor;
    const alpha = isActive ? 1 : settings.emptyAlpha;
    this.graphics.fillStyle(color, alpha).fillRoundedRect(
      x,
      y,
      segmentWidth,
      settings.height - settings.padding * 2,
      2,
    );
  }
}
