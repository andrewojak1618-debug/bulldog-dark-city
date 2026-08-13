import {
  DOG_CATCHER,
  DOG_CATCHER_RANGE_DEBUG,
} from "../../js/config/dog-catcher-settings.js";

/**
 * Manages dog catcher range debug system behavior.
 */
export class DogCatcherRangeDebugSystem {
  /**
   * Creates the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.GameObjects.Group} dogCatchers - The dog catchers value.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @returns {DogCatcherRangeDebugSystem|null} The created instance.
   */
  static create(scene, dogCatchers, player) {
    if (!this.isEnabled()) return null;
    return new DogCatcherRangeDebugSystem(scene, dogCatchers, player);
  }

  /**
   * Checks the enabled condition.
   * @returns {boolean} Whether the requested condition is met.
   */
  static isEnabled() {
    if (import.meta.env?.DEV !== true || typeof window === "undefined") {
      return false;
    }
    const query = new URLSearchParams(window.location.search);
    return query.get(DOG_CATCHER_RANGE_DEBUG.queryParameter)
      === DOG_CATCHER_RANGE_DEBUG.queryValue;
  }

  /**
   * Creates a new instance.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.GameObjects.Group} dogCatchers - The dog catchers value.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   */
  constructor(scene, dogCatchers, player) {
    this.scene = scene;
    this.dogCatchers = dogCatchers;
    this.graphics = scene.add.graphics()
      .setDepth(DOG_CATCHER_RANGE_DEBUG.depth);
    this.legend = this.createLegend();
    this.placePlayerAtDetectionBoundary(player);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
  }

  /**
   * Creates legend.
   * @returns {Phaser.GameObjects.Text} The resulting data object.
   */
  createLegend() {
    const settings = DOG_CATCHER_RANGE_DEBUG;
    return this.scene.add.text(
      settings.legendX,
      settings.legendY,
      settings.legendText,
      {
        fontFamily: "Arial, sans-serif",
        fontSize: "16px",
        color: "#ffffff",
        backgroundColor: "rgba(0, 0, 0, 0.78)",
        padding: { x: 8, y: 6 },
        lineSpacing: 3,
      },
    )
      .setScrollFactor(0)
      .setDepth(settings.legendDepth);
  }

  /**
   * Handles place player at detection boundary.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @returns {void} No value is returned.
   */
  placePlayerAtDetectionBoundary(player) {
    const dogCatcher = this.dogCatchers?.getFirstAlive();
    if (!dogCatcher || !player) return;
    const direction = dogCatcher.getFacingDirection();
    const distance = DOG_CATCHER.detectionRange
      + DOG_CATCHER_RANGE_DEBUG.playerStartPadding;
    player.setX(dogCatcher.x + direction * distance);
  }

  /**
   * Updates the current state.
   * @returns {void} No value is returned.
   */
  update() {
    this.graphics.clear();
    this.dogCatchers?.getChildren().forEach((dogCatcher) => {
      if (!dogCatcher.active) return;
      this.drawRanges(dogCatcher);
    });
  }

  /**
   * Draws ranges.
   * @param {import("../entities/enemies/dog-catcher.class.js").DogCatcher} dogCatcher - The dog catcher instance.
   * @returns {void} No value is returned.
   */
  drawRanges(dogCatcher) {
    const settings = DOG_CATCHER_RANGE_DEBUG;
    const direction = dogCatcher.getFacingDirection();
    const groundY = dogCatcher.body?.bottom ?? dogCatcher.y;
    this.getRangeDefinitions(direction, groundY, settings)
      .forEach((range) => this.drawRange(dogCatcher.x, range));
  }

  /**
   * Returns the debug range definitions.
   * @param {number} direction - The facing direction.
   * @param {number} groundY - The enemy ground position.
   * @param {object} settings - The debug settings.
   * @returns {object[]} The debug range definitions.
   */
  getRangeDefinitions(direction, groundY, settings) {
    return [
      { width: direction * DOG_CATCHER.detectionRange,
        y: groundY - settings.frontOffsetY, color: settings.frontColor },
      { width: -direction * DOG_CATCHER.rearDetectionRange,
        y: groundY - settings.rearOffsetY, color: settings.rearColor },
      { width: direction * DOG_CATCHER.attackHitRange,
        y: groundY - settings.attackOffsetY, color: settings.attackColor,
        showEndMarker: true },
    ];
  }

  /**
   * Draws range.
   * @param {number} startX - The start x value.
   * @param {object} range - The range definition.
   * @returns {void} No value is returned.
   */
  drawRange(startX, range) {
    const settings = DOG_CATCHER_RANGE_DEBUG;
    const endX = startX + range.width;
    const left = Math.min(startX, endX);
    this.graphics.fillStyle(range.color, settings.areaAlpha);
    this.graphics.fillRect(left, range.y - settings.rangeHeight,
      Math.abs(range.width), settings.rangeHeight);
    this.graphics.lineStyle(2, range.color, settings.lineAlpha);
    this.graphics.lineBetween(startX, range.y, endX, range.y);
    if (range.showEndMarker) this.drawEndMarker(endX, range.y, settings);
  }

  /**
   * Draws an attack range end marker.
   * @param {number} x - The horizontal marker position.
   * @param {number} y - The vertical marker position.
   * @param {object} settings - The debug settings.
   * @returns {void} No value is returned.
   */
  drawEndMarker(x, y, settings) {
    this.graphics.lineBetween(x, y - settings.markerHeight / 2,
      x, y + settings.markerHeight / 2);
  }

  /**
   * Releases the current state.
   * @returns {void} No value is returned.
   */
  destroy() {
    this.graphics?.destroy();
    this.legend?.destroy();
    this.graphics = null;
    this.legend = null;
  }
}
