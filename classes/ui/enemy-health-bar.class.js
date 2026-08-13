import { ENEMY_HEALTH_BAR } from
  "../../js/config/enemy-health-bar-settings.js";

/**
 * Manages enemy health bar behavior.
 */
export class EnemyHealthBar {
  /**
   * Creates a new instance.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.GameObjects.GameObject} target - The target game object.
   * @param {number} maximum - The maximum value.
   * @param {() => number} getCurrent - The get current value.
   */
  constructor(scene, target, maximum, getCurrent) {
    this.scene = scene;
    this.target = target;
    this.maximum = Math.max(1, maximum);
    this.getCurrent = getCurrent;
    this.lastValue = null;
    this.width = this.calculateWidth(target.displayWidth);
    this.graphics = this.createGraphics();
    this.bindLifecycle();
    this.update();
  }

  /**
   * Creates graphics.
   * @returns {Phaser.GameObjects.Graphics} The resulting data object.
   */
  createGraphics() {
    const depth = (this.target.depth ?? 0) +
      ENEMY_HEALTH_BAR.depthOffset;
    return this.scene.add.graphics().setDepth(depth);
  }

  /**
   * Binds lifecycle.
   * @returns {void} No value is returned.
   */
  bindLifecycle() {
    const { scene, target } = this;
    scene.events.on("update", this.update, this);
    scene.events.once("shutdown", this.destroy, this);
    target.once("destroy", this.destroy, this);
  }

  /**
   * Calculates width.
   * @param {number} targetWidth - The target width value.
   * @returns {number} The resulting numeric value.
   */
  calculateWidth(targetWidth) {
    return Math.min(
      ENEMY_HEALTH_BAR.maxWidth,
      Math.max(
        ENEMY_HEALTH_BAR.minWidth,
        targetWidth * ENEMY_HEALTH_BAR.targetWidthRatio,
      ),
    );
  }

  /**
   * Updates the current state.
   * @returns {void} No value is returned.
   */
  update() {
    const current = Math.max(0, this.getCurrent());
    const isVisible = Boolean(
      this.target.active && this.target.visible && current > 0,
    );
    this.graphics.setVisible(isVisible);
    if (!isVisible) return;
    if (current !== this.lastValue) this.draw(current);
    const bounds = this.target.getBounds();
    this.graphics.setPosition(
      bounds.centerX,
      bounds.top + ENEMY_HEALTH_BAR.offsetY,
    );
  }

  /**
   * Draws the current state.
   * @param {number} current - The current value.
   * @returns {void} No value is returned.
   */
  draw(current) {
    const layout = this.getLayout(current);
    this.graphics.clear();
    this.drawBackground(layout);
    this.drawFill(layout);
    this.drawBorder(layout);
    this.lastValue = current;
  }

  /**
   * Returns layout.
   * @param {number} current - The current value.
   * @returns {{x: number, y: number, fillWidth: number}} The resulting numeric value.
   */
  getLayout(current) {
    const settings = ENEMY_HEALTH_BAR;
    const innerWidth = this.width - settings.padding * 2;
    return {
      x: -this.width / 2,
      y: -settings.height,
      fillWidth: innerWidth * Math.min(1, current / this.maximum),
    };
  }

  /**
   * Draws background.
   * @param {{x: number, y: number}} layout - The layout value.
   * @returns {void} No value is returned.
   */
  drawBackground(layout) {
    const settings = ENEMY_HEALTH_BAR;
    this.graphics.fillStyle(
      settings.backgroundColor,
      settings.backgroundAlpha,
    );
    this.graphics.fillRoundedRect(
      layout.x,
      layout.y,
      this.width,
      settings.height,
      settings.radius,
    );
  }

  /**
   * Draws fill.
   * @param {{x: number, y: number, fillWidth: number}} layout - The layout value.
   * @returns {void} No value is returned.
   */
  drawFill(layout) {
    const settings = ENEMY_HEALTH_BAR;
    this.graphics.fillStyle(settings.fillColor, settings.fillAlpha);
    this.graphics.fillRoundedRect(
      layout.x + settings.padding,
      layout.y + settings.padding,
      layout.fillWidth,
      settings.height - settings.padding * 2,
      settings.radius,
    );
  }

  /**
   * Draws border.
   * @param {{x: number, y: number}} layout - The layout value.
   * @returns {void} No value is returned.
   */
  drawBorder(layout) {
    const settings = ENEMY_HEALTH_BAR;
    this.graphics.lineStyle(
      settings.borderWidth,
      settings.borderColor,
      settings.borderAlpha,
    );
    this.graphics.strokeRoundedRect(
      layout.x,
      layout.y,
      this.width,
      settings.height,
      settings.radius,
    );
  }

  /**
   * Releases the current state.
   * @returns {void} No value is returned.
   */
  destroy() {
    this.scene?.events.off("update", this.update, this);
    this.scene?.events.off("shutdown", this.destroy, this);
    this.target?.off("destroy", this.destroy, this);
    this.graphics?.destroy();
    this.scene = null;
    this.target = null;
    this.graphics = null;
  }
}
