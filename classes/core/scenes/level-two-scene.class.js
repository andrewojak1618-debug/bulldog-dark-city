import Phaser from "phaser";
import { SCENES } from "../../../js/config/game-settings.js";
import { LEVEL_TWO } from "../../../js/config/level-two-settings.js";

/**
 * Bestätigt vorläufig den erfolgreichen Übergang aus Level eins.
 */
export class LevelTwoScene extends Phaser.Scene {
  /** Erstellt die Platzhalterszene mit eindeutigem Szenenschlüssel. */
  constructor() {
    super(SCENES.levelTwo);
  }

  /**
   * Lädt den ersten vorbereiteten Haupthintergrund von Level zwei.
   * @returns {void}
   */
  preload() {
    const background = LEVEL_TWO.background;
    const skyscrapers = LEVEL_TWO.skyscrapers;
    const industrialMidground = LEVEL_TWO.industrialMidground;
    const elevatedRoads = LEVEL_TWO.elevatedRoads;
    const fenceObjects = LEVEL_TWO.fenceObjects;
    const groundPlatform = LEVEL_TWO.groundPlatform;
    this.load.image(background.key, background.path);
    this.load.spritesheet(skyscrapers.key, skyscrapers.path, {
      frameWidth: skyscrapers.frameWidth,
      frameHeight: skyscrapers.frameHeight,
    });
    this.load.spritesheet(
      industrialMidground.key,
      industrialMidground.path,
      {
        frameWidth: industrialMidground.frameWidth,
        frameHeight: industrialMidground.frameHeight,
      },
    );
    this.load.spritesheet(elevatedRoads.key, elevatedRoads.path, {
      frameWidth: elevatedRoads.frameWidth,
      frameHeight: elevatedRoads.frameHeight,
    });
    this.load.spritesheet(fenceObjects.key, fenceObjects.path, {
      frameWidth: fenceObjects.frameWidth,
      frameHeight: fenceObjects.frameHeight,
    });
    this.load.spritesheet(groundPlatform.key, groundPlatform.path, {
      frameWidth: groundPlatform.frameWidth,
      frameHeight: groundPlatform.frameHeight,
    });
  }

  /**
   * Zeigt den bestätigten Levelwechsel bis zum Aufbau von Level zwei.
   * @returns {void}
   */
  create() {
    this.cameras.main.setBackgroundColor(0x080d18);
    this.createMainBackground();
    this.createSkyscraperLayer();
    this.createIndustrialMidground();
    this.createElevatedRoads();
    this.createFenceObjects();
    this.createGroundPlatform();
    this.add.text(360, 220, "LEVEL 2\nWIRD VORBEREITET", {
      align: "center",
      color: "#35d9a5",
      fontFamily: "Arial",
      fontSize: "28px",
    }).setOrigin(0.5);
    this.add.text(360, 300, "ESC · ZURÜCK ZUM MENÜ", {
      color: "#d7d2dc",
      fontFamily: "Arial",
      fontSize: "14px",
    }).setOrigin(0.5);
    this.input.keyboard?.once("keydown-ESC", () => {
      this.scene.start(SCENES.menu);
    });
  }

  /**
   * Füllt das Canvas mit dem ersten grünen Level-2-Haupthintergrund.
   * @returns {Phaser.GameObjects.Image} Erstellter Hintergrund.
   */
  createMainBackground() {
    const background = LEVEL_TWO.background;
    return this.add
      .image(0, 0, background.key)
      .setOrigin(0)
      .setDisplaySize(this.scale.width, this.scale.height)
      .setDepth(background.depth);
  }

  /**
   * Setzt die vier Hochhausvarianten als langsame Parallax-Ebene zusammen.
   * @returns {Phaser.GameObjects.Image[]} Erstellte Hochhaussegmente.
   */
  createSkyscraperLayer() {
    return this.createParallaxSegments(LEVEL_TWO.skyscrapers);
  }

  /**
   * Setzt die Industriegebäude vor die entfernte Hochhauskulisse.
   * @returns {Phaser.GameObjects.Image[]} Erstellte Industrie-Segmente.
   */
  createIndustrialMidground() {
    return this.createParallaxSegments(LEVEL_TWO.industrialMidground);
  }

  /**
   * Setzt die Hochstraßen als vordere Mittelgrund-Ebene zusammen.
   * @returns {Phaser.GameObjects.Image[]} Erstellte Hochstraßen-Segmente.
   */
  createElevatedRoads() {
    return this.createParallaxSegments(LEVEL_TWO.elevatedRoads);
  }

  /**
   * Setzt Zäune und Straßenobjekte als kollisionsfreie Vordergrunddekoration.
   * @returns {Phaser.GameObjects.Image[]} Erstellte Zaunsegmente.
   */
  createFenceObjects() {
    return this.createParallaxSegments(LEVEL_TWO.fenceObjects);
  }

  /**
   * Setzt die vorbereiteten Straßenvarianten als visuelle Bodenebene zusammen.
   * @returns {Phaser.GameObjects.Image[]} Erstellte Bodensegmente.
   */
  createGroundPlatform() {
    return this.createParallaxSegments(LEVEL_TWO.groundPlatform);
  }

  /**
   * Baut eine konfigurierte Parallax-Ebene aus gleich großen Einzelbildern.
   * @param {object} layer Zentrale Einstellungen der zu erzeugenden Ebene.
   * @returns {Phaser.GameObjects.Image[]} Erstellte Bildsegmente.
   */
  createParallaxSegments(layer) {
    const displayWidth =
      layer.frameWidth * (layer.displayHeight / layer.frameHeight);
    const segmentStep = displayWidth - layer.seamOverlap;

    return layer.frameSequence.map((frame, index) =>
      this.add
        .image(
          layer.startX + index * segmentStep,
          layer.bottomY,
          layer.key,
          frame,
        )
        .setOrigin(0, 1)
        .setScrollFactor(layer.scrollFactor, 0)
        .setDisplaySize(displayWidth, layer.displayHeight)
        .setDepth(layer.depth),
    );
  }
}
