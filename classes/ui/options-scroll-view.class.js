import Phaser from "phaser";

/** Verwaltet einen maskierten UI-Inhalt mit Mausrad- und Touchscrollen. */
export class OptionsScrollView {
  /**
   * Erstellt Scrollzone, Inhalt, Maske und Positionsanzeiger.
   * @param {Phaser.Scene} scene - Zugehörige Szene.
   * @param {Phaser.GameObjects.Container} host - Aufnehmender Dialog.
   * @param {object} settings - Zentrale Scrollwerte.
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

  /** @returns {number} Sichtbare Höhe des Inhaltsbereichs. */
  getViewportHeight() {
    return this.settings.bottom - this.settings.top;
  }

  /**
   * Erstellt die interaktive Fläche für Mausrad und Wischbewegung.
   * @returns {Phaser.GameObjects.Rectangle} Interaktive Scrollfläche.
   */
  createZone() {
    const height = this.getViewportHeight();
    const centerY = this.settings.top + height / 2;
    return this.scene.add.rectangle(
      0, centerY, this.settings.width, height,
      this.settings.interactionColor, this.settings.interactionAlpha,
    ).setInteractive();
  }

  /** Beschränkt bewegliche Inhalte auf den sichtbaren Dialogbereich. */
  createMask() {
    const { x, top, width } = this.settings;
    this.maskShape = this.scene.make.graphics({ add: false });
    this.maskShape.fillStyle(this.settings.maskColor).fillRect(
      this.host.x + x, this.host.y + top, width, this.getViewportHeight(),
    );
    this.mask = this.maskShape.createGeometryMask();
    this.content.setMask(this.mask);
  }

  /** Registriert Mausrad und Touch-Wischen für den Inhaltsbereich. */
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
   * Fügt ein UI-Element dem beweglichen Inhalt hinzu.
   * @param {Phaser.GameObjects.GameObject} gameObject - Neues Element.
   * @returns {void}
   */
  add(gameObject) {
    this.content.add(gameObject);
  }

  /**
   * Scrollt nur, wenn der Zeiger über dem sichtbaren Inhalt steht.
   * @param {Phaser.Input.Pointer} pointer - Aktuelle Zeigerposition.
   * @param {number} deltaY - Vertikale Mausradbewegung.
   * @returns {void}
   */
  handleWheel(pointer, deltaY) {
    if (!this.contains(pointer)) return;
    this.scrollBy(deltaY * this.settings.wheelFactor);
  }

  /**
   * Beginnt eine Wischbewegung innerhalb der Scrollfläche.
   * @param {Phaser.Input.Pointer} pointer - Auslösender Zeiger.
   * @returns {void}
   */
  startDrag(pointer) {
    this.isDragging = true;
    this.lastPointerY = pointer.y;
  }

  /**
   * Überträgt eine gehaltene Wischbewegung auf den Inhalt.
   * @param {Phaser.Input.Pointer} pointer - Bewegter Zeiger.
   * @returns {void}
   */
  handleDrag(pointer) {
    if (!this.isDragging || !pointer.isDown) return;
    const deltaY = this.lastPointerY - pointer.y;
    this.lastPointerY = pointer.y;
    this.scrollBy(deltaY);
  }

  /** Beendet eine aktive Wischbewegung. */
  stopDrag() {
    this.isDragging = false;
  }

  /**
   * Prüft eine Zeigerposition gegen den sichtbaren Bereich.
   * @param {Phaser.Input.Pointer} pointer - Aktuelle Zeigerposition.
   * @returns {boolean} Ob der Zeiger über dem Inhalt steht.
   */
  contains(pointer) {
    const localX = pointer.x - this.host.x;
    const localY = pointer.y - this.host.y;
    const { x, width, top, bottom } = this.settings;
    return localX >= x && localX <= x + width &&
      localY >= top && localY <= bottom;
  }

  /**
   * Verschiebt den Inhalt innerhalb seiner erlaubten Grenzen.
   * @param {number} amount - Scrollbewegung in Canvaspixeln.
   * @returns {void}
   */
  scrollBy(amount) {
    const nextOffset = this.offset + amount;
    this.offset = Phaser.Math.Clamp(nextOffset, 0, this.getMaxScroll());
    this.updatePosition();
  }

  /** @returns {number} Maximale vertikale Verschiebung des Inhalts. */
  getMaxScroll() {
    return Math.max(0, this.settings.contentHeight - this.getViewportHeight());
  }

  /** Aktualisiert Inhalt und Positionsanzeiger mit demselben Offset. */
  updatePosition() {
    this.content.y = this.settings.top - this.offset;
    this.drawBar();
  }

  /** Zeichnet Spur und proportionalen Positionsanzeiger neu. */
  drawBar() {
    const height = this.getViewportHeight();
    const ratio = height / this.settings.contentHeight;
    const thumbHeight = Math.max(this.settings.minThumbHeight, height * ratio);
    this.renderBar(height, thumbHeight);
  }

  /**
   * Rendert den Scrollbalken an der berechneten Position.
   * @param {number} height - Höhe der Scrollspur.
   * @param {number} thumbHeight - Höhe des Positionsanzeigers.
   * @returns {void}
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

  /** Entfernt Eingaben, Maske und die zugehörigen Anzeigeobjekte. */
  destroy() {
    this.scene.input.off("wheel", this.wheelHandler);
    this.scene.input.off("pointermove", this.moveHandler);
    this.scene.input.off("pointerup", this.releaseHandler);
    this.content.clearMask();
    this.mask.destroy();
    this.maskShape.destroy();
  }
}
