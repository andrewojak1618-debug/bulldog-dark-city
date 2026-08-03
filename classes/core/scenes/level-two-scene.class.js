import Phaser from "phaser";
import { Bulldog } from "../../entities/characters/bulldog.class.js";
import { InputSystem } from "../../input/input-system.class.js";
import { BulldogAnimationSystem } from
  "../../systems/bulldog-animation-system.class.js";
import { LevelTwoEnvironmentSystem } from
  "../../systems/level-two-environment-system.class.js";
import { LevelTwoObstacleSystem } from
  "../../systems/level-two-obstacle-system.class.js";
import { LevelHudSystem } from "../../systems/level-hud-system.class.js";
import { MutantCatSystem } from "../../systems/mutant-cat-system.class.js";
import { MutantCatRewardSystem } from
  "../../systems/mutant-cat-reward-system.class.js";
import { DogCatcherSystem } from "../../systems/dog-catcher-system.class.js";
import { DogCatcherAnimationSystem } from
  "../../systems/dog-catcher-animation-system.class.js";
import { LevelTwoCaptureSystem } from
  "../../systems/level-two-capture-system.class.js";
import { BULLDOG_ANIMATION_KEYS, BULLDOG_TEXTURES } from
  "../../../js/config/bulldog-animation-settings.js";
import { SCENES } from "../../../js/config/game-settings.js";
import { LEVEL_TWO } from "../../../js/config/level-two-settings.js";
import { PLAYER_CAMERA } from
  "../../../js/config/player-camera-settings.js";

/**
 * Koordiniert Aufbau, Steuerung und Kamera des zweiten Levels.
 */
export class LevelTwoScene extends Phaser.Scene {
  /** Erstellt die Szene mit dem zentral konfigurierten Szenenschlüssel. */
  constructor() {
    super(SCENES.levelTwo);
  }

  /**
   * Übernimmt optional den Spielstand aus Level eins.
   * @param {{playerState?: {health?: number,
   * collectibles?: Record<string, number>},
   * enterFromPreviousLevel?: boolean}} [data={}] - Szenendaten.
   * @returns {void}
   */
  init(data = {}) {
    this.initialPlayerState = data.playerState ?? {};
    this.isEnteringLevel = Boolean(data.enterFromPreviousLevel);
  }

  /**
   * Lädt Spielfigur, Umgebung und Hindernisse des zweiten Levels.
   * @returns {void}
   */
  preload() {
    BulldogAnimationSystem.load(this);
    LevelTwoEnvironmentSystem.load(this);
    LevelTwoObstacleSystem.load(this);
    LevelHudSystem.load(this);
    MutantCatSystem.load(this);
    MutantCatRewardSystem.load(this);
    DogCatcherSystem.load(this);
  }

  /**
   * Baut das zweite Level in seiner fachlichen Reihenfolge auf.
   * @returns {void}
   */
  create() {
    this.configureWorld();
    LevelTwoEnvironmentSystem.create(this);
    this.createGroundCollision();
    this.createObstacles();
    this.mutantCat = MutantCatSystem.create(this, this.platforms);
    BulldogAnimationSystem.register(this);
    DogCatcherAnimationSystem.register(this);
    this.createPlayer();
    this.captureSystem = new LevelTwoCaptureSystem(this, this.platforms);
    this.configureCamera();
    this.createHud();
    MutantCatRewardSystem.create(
      this,
      this.player,
      this.healthSystem,
      this.collectibleSystem,
      this.mutantCat,
    );
    this.createMenuHint();
    this.bindSceneControls();
  }

  /**
   * Erstellt die Bulldogge mit derselben Steuerung wie in Level eins.
   * @returns {Bulldog} Erstellte Spielfigur.
   */
  createPlayer() {
    const { startX, startY } = LEVEL_TWO.playerSpawn;
    const playerX = this.isEnteringLevel ? LEVEL_TWO.levelEntry.startX : startX;

    this.player = new Bulldog(
      this,
      playerX,
      startY,
      BULLDOG_TEXTURES.stand.key,
    );
    this.inputSystem = new InputSystem(this);
    this.physics.add.collider(this.player, this.platforms);
    this.alignPlayerWithGround();
    return this.player;
  }

  /**
   * Setzt die Fußkante ohne sichtbaren Fall exakt auf die Level-2-Straße.
   * @returns {void}
   */
  alignPlayerWithGround() {
    const body = this.player.body;
    body?.updateFromGameObject();
    const playerFeetY = body?.bottom;
    if (!Number.isFinite(playerFeetY)) return;

    const entry = LEVEL_TWO.levelEntry;
    const targetFeetY = this.getGroundSurfaceY() - entry.groundSnapInsetY;
    this.player.y += targetFeetY - playerFeetY;
    body.updateFromGameObject();
    body.setVelocityY(entry.groundingVelocityY);
  }

  /**
   * Lässt die Bulldogge automatisch vom linken Rand ins zweite Level laufen.
   * @returns {boolean} `true`, solange die filmische Einlaufphase aktiv ist.
   */
  updateLevelEntry() {
    if (!this.isEnteringLevel) return false;

    const entry = LEVEL_TWO.levelEntry;
    this.player.setVelocityX(entry.runSpeed);
    this.player.play(BULLDOG_ANIMATION_KEYS.run, true);
    if (this.player.x < entry.targetX) return true;

    this.player.setVelocityX(0);
    this.isEnteringLevel = false;
    return true;
  }

  /**
   * Erstellt die gemeinsame Lebens-, Münz- und Serumanzeige für Level zwei.
   * @returns {void}
   */
  createHud() {
    const hud = LevelHudSystem.create(this, this.initialPlayerState);

    this.healthSystem = hud.health;
    this.collectibleSystem = hud.collectibles;
  }

  /**
   * Verbindet die sichtbare Straßenoberfläche mit einer statischen Hitbox.
   * @returns {Phaser.Physics.Arcade.StaticGroup} Boden-Kollisionsgruppe.
   */
  createGroundCollision() {
    const ground = LEVEL_TWO.groundPlatform;
    const surfaceY = this.getGroundSurfaceY();
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
   * Erstellt alle zentral konfigurierten Hindernisse des Levels.
   * @returns {void}
   */
  createObstacles() {
    LevelTwoObstacleSystem.createNuclearBoxes(
      this,
      this.platforms,
      this.getGroundSurfaceY(),
    );
    this.floatingLightPlatforms =
      LevelTwoObstacleSystem.createFloatingLightPlatforms(
        this,
        this.platforms,
      );
  }

  /**
   * Berechnet die sichtbare Laufkante der Level-2-Bodenebene zentral.
   * @returns {number} Vertikale Position der Laufkante in Weltkoordinaten.
   */
  getGroundSurfaceY() {
    const ground = LEVEL_TWO.groundPlatform;
    const scale = ground.displayHeight / ground.frameHeight;
    const visualTop = ground.bottomY - ground.displayHeight;

    return visualTop +
      ground.surfaceOffsetY * scale +
      ground.playerGroundOffsetY;
  }

  /**
   * Setzt identische Grenzen für Physikwelt und Hauptkamera.
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
    this.cameras.main.startFollow(
      this.player,
      true,
      PLAYER_CAMERA.lerpX,
      PLAYER_CAMERA.lerpY,
    );
    this.cameras.main.setDeadzone(
      PLAYER_CAMERA.deadzoneWidth,
      PLAYER_CAMERA.deadzoneHeight,
    );
  }

  /**
   * Zeigt den vorläufigen Hinweis zum Verlassen der Testszene.
   * @returns {Phaser.GameObjects.Text} Erstellter Menühinweis.
   */
  createMenuHint() {
    const hint = LEVEL_TWO.menuHint;
    return this.add.text(hint.x, hint.y, hint.text, {
      color: hint.color,
      fontFamily: hint.fontFamily,
      fontSize: hint.fontSize,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(hint.depth);
  }

  /**
   * Bindet die vorläufige Rückkehr zum Hauptmenü an Escape.
   * @returns {void}
   */
  bindSceneControls() {
    this.input.keyboard?.once("keydown-ESC", () => {
      this.scene.start(SCENES.menu);
    });
  }

  /**
   * Aktualisiert die levelübergreifende Bewegung und Animation der Bulldogge.
   * @param {number} time - Aktuelle Szenenzeit in Millisekunden.
   * @returns {void}
   */
  update(time) {
    if (this.captureSystem?.isActive) {
      this.captureSystem.update();
      return;
    }

    if (this.updateLevelEntry()) return;

    LevelTwoObstacleSystem.updatePlayerPlatformContact(
      this.player,
      this.floatingLightPlatforms,
    );
    this.player?.updateMovement(this.inputSystem, time);
    const wasKnockedOutByCat = MutantCatSystem.update(
      this.mutantCat,
      this.player,
      this.healthSystem,
      time,
    );
    if (wasKnockedOutByCat) {
      this.captureSystem.start(this.player, this.mutantCat);
    }
  }
}
