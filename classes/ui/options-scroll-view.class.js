import Phaser from "phaser";

/**
 * Manages options scroll view behavior.
 */
export class OptionsScrollView {
  /**
   * Creates a new instance.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.GameObjects.Container} host - The host value.
   * @param {object} settings - The configuration values to use.
   */
  constructor(scene, host, settings) {
    this.scene = scene;
    this.host = host;
    this.settings = settings;
    this.offset = 0;
    this.zone = this.createZone();
    this.content = scene.add.container(settings.x, settings.top);
    this.bar = scene.add.graphics();
    host.add([this.zone, this.content, this.bar]);
    this.createMask();
    this.bindInput();
    this.updatePosition();
  }

  /**
   * Returns viewport height.
   * @returns {number} The resulting numeric value.
   */
  getViewportHeight() {
    return this.settings.bottom - this.settings.top;
  }

  /**
   * Creates zone.
   * @returns {Phaser.GameObjects.Rectangle} The resulting data object.
   */
  createZone() {
    const height = this.getViewportHeight();
    const centerY = this.settings.top + height / 2;
    return this.scene.add.rectangle(
      0, centerY, this.settings.width, height,
      this.settings.interactionColor, this.settings.interactionAlpha,
    ).setInteractive();
  }

  /**
   * Creates mask.
   */
  createMask() {
    const { x, top, width } = this.settings;
    this.maskShape = this.scene.make.graphics({ add: false });
    this.maskShape.fillStyle(this.settings.maskColor).fillRect(
      this.host.x + x, this.host.y + top, width, this.getViewportHeight(),
    );
    this.mask = this.maskShape.createGeometryMask();
    this.content.setMask(this.mask);
  }

  /**
   * Binds input.
   */
  bindInput() {
    this.wheelHandler = (pointer, _objects, _deltaX, deltaY) =>
      this.handleWheel(pointer, deltaY);
    this.moveHandler = (pointer) => this.handleDrag(pointer);
    this.releaseHandler = () => this.stopDrag();
    this.zone.on("pointerdown", (pointer) => this.startDrag(pointer));
    this.scene.input.on("wheel", this.wheelHandler);
    this.scene.input.on("pointermove", this.moveHandler);
    this.scene.input.on("pointerup", this.releaseHandler);
  }

  /**
   * Adds the current state.
   * @param {Phaser.GameObjects.GameObject} gameObject - The game object value.
   * @returns {void} No value is returned.
   */
  add(gameObject) {
    this.content.add(gameObject);
  }

  /**
   * Handles wheel.
   * @param {Phaser.Input.Pointer} pointer - The triggering Phaser pointer.
   * @param {number} deltaY - The delta y value.
   * @returns {void} No value is returned.
   */
  handleWheel(pointer, deltaY) {
    if (!this.contains(pointer)) return;
    this.scrollBy(deltaY * this.settings.wheelFactor);
  }

  /**
   * Starts drag.
   * @param {Phaser.Input.Pointer} pointer - The triggering Phaser pointer.
   * @returns {void} No value is returned.
   */
  startDrag(pointer) {
    this.isDragging = true;
    this.lastPointerY = pointer.y;
  }

  /**
   * Handles drag.
   * @param {Phaser.Input.Pointer} pointer - The triggering Phaser pointer.
   * @returns {void} No value is returned.
   */
  handleDrag(pointer) {
    if (!this.isDragging || !pointer.isDown) return;
    const deltaY = this.lastPointerY - pointer.y;
    this.lastPointerY = pointer.y;
    this.scrollBy(deltaY);
  }

  /**
   * Stops drag.
   */
  stopDrag() {
    this.isDragging = false;
  }

  /**
   * Handles contains.
   * @param {Phaser.Input.Pointer} pointer - The triggering Phaser pointer.
   * @returns {boolean} Whether the requested condition is met.
   */
  contains(pointer) {
    const localX = pointer.x - this.host.x;
    const localY = pointer.y - this.host.y;
    const { x, width, top, bottom } = this.settings;
    return localX >= x && localX <= x + width &&
      localY >= top && localY <= bottom;
  }

  /**
   * Handles scroll by.
   * @param {number} amount - The amount value.
   * @returns {void} No value is returned.
   */
  scrollBy(amount) {
    const nextOffset = this.offset + amount;
    this.offset = Phaser.Math.Clamp(nextOffset, 0, this.getMaxScroll());
    this.updatePosition();
  }

  /**
   * Returns max scroll.
   * @returns {number} The resulting numeric value.
   */
  getMaxScroll() {
    return Math.max(0, this.settings.contentHeight - this.getViewportHeight());
  }

  /**
   * Updates position.
   */
  updatePosition() {
    this.content.y = this.settings.top - this.offset;
    this.drawBar();
  }

  /**
   * Draws bar.
   */
  drawBar() {
    const height = this.getViewportHeight();
    const ratio = height / this.settings.contentHeight;
    const thumbHeight = Math.max(this.settings.minThumbHeight, height * ratio);
    this.renderBar(height, thumbHeight);
  }

  /**
   * Renders bar.
   * @param {number} height - The height in pixels.
   * @param {number} thumbHeight - The thumb height value.
   * @returns {void} No value is returned.
   */
  renderBar(height, thumbHeight) {
    const settings = this.settings;
    const travel = height - thumbHeight;
    const ratio = this.getMaxScroll() ? this.offset / this.getMaxScroll() : 0;
    const thumbY = settings.top + ratio * travel;
    this.bar.clear().fillStyle(settings.trackColor, settings.trackAlpha);
    this.bar.fillRect(settings.barX, settings.top, settings.barWidth, height);
    this.bar.fillStyle(settings.thumbColor, settings.thumbAlpha);
    this.bar.fillRoundedRect(
      settings.barX - settings.thumbPaddingX,
      thumbY,
      settings.barWidth + settings.thumbPaddingX * 2,
      thumbHeight,
      settings.thumbRadius,
    );
  }

  /**
   * Releases the current state.
   */
  destroy() {
    this.scene.input.off("wheel", this.wheelHandler);
    this.scene.input.off("pointermove", this.moveHandler);
    this.scene.input.off("pointerup", this.releaseHandler);
    this.content.clearMask();
    this.mask.destroy();
    this.maskShape.destroy();
  }
}
