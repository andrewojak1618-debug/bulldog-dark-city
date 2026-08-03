import Phaser from "phaser";
import { Bulldog } from "../../entities/characters/bulldog.class.js";
import { InputSystem } from "../../input/input-system.class.js";
import { BulldogAnimationSystem } from
  "../../systems/bulldog-animation-system.class.js";
import { SCENES } from "../../../js/config/game-settings.js";
import { BULLDOG_TEXTURES } from
  "../../../js/config/bulldog-animation-settings.js";
import { PLAYER_CAMERA } from
  "../../../js/config/player-camera-settings.js";
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
    BulldogAnimationSystem.load(this);
    const background = LEVEL_TWO.background;
    const helicopter = LEVEL_TWO.helicopter;
    const skyscrapers = LEVEL_TWO.skyscrapers;
    const industrialMidground = LEVEL_TWO.industrialMidground;
    const elevatedRoads = LEVEL_TWO.elevatedRoads;
    const fenceObjects = LEVEL_TWO.fenceObjects;
    const groundPlatform = LEVEL_TWO.groundPlatform;
    this.load.image(background.key, background.path);
    helicopter.frames.forEach((frame) => {
      this.load.image(frame.key, frame.path);
    });
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
    this.configureWorld();
    this.createMainBackground();
    this.createHelicopter();
    this.createSkyscraperLayer();
    this.createIndustrialMidground();
    this.createElevatedRoads();
    this.createFenceObjects();
    this.createGroundPlatform();
    this.createGroundCollision();
    BulldogAnimationSystem.register(this);
    this.createPlayer();
    this.configureCamera();
    this.add.text(360, 24, "ESC · ZURÜCK ZUM MENÜ", {
      color: "#d7d2dc",
      fontFamily: "Arial",
      fontSize: "14px",
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
    this.input.keyboard?.once("keydown-ESC", () => {
      this.scene.start(SCENES.menu);
    });
  }

  /**
   * Erstellt die Bulldogge mit derselben Steuerung wie in Level eins.
   * @returns {Bulldog} Erstellte Spielfigur.
   */
  createPlayer() {
    const { startX, startY } = LEVEL_TWO.playerSpawn;
    this.player = new Bulldog(
      this,
      startX,
      startY,
      BULLDOG_TEXTURES.stand.key,
    );
    this.inputSystem = new InputSystem(this);
    this.physics.add.collider(this.player, this.platforms);
    return this.player;
  }

  /**
   * Verbindet die sichtbare Straßenoberfläche mit einer statischen Hitbox.
   * @returns {Phaser.Physics.Arcade.StaticGroup} Boden-Kollisionsgruppe.
   */
  createGroundCollision() {
    const ground = LEVEL_TWO.groundPlatform;
    const scale = ground.displayHeight / ground.frameHeight;
    const visualTop = ground.bottomY - ground.displayHeight;
    const surfaceY =
      visualTop + ground.surfaceOffsetY * scale + ground.playerGroundOffsetY;
    const collisionY = surfaceY + ground.collisionHeight / 2;
    const groundBody = this.add.rectangle(
      LEVEL_TWO.world.width / 2,
      collisionY,
      LEVEL_TWO.world.width,
      ground.collisionHeight,
    );

    groundBody.setVisible(false);
    this.platforms = this.physics.add.staticGroup();
    this.platforms.add(groundBody);
    return this.platforms;
  }

  /**
   * Setzt identische Grenzen für die Level-2-Physikwelt und Hauptkamera.
   * @returns {void}
   */
  configureWorld() {
    const { width, height, backgroundColor } = LEVEL_TWO.world;
    this.physics.world.setBounds(0, 0, width, height);
    this.cameras.main
      .setBounds(0, 0, width, height)
      .setBackgroundColor(backgroundColor);
  }

  /**
   * Folgt der Bulldogge mit derselben Dynamik und Deadzone wie Level eins.
   * @returns {void}
   */
  configureCamera() {
    const settings = PLAYER_CAMERA;
    this.cameras.main.startFollow(
      this.player,
      true,
      settings.lerpX,
      settings.lerpY,
    );
    this.cameras.main.setDeadzone(
      settings.deadzoneWidth,
      settings.deadzoneHeight,
    );
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
      .setScrollFactor(0)
      .setDisplaySize(this.scale.width, this.scale.height)
      .setDepth(background.depth);
  }

  /**
   * Erstellt den animierten Katzen-Hubschrauber zwischen Hintergrund und Skyline.
   * @returns {Phaser.GameObjects.Sprite|null} Hubschrauber oder sicherer Fallback.
   */
  createHelicopter() {
    const settings = LEVEL_TWO.helicopter;
    const availableFrames = settings.frames.filter((frame) =>
      this.textures.exists(frame.key),
    );

    if (availableFrames.length === 0) {
      return null;
    }

    const displayWidth =
      settings.frameWidth * (settings.displayHeight / settings.frameHeight);

    if (
      availableFrames.length > 1 &&
      !this.anims.exists(settings.animationKey)
    ) {
      this.anims.create({
        key: settings.animationKey,
        frames: availableFrames.map((frame) => ({ key: frame.key })),
        frameRate: settings.frameRate,
        repeat: -1,
      });
    }

    this.helicopter = this.add
      .sprite(
        this.scale.width + displayWidth / 2 + settings.edgePadding,
        settings.y,
        availableFrames[0].key,
      )
      .setScrollFactor(0)
      .setDisplaySize(displayWidth, settings.displayHeight)
      .setDepth(settings.depth);

    if (availableFrames.length > 1) {
      this.helicopter.play(settings.animationKey);
    }

    this.tweens.add({
      targets: this.helicopter,
      x: -displayWidth / 2 - settings.edgePadding,
      duration: settings.flightDurationMs,
      ease: "Linear",
      repeat: -1,
      repeatDelay: settings.respawnDelayMs,
    });
    this.tweens.add({
      targets: this.helicopter,
      y: settings.y + settings.hoverDistance,
      duration: settings.hoverDurationMs,
      ease: "Sine.inOut",
      yoyo: true,
      repeat: -1,
    });

    return this.helicopter;
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
    const segmentCount =
      Math.ceil((LEVEL_TWO.world.width - layer.startX) / segmentStep) + 1;

    return Array.from({ length: segmentCount }, (_, index) => {
      const frame =
        layer.frameSequence[index % layer.frameSequence.length];

      return this.add
        .image(
          layer.startX + index * segmentStep,
          layer.bottomY,
          layer.key,
          frame,
        )
        .setOrigin(0, 1)
        .setScrollFactor(layer.scrollFactor, layer.scrollFactorY ?? 0)
        .setDisplaySize(displayWidth, layer.displayHeight)
        .setDepth(layer.depth);
    });
  }

  /**
   * Aktualisiert die levelübergreifende Bulldog-Bewegung und Animationen.
   * @param {number} time - Aktuelle Szenenzeit in Millisekunden.
   * @returns {void}
   */
  update(time) {
    this.player?.updateMovement(this.inputSystem, time);
  }
}
