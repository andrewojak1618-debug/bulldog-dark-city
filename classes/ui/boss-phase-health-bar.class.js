import Phaser from "phaser";
import { ROBOT_CAT_HEALTH_BAR } from
  "../../js/config/robot-cat-settings.js";

/**
 * Manages boss phase health bar behavior.
 */
export class BossPhaseHealthBar extends Phaser.GameObjects.Container {
  /**
   * Creates a new instance.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {import("../systems/health-system.class.js").HealthSystem} health - The associated health system.
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
   * Binds health.
   * @param {import("../systems/health-system.class.js").HealthSystem} health - The associated health system.
   * @returns {void} No value is returned.
   */
  bindHealth(health) {
    const unsubscribe = health.onChange((current, maximum) => {
      this.draw(current, maximum);
    });
    this.once("destroy", unsubscribe);
  }

  /**
   * Draws the current state.
   * @param {number} current - The current value.
   * @param {number} maximum - The maximum value.
   * @returns {void} No value is returned.
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
   * Draws background.
   * @returns {void} No value is returned.
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
   * Returns segment width.
   * @param {number} maximum - The maximum value.
   * @returns {number} The resulting numeric value.
   */
  getSegmentWidth(maximum) {
    const settings = this.settings;
    const innerWidth = settings.width - settings.padding * 2;
    const totalGaps = settings.groupGap * 2 + settings.segmentGap * 6;
    return (innerWidth - totalGaps) / maximum;
  }

  /**
   * Draws segment.
   * @param {number} index - The zero-based item index.
   * @param {boolean} isActive - The is active value.
   * @param {number} segmentWidth - The segment width value.
   * @returns {void} No value is returned.
   */
  drawSegment(index, isActive, segmentWidth) {
    const settings = this.settings;
    const groupIndex = Math.floor(index / 3);
    const x = this.getSegmentX(index, groupIndex, segmentWidth);
    const color = isActive ? settings.phaseColors[groupIndex] :
      settings.emptyColor;
    const alpha = isActive ? 1 : settings.emptyAlpha;
    this.graphics.fillStyle(color, alpha).fillRoundedRect(x, settings.padding,
      segmentWidth, settings.height - settings.padding * 2, 2);
  }

  /**
   * Returns a boss health segment's horizontal position.
   * @param {number} index - The segment index.
   * @param {number} groupIndex - The phase group index.
   * @param {number} segmentWidth - The segment width.
   * @returns {number} The horizontal position.
   */
  getSegmentX(index, groupIndex, segmentWidth) {
    const settings = this.settings;
    const gapCount = index - groupIndex;
    return -settings.width / 2 + settings.padding + index * segmentWidth +
      gapCount * settings.segmentGap + groupIndex * settings.groupGap;
  }
}
