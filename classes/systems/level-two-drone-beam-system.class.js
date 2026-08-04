import { LEVEL_TWO } from "../../js/config/level-two-settings.js";

/** Zeichnet ausschließlich den dynamischen Lichtkegel der großen Drohne. */
export class LevelTwoDroneBeamSystem {
  /**
   * Erstellt den Lichtkegel nur für die dafür konfigurierte Drohne.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @param {object} drone - Konfiguration der Drohnenvariante.
   * @returns {Phaser.GameObjects.Graphics|null} Lichtkegel oder `null`.
   */
  static create(scene, drone) {
    if (!drone.tracksPlayerWithBeam) return null;
    return scene.add.graphics().setDepth(LEVEL_TWO.drones.beamDepth);
  }

  /**
   * Berechnet und zeichnet den aktuellen Lichtkegel zur Bulldogge.
   * @param {Phaser.GameObjects.Sprite} sprite - Lichtquelle.
   * @param {Phaser.Physics.Arcade.Sprite} player - Verfolgtes Ziel.
   * @returns {void}
   */
  static update(sprite, player) {
    const beam = sprite.getData("beam");
    if (!beam) return;
    beam.clear();
    const geometry = this.calculateGeometry(sprite, player);
    if (geometry) this.draw(beam, geometry);
  }

  /**
   * Berechnet Startpunkt, Zielpunkt und seitliche Zielkanten.
   * @param {Phaser.GameObjects.Sprite} sprite - Lichtquelle.
   * @param {Phaser.Physics.Arcade.Sprite} player - Verfolgtes Ziel.
   * @returns {object|null} Geometrie des Lichtkegels oder `null`.
   */
  static calculateGeometry(sprite, player) {
    const targetY = player.body?.center.y ?? player.y;
    const directionX = player.x - sprite.x;
    const directionY = targetY - sprite.y;
    const distance = Math.hypot(directionX, directionY);
    if (distance === 0) return null;
    return this.createGeometry(
      sprite,
      player.x,
      targetY,
      directionX / distance,
      directionY / distance,
    );
  }

  /**
   * Formt aus normierter Richtung die drei Eckpunkte des Lichtkegels.
   * @param {Phaser.GameObjects.Sprite} sprite - Lichtquelle.
   * @param {number} targetX - Horizontale Zielposition.
   * @param {number} targetY - Vertikale Zielposition.
   * @param {number} normalX - Normierte horizontale Richtung.
   * @param {number} normalY - Normierte vertikale Richtung.
   * @returns {object} Vollständige Zeichengeometrie.
   */
  static createGeometry(sprite, targetX, targetY, normalX, normalY) {
    const settings = LEVEL_TWO.drones;
    const halfWidth = settings.beamEndHalfWidth;
    return {
      startX: sprite.x + normalX * settings.beamStartOffset,
      startY: sprite.y + normalY * settings.beamStartOffset,
      targetX,
      targetY,
      edgeX: -normalY * halfWidth,
      edgeY: normalX * halfWidth,
    };
  }

  /**
   * Zeichnet Fläche und Mittellinie anhand der vorbereiteten Geometrie.
   * @param {Phaser.GameObjects.Graphics} beam - Zeichenfläche.
   * @param {object} geometry - Vorbereitete Lichtkegel-Geometrie.
   * @returns {void}
   */
  static draw(beam, geometry) {
    const settings = LEVEL_TWO.drones;
    const { startX, startY, targetX, targetY, edgeX, edgeY } = geometry;
    beam.fillStyle(settings.beamColor, settings.beamFillAlpha);
    beam.fillTriangle(
      startX,
      startY,
      targetX + edgeX,
      targetY + edgeY,
      targetX - edgeX,
      targetY - edgeY,
    );
    beam.lineStyle(2, settings.beamColor, settings.beamLineAlpha);
    beam.lineBetween(startX, startY, targetX, targetY);
  }
}
