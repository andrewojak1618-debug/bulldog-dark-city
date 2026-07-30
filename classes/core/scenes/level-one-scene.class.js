import Phaser from "phaser";
import { Bulldog } from "../../entities/characters/bulldog.class.js";
import { InputSystem } from "../../input/input-system.class.js";
import { BulldogAnimationSystem } from "../../systems/bulldog-animation-system.class.js";
import { LevelEnvironmentSystem } from "../../systems/level-environment-system.class.js";
import { TEST_LEVEL } from "../../../js/config/test-level-settings.js";
import { BULLDOG_TEXTURES } from "../../../js/config/bulldog-animation-settings.js";
import { SCENES } from "../../../js/config/game-settings.js";

/**
 * Stellt den technischen Prototyp des ersten Levels bereit.
 */
export class LevelOneScene extends Phaser.Scene {
  /**
   * Erstellt Level eins mit seinem eindeutigen Szenenschlüssel.
   */
  constructor() {
    super(SCENES.levelOne);
  }

  /**
   * Lädt die aktuell benötigten Bulldog-Spritesheets.
   * @returns {void}
   */
  preload() {
    this.loadBulldogSpritesheets([
      BULLDOG_TEXTURES.stand,
      BULLDOG_TEXTURES.sit,
      BULLDOG_TEXTURES.waitBreathe,
      BULLDOG_TEXTURES.run,
      BULLDOG_TEXTURES.jump,
      BULLDOG_TEXTURES.fall,
      BULLDOG_TEXTURES.land,
    ]);
    this.loadLevelAssets();
  }

  /**
   * Lädt die aktuell im Testlevel verwendeten Umgebungsgrafiken.
   * @returns {void}
   */
  loadLevelAssets() {
    const ground = TEST_LEVEL.assets.groundPlatform;
    const floating = TEST_LEVEL.assets.floatingPlatform;
    LevelEnvironmentSystem.load(this);
    this.load.spritesheet(ground.key, ground.path, {
      frameWidth: ground.frameWidth,
      frameHeight: ground.frameHeight,
    });
    this.load.spritesheet(floating.key, floating.path, {
      frameWidth: floating.frameWidth,
      frameHeight: floating.frameHeight,
    });
  }

  /**
   * Registriert Bulldog-Spritesheets mit ihren zentralen Framewerten.
   * @param {ReadonlyArray<{
   *   key: string,
   *   path: string,
   *   frameWidth: number,
   *   frameHeight: number
   * }>} textures - Zu ladende Texturdaten.
   * @returns {void}
   */
  loadBulldogSpritesheets(textures) {
    textures.forEach((texture) => {
      this.load.spritesheet(texture.key, texture.path, {
        frameWidth: texture.frameWidth,
        frameHeight: texture.frameHeight,
      });
    });
  }

  /**
   * Baut Testwelt, Plattformen, Spieler, Kamera und Bedienhinweise auf.
   * @returns {void}
   */
  create() {
    this.configureWorld();
    LevelEnvironmentSystem.create(this);
    this.createPlatforms();
    BulldogAnimationSystem.register(this);
    this.createPlayer();
    this.configureCamera();
    this.createDebugOverlay();
    this.bindSceneControls();
    this.cameras.main.fadeIn(260, 0, 0, 0);
  }

  /**
   * Definiert Physics- und Kameragrenzen der Testwelt.
   * @returns {void}
   */
  configureWorld() {
    const { width, height } = TEST_LEVEL.world;
    this.physics.world.setBounds(0, 0, width, height);
    this.cameras.main.setBounds(0, 0, width, height);
  }

  /**
   * Erstellt sichtbare statische Flächen mit Arcade-Kollisionen.
   * @returns {void}
   */
  createPlatforms() {
    this.platforms = this.physics.add.staticGroup();
    TEST_LEVEL.platforms.forEach((platformConfig, index) => {
      const isGround = index === 0;
      const hasPlatformVisual = Number.isInteger(platformConfig.visualFrame);
      const collisionAreas = this.getPlatformCollisionAreas(
        platformConfig,
        isGround ? 0 : TEST_LEVEL.platformCollision.edgeInset,
      );

      collisionAreas.forEach((collisionArea) => {
        const platform = this.add.rectangle(
          collisionArea.x,
          collisionArea.y,
          collisionArea.width,
          collisionArea.height,
          isGround ? 0x192536 : 0x241b36,
        );
        platform.setStrokeStyle(2, isGround ? 0x35d9a5 : 0xff2cb8, 0.9);
        platform.setVisible(!isGround && !hasPlatformVisual);
        this.platforms.add(platform);
      });

      if (isGround) {
        this.createGroundVisual(platformConfig);
      } else if (hasPlatformVisual) {
        this.createRaisedPlatformVisual(platformConfig);
      }
    });
  }

  /**
   * Teilt abgestufte Plattformen in passende Kollisionsflächen auf.
   * @param {{
   *   x: number,
   *   y: number,
   *   width: number,
   *   height: number,
   *   stepDown?: {
   *     splitRatio: number,
   *     splitOffsetX?: number,
   *     dropY: number
   *   }
   * }} platformConfig - Zentrale Plattformkonfiguration.
   * @param {number} edgeInset - Rücksprung an beiden Außenkanten.
   * @returns {Array<{x: number, y: number, width: number, height: number}>}
   * Kollisionsflächen von links nach rechts.
   */
  getPlatformCollisionAreas(platformConfig, edgeInset = 0) {
    if (!platformConfig.stepDown) {
      return [
        {
          ...platformConfig,
          width: platformConfig.width - edgeInset * 2,
        },
      ];
    }

    const { splitRatio, splitOffsetX = 0, dropY } = platformConfig.stepDown;
    const leftEdge = platformConfig.x - platformConfig.width / 2;
    const leftWidth = platformConfig.width * splitRatio + splitOffsetX;
    const rightWidth = platformConfig.width - leftWidth;

    const collisionAreas = [
      {
        x: leftEdge + leftWidth / 2,
        y: platformConfig.y,
        width: leftWidth,
        height: platformConfig.height,
      },
      {
        x: leftEdge + leftWidth + rightWidth / 2,
        y: platformConfig.y + dropY,
        width: rightWidth,
        height: platformConfig.height,
      },
    ];

    return this.insetOuterCollisionEdges(collisionAreas, edgeInset);
  }

  /**
   * Verkürzt nur die äußeren Enden abgestufter Kollisionsflächen.
   * @param {Array<{x: number, y: number, width: number, height: number}>}
   * collisionAreas - Kollisionsflächen von links nach rechts.
   * @param {number} edgeInset - Rücksprung pro äußerer Kante.
   * @returns {Array<{x: number, y: number, width: number, height: number}>}
   * Angepasste Kollisionsflächen mit unveränderter innerer Fallkante.
   */
  insetOuterCollisionEdges(collisionAreas, edgeInset) {
    return collisionAreas.map((area, index) => {
      const isFirst = index === 0;
      const isLast = index === collisionAreas.length - 1;
      const leftInset = isFirst ? edgeInset : 0;
      const rightInset = isLast ? edgeInset : 0;

      return {
        ...area,
        x: area.x + (leftInset - rightInset) / 2,
        width: area.width - leftInset - rightInset,
      };
    });
  }

  /**
   * Verkleidet die Boden-Kollision mit der Cyber-City-Plattformgrafik.
   * @param {{x: number, y: number, width: number, height: number}}
   * platformConfig - Position und Maße der technischen Bodenfläche.
   * @returns {void}
   */
  createGroundVisual(platformConfig) {
    const ground = TEST_LEVEL.assets.groundPlatform;
    const platformTop = platformConfig.y - platformConfig.height / 2;
    const visualTop =
      platformTop - ground.surfaceOffsetY - ground.characterLaneOffsetY;

    this.add
      .tileSprite(
        platformConfig.x,
        visualTop,
        platformConfig.width,
        ground.frameHeight,
        ground.key,
        ground.frame,
      )
      .setOrigin(0.5, 0);
  }

  /**
   * Verkleidet eine erhöhte Kollision mit einer Plattformvariante.
   * @param {{
   *   x: number,
   *   y: number,
   *   width: number,
   *   height: number,
   *   visualFrame: number
   * }} platformConfig - Position, Maße und Grafikframe der Plattform.
   * @returns {void}
   */
  createRaisedPlatformVisual(platformConfig) {
    const floating = TEST_LEVEL.assets.floatingPlatform;
    const scale = platformConfig.width / floating.frameWidth;
    const platformTop = platformConfig.y - platformConfig.height / 2;
    const visualTop = platformTop - floating.surfaceOffsetY * scale;

    this.add
      .image(
        platformConfig.x,
        visualTop,
        floating.key,
        platformConfig.visualFrame,
      )
      .setOrigin(0.5, 0)
      .setDisplaySize(platformConfig.width, floating.frameHeight * scale);
  }

  /**
   * Erstellt die Spielfigur und verbindet sie mit den Plattformen.
   * @returns {void}
   */
  createPlayer() {
    const settings = TEST_LEVEL.player;
    this.player = new Bulldog(
      this,
      settings.startX,
      settings.startY,
      BULLDOG_TEXTURES.stand.key,
    );
    this.inputSystem = new InputSystem(this);
    this.physics.add.collider(this.player, this.platforms);
  }

  /**
   * Lässt die Kamera weich innerhalb der Weltgrenzen folgen.
   * @returns {void}
   */
  configureCamera() {
    const settings = TEST_LEVEL.camera;
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
   * Zeigt Steuerung und Status unabhängig von der Kameraposition an.
   * @returns {void}
   */
  createDebugOverlay() {
    this.add
      .text(
        18,
        16,
        "TECHNISCHER TESTLEVEL\nA/D oder ←/→ · Bewegung\nW, ↑ oder Leertaste · Sprung\nESC · Menü",
        {
          fontFamily: "Arial",
          fontSize: "13px",
          color: "#d7d2dc",
          backgroundColor: "rgba(4, 6, 12, 0.82)",
          padding: { x: 10, y: 8 },
          lineSpacing: 4,
        },
      )
      .setScrollFactor(0)
      .setDepth(100);
    this.positionText = this.add
      .text(702, 18, "", {
        fontFamily: "Arial",
        fontSize: "12px",
        color: "#35d9a5",
        backgroundColor: "rgba(4, 6, 12, 0.82)",
        padding: { x: 8, y: 6 },
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(100);
  }

  /**
   * Bindet die Rückkehr zum Hauptmenü.
   * @returns {void}
   */
  bindSceneControls() {
    this.input.keyboard?.once("keydown-ESC", () =>
      this.scene.start(SCENES.menu),
    );
  }

  /**
   * Aktualisiert Spielerbewegung und technische Positionsanzeige.
   * @returns {void}
   */
  update(_time, delta) {
    this.player?.updateMovement(this.inputSystem);
    LevelEnvironmentSystem.update(this, delta);
    this.positionText?.setText(
      `X ${Math.round(this.player.x)}  Y ${Math.round(this.player.y)}`,
    );
  }
}
