import { ENEMY_HEALTH_BAR } from
  "../../js/config/enemy-health-bar-settings.js";

/** Zeigt eine kompakte, weltgebundene Lebensanzeige über einem Gegner. */
export class EnemyHealthBar {
  /**
   * Erstellt und bindet eine Lebensanzeige an ein bewegliches Ziel.
   * @param {Phaser.Scene} scene - Szene des Gegners.
   * @param {Phaser.GameObjects.GameObject} target - Verfolgter Gegner.
   * @param {number} maximum - Maximale Trefferpunkte.
   * @param {() => number} getCurrent - Liefert aktuelle Trefferpunkte.
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
   * Erstellt die Zeichenfläche direkt hinter dem verfolgten Gegner.
   * @returns {Phaser.GameObjects.Graphics} Konfigurierte Zeichenfläche.
   */
  createGraphics() {
    const depth = (this.target.depth ?? 0) +
      ENEMY_HEALTH_BAR.depthOffset;
    return this.scene.add.graphics().setDepth(depth);
  }

  /**
   * Verbindet Aktualisierung und Bereinigung mit dem Szenenlebenszyklus.
   * @returns {void}
   */
  bindLifecycle() {
    const { scene, target } = this;
    scene.events.on("update", this.update, this);
    scene.events.once("shutdown", this.destroy, this);
    target.once("destroy", this.destroy, this);
  }

  /**
   * Begrenzt die Balkenbreite passend zur sichtbaren Gegnergröße.
   * @param {number} targetWidth - Aktuelle Darstellungsbreite des Gegners.
   * @returns {number} Begrenzte Balkenbreite.
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
   * Aktualisiert Sichtbarkeit, Füllung und Position über dem Gegner.
   * @returns {void}
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
   * Zeichnet den Rahmen und den aktuellen grünen Füllstand neu.
   * @param {number} current - Aktuelle Trefferpunkte.
   * @returns {void}
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
   * Berechnet die gemeinsamen Zeichenmaße für den aktuellen Füllstand.
   * @param {number} current - Aktuelle Trefferpunkte.
   * @returns {{x: number, y: number, fillWidth: number}} Zeichenmaße.
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
   * Zeichnet den dunklen Untergrund des Balkens.
   * @param {{x: number, y: number}} layout - Gemeinsame Zeichenmaße.
   * @returns {void}
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
   * Zeichnet die von rechts nach links sinkende grüne Füllung.
   * @param {{x: number, y: number, fillWidth: number}} layout - Zeichenmaße.
   * @returns {void}
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
   * Zeichnet den kontrastreichen äußeren Rahmen.
   * @param {{x: number, y: number}} layout - Gemeinsame Zeichenmaße.
   * @returns {void}
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
   * Entfernt Anzeige und Ereignisbindungen beim Szenenende.
   * @returns {void}
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
