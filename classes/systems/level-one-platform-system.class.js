import { TEST_LEVEL } from "../../js/config/test-level-settings.js";
import { AssetLoaderSystem } from "./asset-loader-system.class.js";

/**
 * Lädt und erzeugt sämtliche Boden- und Plattformflächen von Level eins.
 */
export class LevelOnePlatformSystem {
  /**
   * Lädt die Grafiken der Bodenfläche und erhöhten Plattformen.
   * @param {Phaser.Scene} scene - Aktive Level-1-Szene.
   * @returns {void}
   */
  static load(scene) {
    const ground = TEST_LEVEL.assets.groundPlatform;
    const floating = TEST_LEVEL.assets.floatingPlatform;
    AssetLoaderSystem.loadSpritesheet(scene, ground);
    AssetLoaderSystem.loadSpritesheet(scene, floating);
  }

  /**
   * Erstellt alle Kollisionen und ihre sichtbaren Plattformgrafiken.
   * @param {Phaser.Scene} scene - Aktive Level-1-Szene.
   * @returns {Phaser.Physics.Arcade.StaticGroup} Kollisionsgruppe.
   */
  static create(scene) {
    const platforms = scene.physics.add.staticGroup();
    TEST_LEVEL.platforms.forEach((config, index) => {
      this.createPlatform(scene, platforms, config, index === 0);
    });
    return platforms;
  }

  /**
   * Erstellt eine konfigurierte Plattform mit passender Darstellung.
   * @param {Phaser.Scene} scene - Aktive Level-1-Szene.
   * @param {Phaser.Physics.Arcade.StaticGroup} platforms - Kollisionsgruppe.
   * @param {object} config - Plattformkonfiguration.
   * @param {boolean} isGround - Kennzeichnet die durchgehende Bodenfläche.
   * @returns {void}
   */
  static createPlatform(scene, platforms, config, isGround) {
    const hasVisual = Number.isInteger(config.visualFrame);
    const edgeInset = isGround ? 0 : TEST_LEVEL.platformCollision.edgeInset;
    this.getCollisionAreas(config, edgeInset).forEach((area) => {
      this.createCollision(scene, platforms, area, isGround, hasVisual);
    });
    if (isGround) this.createGroundVisual(scene, config);
    if (!isGround && hasVisual) this.createRaisedVisual(scene, config);
  }

  /**
   * Erzeugt eine einzelne unsichtbare oder technische Kollisionsfläche.
   * @param {Phaser.Scene} scene - Aktive Level-1-Szene.
   * @param {Phaser.Physics.Arcade.StaticGroup} platforms - Kollisionsgruppe.
   * @param {{x: number, y: number, width: number, height: number}} area - Fläche.
   * @param {boolean} isGround - Kennzeichnet den Hauptboden.
   * @param {boolean} hasVisual - Kennzeichnet eine vorhandene Plattformgrafik.
   * @returns {void}
   */
  static createCollision(scene, platforms, area, isGround, hasVisual) {
    const debug = TEST_LEVEL.platformDebug;
    const collision = scene.add.rectangle(
      area.x,
      area.y,
      area.width,
      area.height,
      isGround ? debug.groundFillColor : debug.raisedFillColor,
    );
    const strokeColor = isGround ?
      debug.groundStrokeColor : debug.raisedStrokeColor;
    collision.setStrokeStyle(debug.strokeWidth, strokeColor, debug.strokeAlpha);
    collision.setVisible(!isGround && !hasVisual);
    platforms.add(collision);
  }

  /**
   * Berechnet normale oder abgestufte Kollisionsflächen.
   * @param {object} config - Plattformkonfiguration.
   * @param {number} edgeInset - Rücksprung an den äußeren Kanten.
   * @returns {Array<{x: number, y: number, width: number, height: number}>}
   * Kollisionsflächen von links nach rechts.
   */
  static getCollisionAreas(config, edgeInset = 0) {
    if (!config.stepDown) {
      return [{ ...config, width: config.width - edgeInset * 2 }];
    }
    return this.getSteppedCollisionAreas(config, edgeInset);
  }

  /**
   * Teilt eine abgestufte Plattform in zwei Kollisionsflächen.
   * @param {object} config - Plattformkonfiguration mit Abstufung.
   * @param {number} edgeInset - Rücksprung an den äußeren Kanten.
   * @returns {Array<{x: number, y: number, width: number, height: number}>}
   * Angepasste Teilflächen.
   */
  static getSteppedCollisionAreas(config, edgeInset) {
    const { splitRatio, splitOffsetX = 0, dropY } = config.stepDown;
    const leftEdge = config.x - config.width / 2;
    const leftWidth = config.width * splitRatio + splitOffsetX;
    const rightWidth = config.width - leftWidth;
    const areas = [
      this.createArea(leftEdge, leftWidth, config.y, config.height),
      this.createArea(
        leftEdge + leftWidth,
        rightWidth,
        config.y + dropY,
        config.height,
      ),
    ];
    return this.insetOuterEdges(areas, edgeInset);
  }

  /**
   * Erstellt Positionsdaten für eine Kollisionsfläche.
   * @param {number} left - Linke Außenkante.
   * @param {number} width - Breite der Fläche.
   * @param {number} y - Vertikale Mitte.
   * @param {number} height - Höhe der Fläche.
   * @returns {{x: number, y: number, width: number, height: number}} Fläche.
   */
  static createArea(left, width, y, height) {
    return { x: left + width / 2, y, width, height };
  }

  /**
   * Verkürzt ausschließlich die beiden äußeren Plattformenden.
   * @param {Array<{x: number, y: number, width: number, height: number}>} areas - Flächen.
   * @param {number} edgeInset - Rücksprung pro äußerer Kante.
   * @returns {Array<{x: number, y: number, width: number, height: number}>}
   * Flächen mit unveränderten inneren Fallkanten.
   */
  static insetOuterEdges(areas, edgeInset) {
    return areas.map((area, index) => {
      const leftInset = index === 0 ? edgeInset : 0;
      const rightInset = index === areas.length - 1 ? edgeInset : 0;
      return {
        ...area,
        x: area.x + (leftInset - rightInset) / 2,
        width: area.width - leftInset - rightInset,
      };
    });
  }

  /**
   * Verkleidet die Boden-Kollision mit der Straßenplattform.
   * @param {Phaser.Scene} scene - Aktive Level-1-Szene.
   * @param {object} config - Bodenposition und Maße.
   * @returns {void}
   */
  static createGroundVisual(scene, config) {
    const ground = TEST_LEVEL.assets.groundPlatform;
    const platformTop = config.y - config.height / 2;
    const visualTop = platformTop - ground.surfaceOffsetY -
      ground.characterLaneOffsetY;
    const step = ground.frameWidth - ground.seamOverlap;
    const segmentCount = Math.ceil((config.width + ground.seamOverlap) / step);
    const startX = config.x - config.width / 2 - ground.seamOverlap;
    Array.from({ length: segmentCount }, (_, index) => {
      this.createGroundSegment(scene, ground, startX + index * step, visualTop);
    });
  }

  /**
   * Erzeugt ein überlappendes Segment der durchgehenden Bodenplatte.
   * @param {Phaser.Scene} scene - Aktive Level-1-Szene.
   * @param {object} ground - Zentrale Boden-Assetkonfiguration.
   * @param {number} x - Linke Position des Segments.
   * @param {number} y - Obere Position des Segments.
   * @returns {Phaser.GameObjects.Image} Erstelltes Bodensegment.
   */
  static createGroundSegment(scene, ground, x, y) {
    return scene.add.image(x, y, ground.key, ground.frame).setOrigin(0, 0);
  }

  /**
   * Verkleidet eine erhöhte Kollision mit ihrer Plattformvariante.
   * @param {Phaser.Scene} scene - Aktive Level-1-Szene.
   * @param {object} config - Plattformposition, Maße und Grafikframe.
   * @returns {void}
   */
  static createRaisedVisual(scene, config) {
    const floating = TEST_LEVEL.assets.floatingPlatform;
    const scale = config.width / floating.frameWidth;
    const platformTop = config.y - config.height / 2;
    const visualTop = platformTop - floating.surfaceOffsetY * scale;
    scene.add.image(config.x, visualTop, floating.key, config.visualFrame)
      .setOrigin(0.5, 0)
      .setDisplaySize(config.width, floating.frameHeight * scale);
  }
}
