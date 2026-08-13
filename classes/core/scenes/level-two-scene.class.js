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
 * Manages level two scene behavior.
 */
export class LevelTwoScene extends Phaser.Scene {
  /**
   * Creates a new instance.
   */
  constructor() {
    super(SCENES.levelTwo);
  }

  /**
   * Handles init.
   * @param {{playerState?: {health?: number, collectibles?: Record<string, number>}, enterFromPreviousLevel?: boolean}} [data={}] - The data value.
   * @returns {void} No value is returned.
   */
  init(data = {}) {
    LevelSceneSystem.initialize(this, data);
    this.isLevelCompleting = false;
  }

  /**
   * Preloads the current state.
   * @returns {void} No value is returned.
   */
  preload() {
    if (!LevelTwoPreloadSystem.isReady(this)) {
      LevelTwoPreloadSystem.queue(this);
    }
  }

  /**
   * Creates the current state.
   * @returns {void} No value is returned.
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

  /**
   * Handles prepare level transition.
   */
  prepareLevelTransition() {
    this.levelThreeAssetsReady =
      LevelThreePreloadSystem.preloadAfterEntry(this);
  }

  /**
   * Creates world content.
   */
  createWorldContent() {
    this.configureWorld();
    LevelTwoEnvironmentSystem.create(this);
    this.drones = LevelTwoDroneSystem.create(this);
    EnemyHealthBarSystem.attachDrones(this, this.drones);
    this.levelExit = LevelExitSystem.create(this);
    this.createGroundCollision();
    this.createObstacles();
  }

  /**
   * Creates gameplay actors.
   */
  createGameplayActors() {
    this.mutantCats = MutantCatSystem.create(this, this.platforms);
    EnemyHealthBarSystem.attachMutantCats(this, this.mutantCats);
    BulldogAnimationSystem.register(this);
    DogCatcherAnimationSystem.register(this);
    this.createPlayer();
  }

  /**
   * Creates gameplay services.
   */
  createGameplayServices() {
    this.createBackgroundMusic();
    this.captureSystem = new LevelTwoCaptureSystem(this);
    LevelSceneSystem.configureCamera(this);
    LevelSceneSystem.createHud(this);
    this.createItems();
    this.createCombatServices();
  }

  /**
   * Creates combat services.
   */
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
   * Creates player.
   * @returns {Bulldog} The created instance.
   */
  createPlayer() {
    const { startX, startY } = LEVEL_TWO.playerSpawn;
    const playerX = this.isEnteringLevel ? LEVEL_TWO.levelEntry.startX : startX;
    this.player = new Bulldog(this, playerX, startY, BULLDOG_TEXTURES.stand.key);
    this.createPlayerInput();
    this.physics.add.collider(this.player, this.platforms);
    this.alignPlayerWithGround();
    return this.player;
  }

  /**
   * Creates player input and touch controls.
   * @returns {void} No value is returned.
   */
  createPlayerInput() {
    this.inputSystem = new InputSystem(this);
    this.touchControls = TouchControlSystem.create(
      this,
      this.inputSystem,
      this.player,
    );
  }

  /**
   * Creates background music.
   * @returns {void} No value is returned.
   */
  createBackgroundMusic() {
    this.backgroundMusic = new BackgroundMusicSystem(this);
    this.backgroundMusic.play(LEVEL_MUSIC.levelTwo);
    this.player.once(BULLDOG_EVENTS.knockedOut, () => {
      this.backgroundMusic.fadeOutAndStop(LEVEL_MUSIC.levelTwo.fadeOutMs);
    });
  }

  /**
   * Handles align player with ground.
   * @returns {void} No value is returned.
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
   * Updates level entry.
   * @returns {boolean} Whether the requested condition is met.
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
   * Creates items.
   */
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
   * Creates ground collision.
   * @returns {Phaser.Physics.Arcade.StaticGroup} The created instance.
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
   * Creates obstacles.
   * @returns {void} No value is returned.
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
   * Returns ground surface y.
   * @returns {number} The resulting numeric value.
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
   * Configures world.
   * @returns {void} No value is returned.
   */
  configureWorld() {
    const { width, height, backgroundColor } = LEVEL_TWO.world;

    this.physics.world.setBounds(0, 0, width, height);
    this.cameras.main
      .setBounds(0, 0, width, height)
      .setBackgroundColor(backgroundColor);
  }

  /**
   * Completes level.
   */
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
   * Creates player state snapshot.
   * @returns {{health: number, collectibles: Record<string, number>}} The resulting string value.
   */
  createPlayerStateSnapshot() {
    return {
      health: this.healthSystem.getCurrent(),
      collectibles: this.collectibleSystem.getSnapshot(),
    };
  }

  /**
   * Starts level three.
   * @param {{health: number, collectibles: Record<string, number>}} playerState - The player state value.
   * @returns {void} No value is returned.
   */
  startLevelThree(playerState) {
    this.scene.start(SCENES.levelThree, {
      playerState,
      enterFromPreviousLevel: true,
    });
  }

  /**
   * Updates the current state.
   * @param {number} time - The current scene time in milliseconds.
   * @param {number} delta - The elapsed time since the previous frame in milliseconds.
   * @returns {void} No value is returned.
   */
  update(time, delta) {
    LevelTwoGameplaySystem.update(this, time, delta);
  }
}
