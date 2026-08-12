import {
  DOG_CATCHER,
  DOG_CATCHER_RANGE_DEBUG,
} from "../../js/config/dog-catcher-settings.js";

/**
 * Visualisiert die Hundefänger-Reichweiten ausschließlich lokal im DEV-Modus.
 */
export class DogCatcherRangeDebugSystem {
  /**
   * Erstellt die Diagnose nur für den expliziten Entwicklungsparameter.
   * @param {Phaser.Scene} scene - Zugehörige Spielszene.
   * @param {Phaser.GameObjects.Group} dogCatchers - Gegnergruppe.
   * @param {Phaser.Physics.Arcade.Sprite} player - Kontrollierte Bulldogge.
   * @returns {DogCatcherRangeDebugSystem|null} Aktive Diagnose oder null.
   */
  static create(scene, dogCatchers, player) {
    if (!this.isEnabled()) return null;
    return new DogCatcherRangeDebugSystem(scene, dogCatchers, player);
  }

  /**
   * Prüft Entwicklungsmodus und URL-Schalter ohne Produktionsausgaben.
   * @returns {boolean} Ob die Diagnose aktiv sein darf.
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
   * Baut Grafik, Legende und eine direkt prüfbare Startposition auf.
   * @param {Phaser.Scene} scene - Zugehörige Spielszene.
   * @param {Phaser.GameObjects.Group} dogCatchers - Gegnergruppe.
   * @param {Phaser.Physics.Arcade.Sprite} player - Kontrollierte Bulldogge.
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
   * Erstellt die feste Farblegende außerhalb der Spielweltbewegung.
   * @returns {Phaser.GameObjects.Text} Erzeugte Legende.
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
   * Positioniert die Bulldogge knapp außerhalb der vorderen Sichtgrenze.
   * @param {Phaser.Physics.Arcade.Sprite} player - Kontrollierte Bulldogge.
   * @returns {void}
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
   * Zeichnet die aktuellen Reichweiten aller aktiven Hundefänger neu.
   * @returns {void}
   */
  update() {
    this.graphics.clear();
    this.dogCatchers?.getChildren().forEach((dogCatcher) => {
      if (!dogCatcher.active) return;
      this.drawRanges(dogCatcher);
    });
  }

  /**
   * Zeichnet Sicht-, Rückraum- und Angriffsbereich eines Gegners.
   * @param {import("../entities/enemies/dog-catcher.class.js").DogCatcher}
   * dogCatcher - Zu prüfender Gegner.
   * @returns {void}
   */
  drawRanges(dogCatcher) {
    const settings = DOG_CATCHER_RANGE_DEBUG;
    const direction = dogCatcher.getFacingDirection();
    const groundY = dogCatcher.body?.bottom ?? dogCatcher.y;
    this.drawRange(
      dogCatcher.x,
      direction * DOG_CATCHER.detectionRange,
      groundY - settings.frontOffsetY,
      settings.frontColor,
    );
    this.drawRange(
      dogCatcher.x,
      -direction * DOG_CATCHER.rearDetectionRange,
      groundY - settings.rearOffsetY,
      settings.rearColor,
    );
    this.drawRange(
      dogCatcher.x,
      direction * DOG_CATCHER.attackHitRange,
      groundY - settings.attackOffsetY,
      settings.attackColor,
      true,
    );
  }

  /**
   * Zeichnet einen halbtransparenten Bereich und optional dessen Endmarker.
   * @param {number} startX - Startposition am Gegnerzentrum.
   * @param {number} signedWidth - Gerichtete Breite in Pixeln.
   * @param {number} y - Vertikale Position der Markierung.
   * @param {number} color - Phaser-Farbwert.
   * @param {boolean} [showEndMarker=false] - Ob die Grenze markiert wird.
   * @returns {void}
   */
  drawRange(startX, signedWidth, y, color, showEndMarker = false) {
    const settings = DOG_CATCHER_RANGE_DEBUG;
    const endX = startX + signedWidth;
    const left = Math.min(startX, endX);
    this.graphics.fillStyle(color, settings.areaAlpha);
    this.graphics.fillRect(
      left,
      y - settings.rangeHeight,
      Math.abs(signedWidth),
      settings.rangeHeight,
    );
    this.graphics.lineStyle(2, color, settings.lineAlpha);
    this.graphics.lineBetween(startX, y, endX, y);
    if (!showEndMarker) return;
    this.graphics.lineBetween(
      endX,
      y - settings.markerHeight / 2,
      endX,
      y + settings.markerHeight / 2,
    );
  }

  /**
   * Entfernt alle Diagnoseobjekte beim Szenenwechsel.
   * @returns {void}
   */
  destroy() {
    this.graphics?.destroy();
    this.legend?.destroy();
    this.graphics = null;
    this.legend = null;
  }
}
