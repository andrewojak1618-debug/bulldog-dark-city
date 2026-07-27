import Phaser from "phaser";
import { Bulldog } from "../../entities/characters/bulldog.class.js";
import { InputSystem } from "../../input/input-system.class.js";
import { BulldogAnimationSystem } from
  "../../systems/bulldog-animation-system.class.js";
import { TEST_LEVEL } from "../../../js/config/test-level-settings.js";
import { BULLDOG_TEXTURES } from
  "../../../js/config/bulldog-animation-settings.js";
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
      BULLDOG_TEXTURES.idle,
      BULLDOG_TEXTURES.run,
      BULLDOG_TEXTURES.jump,
      BULLDOG_TEXTURES.land,
    ]);
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
    this.createTechnicalBackground();
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
   * Zeichnet ein technisches Raster zur Orientierung in der Spielwelt.
   * @returns {void}
   */
  createTechnicalBackground() {
    const { width, height, backgroundColor } = TEST_LEVEL.world;
    this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      backgroundColor,
    );
    this.add
      .grid(
        width / 2,
        height / 2,
        width,
        height,
        80,
        80,
        0x0b1220,
        1,
        0x17243a,
        0.5,
      )
      .setDepth(-1);
  }

  /**
   * Erstellt sichtbare statische Flächen mit Arcade-Kollisionen.
   * @returns {void}
   */
  createPlatforms() {
    this.platforms = this.physics.add.staticGroup();
    TEST_LEVEL.platforms.forEach((platformConfig, index) => {
      const platform = this.add.rectangle(
        platformConfig.x,
        platformConfig.y,
        platformConfig.width,
        platformConfig.height,
        index === 0 ? 0x192536 : 0x241b36,
      );
      platform.setStrokeStyle(
        2,
        index === 0 ? 0x35d9a5 : 0xff2cb8,
        0.9,
      );
      this.platforms.add(platform);
    });
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
      BULLDOG_TEXTURES.idle.key,
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
  update() {
    this.player?.updateMovement(this.inputSystem);
    this.positionText?.setText(
      `X ${Math.round(this.player.x)}  Y ${Math.round(this.player.y)}`,
    );
  }
}
