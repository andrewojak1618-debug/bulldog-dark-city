import Phaser from "phaser";
import { Bulldog } from "../../entities/characters/bulldog.class.js";
import { InputSystem } from "../../input/input-system.class.js";
import { TouchControlSystem } from "../../input/touch-control-system.class.js";
import { BulldogAnimationSystem } from "../../systems/bulldog-animation-system.class.js";
import { LevelTwoEnvironmentSystem } from "../../systems/level-two-environment-system.class.js";
import { LevelTwoDroneSystem } from "../../systems/level-two-drone-system.class.js";
import { LevelTwoRocketSystem } from "../../systems/level-two-rocket-system.class.js";
import { LevelTwoObstacleSystem } from "../../systems/level-two-obstacle-system.class.js";
import { EnemyHealthBarSystem } from "../../systems/enemy-health-bar-system.class.js";
import { LevelSceneSystem } from "../../systems/level-scene-system.class.js";
import { LevelItemSystem } from "../../systems/level-item-system.class.js";
import { MutantCatSystem } from "../../systems/mutant-cat-system.class.js";
import { MutantCatRewardSystem } from "../../systems/mutant-cat-reward-system.class.js";
import { DogCatcherAnimationSystem } from "../../systems/dog-catcher-animation-system.class.js";
import { LevelTwoCaptureSystem } from "../../systems/level-two-capture-system.class.js";
import { LevelTwoGameplaySystem } from "../../systems/level-two-gameplay-system.class.js";
import { LevelTwoPreloadSystem } from "../../systems/level-two-preload-system.class.js";
import { LevelThreePreloadSystem } from "../../systems/level-three-preload-system.class.js";
import { setMuteButtonGameMode } from "../controllers/mute-button-controller.class.js";
import { LevelExitSystem } from "../../systems/level-exit-system.class.js";
import { BackgroundMusicSystem } from "../../systems/background-music-system.class.js";
import { LevelMenuHint } from "../../ui/level-menu-hint.class.js";
import {
  BULLDOG_ANIMATION_KEYS,
  BULLDOG_EVENTS,
  BULLDOG_TEXTURES,
} from "../../../js/config/bulldog-animation-settings.js";
import { LEVEL_MUSIC } from "../../../js/config/level-music-settings.js";
import { SCENES } from "../../../js/config/game-settings.js";
import { LEVEL_TWO } from "../../../js/config/level-two-settings.js";

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
    LevelSceneSystem.initialize(this, data);
    this.isLevelCompleting = false;
  }

  /**
   * Lädt Spielfigur, Umgebung und Hindernisse des zweiten Levels.
   * @returns {void}
   */
  preload() {
    if (!LevelTwoPreloadSystem.isReady(this)) {
      LevelTwoPreloadSystem.queue(this);
    }
  }

  /**
   * Baut das zweite Level in seiner fachlichen Reihenfolge auf.
   * @returns {void}
   */
  create() {
    setMuteButtonGameMode(true);
    this.createWorldContent();
    this.createGameplayActors();
    this.createGameplayServices();
    this.menuHint = new LevelMenuHint(this, 2);
    LevelSceneSystem.bindMenuShortcut(this);
    this.prepareLevelTransition();
    LevelTwoPreloadSystem.completeEntry(this);
  }

  /** Bereitet Level drei im Hintergrund auf den späteren Wechsel vor. */
  prepareLevelTransition() {
    this.levelThreeAssetsReady =
      LevelThreePreloadSystem.preloadAfterEntry(this);
  }

  /** Erstellt Umgebung, Ausgang und kollidierbare Levelobjekte. */
  createWorldContent() {
    this.configureWorld();
    LevelTwoEnvironmentSystem.create(this);
    this.drones = LevelTwoDroneSystem.create(this);
    EnemyHealthBarSystem.attachDrones(this, this.drones);
    this.levelExit = LevelExitSystem.create(this);
    this.createGroundCollision();
    this.createObstacles();
  }

  /** Erstellt Gegner, Spielfigur und zugehörige Animationen. */
  createGameplayActors() {
    this.mutantCats = MutantCatSystem.create(this, this.platforms);
    EnemyHealthBarSystem.attachMutantCats(this, this.mutantCats);
    BulldogAnimationSystem.register(this);
    DogCatcherAnimationSystem.register(this);
    this.createPlayer();
  }

  /** Verknüpft Kamera, HUD, Items, Treffer und Belohnungen. */
  createGameplayServices() {
    this.createBackgroundMusic();
    this.captureSystem = new LevelTwoCaptureSystem(this);
    LevelSceneSystem.configureCamera(this);
    LevelSceneSystem.createHud(this);
    this.createItems();
    this.createCombatServices();
  }

  /** Verknüpft Raketenangriffe und Katzenbelohnungen. */
  createCombatServices() {
    this.rocketSystem = new LevelTwoRocketSystem(
      this,
      this.drones,
      this.player,
      this.platforms,
      this.healthSystem,
    );
    MutantCatRewardSystem.create(
      this,
      this.player,
      this.healthSystem,
      this.collectibleSystem,
      this.mutantCats,
    );
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
    this.touchControls = TouchControlSystem.create(
      this,
      this.inputSystem,
      this.player,
    );
    this.physics.add.collider(this.player, this.platforms);
    this.alignPlayerWithGround();
    return this.player;
  }

  /**
   * Startet die Level-2-Musik und blendet sie beim K.-o. weich aus.
   * @returns {void}
   */
  createBackgroundMusic() {
    this.backgroundMusic = new BackgroundMusicSystem(this);
    this.backgroundMusic.play(LEVEL_MUSIC.levelTwo);
    this.player.once(BULLDOG_EVENTS.knockedOut, () => {
      this.backgroundMusic.fadeOutAndStop(LEVEL_MUSIC.levelTwo.fadeOutMs);
    });
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
    const verticalCorrection = targetFeetY - playerFeetY;
    this.player.y += verticalCorrection;
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

  /** Erstellt die zentral konfigurierten Sammelobjekte von Level zwei. */
  createItems() {
    this.levelItems = LevelItemSystem.create(
      this,
      this.player,
      this.healthSystem,
      this.collectibleSystem,
      LEVEL_TWO.itemPlacements,
    );
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
      LevelTwoObstacleSystem.createFloatingLightPlatforms(this, this.platforms);
  }

  /**
   * Berechnet die sichtbare Laufkante der Level-2-Bodenebene zentral.
   * @returns {number} Vertikale Position der Laufkante in Weltkoordinaten.
   */
  getGroundSurfaceY() {
    const ground = LEVEL_TWO.groundPlatform;
    const scale = ground.displayHeight / ground.frameHeight;
    const visualTop = ground.bottomY - ground.displayHeight;

    return (
      visualTop + ground.surfaceOffsetY * scale + ground.playerGroundOffsetY
    );
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

  /** Sichert den Levelstand und startet den vorbereiteten dritten Abschnitt. */
  completeLevel() {
    if (this.isLevelCompleting) return;
    this.isLevelCompleting = true;
    const playerState = this.createPlayerStateSnapshot();
    this.backgroundMusic.stop();
    LevelThreePreloadSystem.enterWhenReady(
      this,
      this.levelThreeAssetsReady,
      () => this.startLevelThree(playerState),
    );
  }

  /**
   * Erstellt den levelübergreifenden Zustand der Bulldogge.
   * @returns {{health: number, collectibles: Record<string, number>}}
   * Gespeicherter Lebens- und Sammelstand.
   */
  createPlayerStateSnapshot() {
    return {
      health: this.healthSystem.getCurrent(),
      collectibles: this.collectibleSystem.getSnapshot(),
    };
  }

  /**
   * Startet Level drei mit dem zuvor gesicherten Spielstand.
   * @param {{health: number, collectibles: Record<string, number>}}
   * playerState - Gesicherter Spielstand.
   * @returns {void}
   */
  startLevelThree(playerState) {
    this.scene.start(SCENES.levelThree, {
      playerState,
      enterFromPreviousLevel: true,
    });
  }

  /**
   * Aktualisiert die levelübergreifende Bewegung und Animation der Bulldogge.
   * @param {number} time - Aktuelle Szenenzeit in Millisekunden.
   * @param {number} delta - Vergangene Zeit seit dem letzten Frame in ms.
   * @returns {void}
   */
  update(time, delta) {
    LevelTwoGameplaySystem.update(this, time, delta);
  }
}
