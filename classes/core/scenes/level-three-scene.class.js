import Phaser from "phaser";
import { Bulldog } from "../../entities/characters/bulldog.class.js";
import { InputSystem } from "../../input/input-system.class.js";
import { TouchControlSystem } from
  "../../input/touch-control-system.class.js";
import { BulldogAnimationSystem } from
  "../../systems/bulldog-animation-system.class.js";
import { LevelThreeEnvironmentSystem } from
  "../../systems/level-three-environment-system.class.js";
import { LevelThreeObstacleSystem } from
  "../../systems/level-three-obstacle-system.class.js";
import { RobotCatSystem } from "../../systems/robot-cat-system.class.js";
import { RobotCatCombatSystem } from
  "../../systems/robot-cat-combat-system.class.js";
import { ThrowBoneSystem } from "../../systems/throw-bone-system.class.js";
import { BackgroundMusicSystem } from
  "../../systems/background-music-system.class.js";
import { LevelHudSystem } from "../../systems/level-hud-system.class.js";
import { LevelItemSystem } from "../../systems/level-item-system.class.js";
import { HealthSystem } from "../../systems/health-system.class.js";
import { BossPhaseHealthBar } from
  "../../ui/boss-phase-health-bar.class.js";
import { LevelMenuHint } from "../../ui/level-menu-hint.class.js";
import { setMuteButtonGameMode } from
  "../controllers/mute-button-controller.class.js";
import {
  BULLDOG_ANIMATION_KEYS,
  BULLDOG_EVENTS,
  BULLDOG_TEXTURES,
} from "../../../js/config/bulldog-animation-settings.js";
import { SCENES } from "../../../js/config/game-settings.js";
import { LEVEL_THREE } from "../../../js/config/level-three-settings.js";
import { LEVEL_MUSIC } from "../../../js/config/level-music-settings.js";
import { ROBOT_CAT_COMBAT, ROBOT_CAT_DEAD_TEXTURE } from
  "../../../js/config/robot-cat-settings.js";
import { ENDING } from "../../../js/config/ending-settings.js";
import { PLAYER_CAMERA } from
  "../../../js/config/player-camera-settings.js";

/** Stellt das technische Grundgerüst des dritten Levels bereit. */
export class LevelThreeScene extends Phaser.Scene {
  /** Erstellt die Szene mit ihrem zentralen Szenenschlüssel. */
  constructor() {
    super(SCENES.levelThree);
  }

  /**
   * Übernimmt Lebens- und Sammelstände aus Level zwei.
   * @param {object} data - Optionale Zustandsdaten des vorherigen Levels.
   * @returns {void}
   */
  init(data = {}) {
    this.initialPlayerState = data.playerState ?? {};
    this.isEnteringLevel = Boolean(data.enterFromPreviousLevel);
  }

  /**
   * Lädt Bulldogge, HUD und die vollständige Level-3-Umgebung.
   * @returns {void}
   */
  preload() {
    BulldogAnimationSystem.load(this);
    LevelThreeEnvironmentSystem.load(this);
    LevelThreeObstacleSystem.load(this);
    RobotCatSystem.load(this);
    ThrowBoneSystem.load(this);
    LevelHudSystem.load(this);
    LevelItemSystem.load(this);
    BackgroundMusicSystem.load(this, LEVEL_MUSIC.levelThree);
  }

  /**
   * Baut das testbare Level-3-Grundgerüst auf.
   * @returns {void}
   */
  create() {
    setMuteButtonGameMode(true);
    this.configureWorld();
    LevelThreeEnvironmentSystem.create(this);
    this.createGroundCollision();
    this.catBoxes = LevelThreeObstacleSystem.create(
      this,
      this.platforms,
      this.getGroundSurfaceY(),
    );
    this.robotCat = RobotCatSystem.create(
      this,
      this.getGroundSurfaceY(),
    );
    this.createRobotCatHealth();
    BulldogAnimationSystem.register(this);
    this.createPlayer();
    this.createBackgroundMusic();
    this.createHud();
    this.createItems();
    this.throwBoneSystem = ThrowBoneSystem.create(
      this,
      this.player,
      this.robotCat,
      this.robotCatHealth,
      this.inputSystem,
    );
    this.touchControls?.bindThrowInventory(
      this.throwBoneSystem.inventory,
    );
    this.configureCamera();
    this.menuHint = new LevelMenuHint(this, 3);
    this.bindSceneControls();
    this.bindVictoryTransition();
  }

  /**
   * Startet den Endübergang erst nach dem vollständigen Todesablauf.
   * @returns {void}
   */
  bindVictoryTransition() {
    const eventName = Phaser.Animations.Events.ANIMATION_COMPLETE_KEY +
      ROBOT_CAT_DEAD_TEXTURE.animationKey;
    this.robotCat.once(eventName, () => this.startVictoryTransition());
  }

  /**
   * Friert den Kampf ein, blendet Musik und Bild aus und öffnet das Ende.
   * @returns {void}
   */
  startVictoryTransition() {
    if (this.isVictoryStarting) return;
    this.isVictoryStarting = true;
    this.player.setVelocity(0, 0);
    this.physics.pause();
    this.backgroundMusic.fadeOutAndStop(ENDING.transition.fadeToBlackMs);
    this.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
      () => this.scene.start(SCENES.victory),
    );
    this.cameras.main.fadeOut(
      ENDING.transition.fadeToBlackMs,
      0,
      0,
      0,
    );
  }

  /**
   * Erstellt Bulldogge, Steuerung und Bodenverbindung.
   * @returns {void}
   */
  createPlayer() {
    const spawn = LEVEL_THREE.playerSpawn;
    const x = this.isEnteringLevel ? LEVEL_THREE.levelEntry.startX :
      spawn.startX;
    this.player = new Bulldog(
      this,
      x,
      spawn.startY,
      BULLDOG_TEXTURES.stand.key,
    );
    this.inputSystem = new InputSystem(this);
    this.touchControls = TouchControlSystem.create(
      this,
      this.inputSystem,
      this.player,
      { showThrowControls: true },
    );
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(
      this.player,
      this.robotCat.getData("collision"),
      undefined,
      () => RobotCatSystem.canBlockGroundedPlayer(
        this.robotCat,
        this.player,
        this.getGroundSurfaceY(),
      ),
    );
    this.alignPlayerWithGround();
  }

  /**
   * Startet die Bossmusik und blendet sie bei einem Spieler-K.-o. aus.
   * @returns {void}
   */
  createBackgroundMusic() {
    this.backgroundMusic = new BackgroundMusicSystem(this);
    this.backgroundMusic.play(LEVEL_MUSIC.levelThree);
    this.player.once(BULLDOG_EVENTS.knockedOut, () => {
      this.backgroundMusic.fadeOutAndStop(
        LEVEL_MUSIC.levelThree.fadeOutMs,
      );
    });
  }

  /**
   * Setzt die Fußkante ohne sichtbaren Fall auf die Level-3-Laufebene.
   * @returns {void}
   */
  alignPlayerWithGround() {
    const body = this.player.body;
    body?.updateFromGameObject();
    if (!Number.isFinite(body?.bottom)) return;
    const entry = LEVEL_THREE.levelEntry;
    const targetY = this.getGroundSurfaceY() - entry.groundSnapInsetY;
    this.player.y += targetY - body.bottom;
    body.updateFromGameObject();
    body.setVelocityY(entry.groundingVelocityY);
  }

  /**
   * Erstellt die unsichtbare technische Bodenfläche des Grundgerüsts.
   * @returns {void}
   */
  createGroundCollision() {
    const { width } = LEVEL_THREE.world;
    const ground = LEVEL_THREE.groundPlatform;
    const y = this.getGroundSurfaceY() + ground.collisionHeight / 2;
    const body = this.add.rectangle(
      width / 2,
      y,
      width,
      ground.collisionHeight,
    ).setVisible(false);
    this.platforms = this.physics.add.staticGroup();
    this.platforms.add(body);
  }

  /**
   * Gibt die von der sichtbaren Bodenposition unabhängige Laufkante zurück.
   * @returns {number} Vertikale Position der technischen Laufkante.
   */
  getGroundSurfaceY() {
    return LEVEL_THREE.groundPlatform.collisionSurfaceY;
  }

  /**
   * Erstellt HUD und Mutation mit den übernommenen Spielerwerten.
   * @returns {void}
   */
  createHud() {
    const hud = LevelHudSystem.create(
      this,
      this.initialPlayerState,
      this.player,
    );
    this.healthSystem = hud.health;
    this.collectibleSystem = hud.collectibles;
    this.mutationSystem = hud.mutation;
  }

  /**
   * Erstellt das Bossleben und die dreiphasige Anzeige oben im Canvas.
   * @returns {void}
   */
  createRobotCatHealth() {
    this.robotCatHealth = new HealthSystem(ROBOT_CAT_COMBAT.maximumHealth);
    new BossPhaseHealthBar(this, this.robotCatHealth);
  }

  /**
   * Erstellt die zentral positionierten Coins und Seren von Level drei.
   * @returns {void}
   */
  createItems() {
    this.levelItems = LevelItemSystem.create(
      this,
      this.player,
      this.healthSystem,
      this.collectibleSystem,
      LEVEL_THREE.itemPlacements,
    );
  }

  /**
   * Konfiguriert identische Welt- und Kameragrenzen zu Level zwei.
   * @returns {void}
   */
  configureWorld() {
    const world = LEVEL_THREE.world;
    this.physics.world.setBounds(0, 0, world.width, world.height);
    this.cameras.main.setBounds(0, 0, world.width, world.height)
      .setBackgroundColor(world.backgroundColor);
  }

  /**
   * Aktiviert dieselbe weiche Kameraführung und Deadzone wie zuvor.
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
   * Lässt die Bulldogge automatisch vom linken Rand ins Level laufen.
   * @returns {boolean} Ob die normale Steuerung in diesem Frame pausiert.
   */
  updateLevelEntry() {
    if (!this.isEnteringLevel) return false;
    const entry = LEVEL_THREE.levelEntry;
    this.player.setVelocityX(entry.runSpeed);
    this.player.play(BULLDOG_ANIMATION_KEYS.run, true);
    if (this.player.x < entry.targetX) return true;
    this.player.setVelocityX(0);
    this.isEnteringLevel = false;
    return true;
  }

  /**
   * Bindet die Rückkehr zum Hauptmenü an Escape.
   * @returns {void}
   */
  bindSceneControls() {
    this.input.keyboard?.once("keydown-ESC", () => {
      this.scene.start(SCENES.menu);
    });
  }

  /**
   * Aktualisiert Einlauf, Gegnerpatrouille, Mutation und Spielerbewegung.
   * @param {number} time - Vergangene Spielzeit in Millisekunden.
   * @param {number} delta - Zeit seit dem letzten Frame in Millisekunden.
   * @returns {void}
   */
  update(time, delta) {
    if (this.isVictoryStarting) return;
    RobotCatSystem.update(this.robotCat, delta);
    if (this.updateLevelEntry()) return;
    this.mutationSystem?.update(this.inputSystem);
    this.player?.updateMovement(this.inputSystem, time);
    this.throwBoneSystem?.update();
    RobotCatCombatSystem.update(
      this.robotCat,
      this.player,
      this.robotCatHealth,
    );
  }
}
