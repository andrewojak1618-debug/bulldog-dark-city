import Phaser from "phaser";
import { Bulldog } from "../../entities/characters/bulldog.class.js";
import { InputSystem } from "../../input/input-system.class.js";
import { TouchControlSystem } from "../../input/touch-control-system.class.js";
import { BulldogAnimationSystem } from
  "../../systems/bulldog-animation-system.class.js";
import { LevelThreeEnvironmentSystem } from
  "../../systems/level-three-environment-system.class.js";
import { LevelThreeObstacleSystem } from
  "../../systems/level-three-obstacle-system.class.js";
import { RobotCatSystem } from "../../systems/robot-cat-system.class.js";
import { RobotCatCombatSystem } from "../../systems/robot-cat-combat-system.class.js";
import { RobotCatAttackSystem } from "../../systems/robot-cat-attack-system.class.js";
import { RobotCatPhaseSystem } from
  "../../systems/robot-cat-phase-system.class.js";
import { ThrowBoneSystem } from "../../systems/throw-bone-system.class.js";
import { BackgroundMusicSystem } from "../../systems/background-music-system.class.js";
import { LevelSceneSystem } from "../../systems/level-scene-system.class.js";
import { LevelThreePreloadSystem } from
  "../../systems/level-three-preload-system.class.js";
import { LevelItemSystem } from "../../systems/level-item-system.class.js";
import { HealthSystem } from "../../systems/health-system.class.js";
import { BossPhaseHealthBar } from "../../ui/boss-phase-health-bar.class.js";
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

/**
 * Manages level three scene behavior.
 */
export class LevelThreeScene extends Phaser.Scene {
  /**
   * Creates a new instance.
   */
  constructor() {
    super(SCENES.levelThree);
  }

  /**
   * Handles init.
   * @param {object} data - The data value.
   * @returns {void} No value is returned.
   */
  init(data = {}) {
    LevelSceneSystem.initialize(this, data);
  }

  /**
   * Preloads the current state.
   * @returns {void} No value is returned.
   */
  preload() {
    if (!LevelThreePreloadSystem.isReady(this)) {
      LevelThreePreloadSystem.queue(this);
    }
  }

  /**
   * Creates the current state.
   * @returns {void} No value is returned.
   */
  create() {
    setMuteButtonGameMode(true);
    this.createLevelWorld();
    this.createBossGameplay();
    this.createLevelInterface();
    this.bindVictoryTransition();
    LevelThreePreloadSystem.completeEntry(this);
  }

  /**
   * Creates level world.
   * @returns {void} No value is returned.
   */
  createLevelWorld() {
    this.configureWorld();
    LevelThreeEnvironmentSystem.create(this);
    this.createGroundCollision();
    this.catBoxes = LevelThreeObstacleSystem.create(
      this,
      this.platforms,
      this.getGroundSurfaceY(),
    );
  }

  /**
   * Creates boss gameplay.
   * @returns {void} No value is returned.
   */
  createBossGameplay() {
    this.createBossCharacter();
    this.createPlayerGameplay();
    this.createBossCombat();
  }

  /**
   * Creates the robot cat and its health system.
   * @returns {void} No value is returned.
   */
  createBossCharacter() {
    this.robotCat = RobotCatSystem.create(this, this.getGroundSurfaceY());
    this.createRobotCatHealth();
  }

  /**
   * Creates the player and level HUD.
   * @returns {void} No value is returned.
   */
  createPlayerGameplay() {
    BulldogAnimationSystem.register(this);
    this.createPlayer();
    this.createBackgroundMusic();
    LevelSceneSystem.createHud(this);
  }

  /**
   * Creates robot cat attacks and player throwing bones.
   * @returns {void} No value is returned.
   */
  createBossCombat() {
    this.robotCatAttackSystem = RobotCatAttackSystem.create(
      this,
      this.robotCat,
      this.player,
      this.healthSystem,
      this.platforms,
    );
    this.createThrowBoneSystem();
  }

  /**
   * Creates throw bone system.
   * @returns {void} No value is returned.
   */
  createThrowBoneSystem() {
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
  }

  /**
   * Creates level interface.
   * @returns {void} No value is returned.
   */
  createLevelInterface() {
    LevelSceneSystem.configureCamera(this);
    this.menuHint = new LevelMenuHint(this, 3);
    LevelSceneSystem.bindMenuShortcut(this);
  }

  /**
   * Binds victory transition.
   * @returns {void} No value is returned.
   */
  bindVictoryTransition() {
    const eventName = Phaser.Animations.Events.ANIMATION_COMPLETE_KEY +
      ROBOT_CAT_DEAD_TEXTURE.animationKey;
    this.robotCat.once(eventName, () => this.startVictoryTransition());
  }

  /**
   * Starts victory transition.
   * @returns {void} No value is returned.
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
   * Creates player.
   * @returns {void} No value is returned.
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
    this.createPlayerControls();
    this.bindPlayerPhysics();
    this.alignPlayerWithGround();
  }

  /**
   * Creates player controls.
   * @returns {void} No value is returned.
   */
  createPlayerControls() {
    this.inputSystem = new InputSystem(this);
    this.touchControls = TouchControlSystem.create(
      this,
      this.inputSystem,
      this.player,
      { showThrowControls: true },
    );
  }

  /**
   * Binds player physics.
   * @returns {void} No value is returned.
   */
  bindPlayerPhysics() {
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
    this.player.onceKnockOutComplete(() => {
      this.scene.start(SCENES.gameOver);
    });
  }

  /**
   * Creates background music.
   * @returns {void} No value is returned.
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
   * Handles align player with ground.
   * @returns {void} No value is returned.
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
   * Creates ground collision.
   * @returns {void} No value is returned.
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
   * Returns ground surface y.
   * @returns {number} The resulting numeric value.
   */
  getGroundSurfaceY() {
    return LEVEL_THREE.groundPlatform.collisionSurfaceY;
  }

  /**
   * Creates robot cat health.
   * @returns {void} No value is returned.
   */
  createRobotCatHealth() {
    this.robotCatHealth = new HealthSystem(ROBOT_CAT_COMBAT.maximumHealth);
    this.robotCatPhaseSystem = RobotCatPhaseSystem.attach(
      this.robotCat,
      this.robotCatHealth,
    );
    new BossPhaseHealthBar(this, this.robotCatHealth);
  }

  /**
   * Creates items.
   * @returns {void} No value is returned.
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
   * Configures world.
   * @returns {void} No value is returned.
   */
  configureWorld() {
    const world = LEVEL_THREE.world;
    this.physics.world.setBounds(0, 0, world.width, world.height);
    this.cameras.main.setBounds(0, 0, world.width, world.height)
      .setBackgroundColor(world.backgroundColor);
  }

  /**
   * Updates level entry.
   * @returns {boolean} Whether the requested condition is met.
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
   * Updates the current state.
   * @param {number} time - The current scene time in milliseconds.
   * @param {number} delta - The elapsed time since the previous frame in milliseconds.
   * @returns {void} No value is returned.
   */
  update(time, delta) {
    if (this.isVictoryStarting) return;
    this.robotCatAttackSystem?.update(time, delta);
    RobotCatSystem.update(this.robotCat, delta, this.player);
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
