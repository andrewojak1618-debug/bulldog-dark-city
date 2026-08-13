import Phaser from "phaser";
import { Bulldog } from "../../entities/characters/bulldog.class.js";
import { InputSystem } from "../../input/input-system.class.js";
import { TouchControlSystem } from
  "../../input/touch-control-system.class.js";
import { BulldogAnimationSystem } from "../../systems/bulldog-animation-system.class.js";
import { DogCatcherAnimationSystem } from
  "../../systems/dog-catcher-animation-system.class.js";
import { DogCatcherSystem } from "../../systems/dog-catcher-system.class.js";
import { DogCatcherRangeDebugSystem } from
  "../../systems/dog-catcher-range-debug-system.class.js";
import { EnemyHealthBarSystem } from
  "../../systems/enemy-health-bar-system.class.js";
import { LevelHudSystem } from "../../systems/level-hud-system.class.js";
import { LevelItemSystem } from "../../systems/level-item-system.class.js";
import { LevelExitSystem } from "../../systems/level-exit-system.class.js";
import { BackgroundMusicSystem } from
  "../../systems/background-music-system.class.js";
import { LevelEnvironmentSystem } from "../../systems/level-environment-system.class.js";
import { LevelOnePlatformSystem } from
  "../../systems/level-one-platform-system.class.js";
import { LevelOnePreloadSystem } from
  "../../systems/level-one-preload-system.class.js";
import { LevelTwoPreloadSystem } from
  "../../systems/level-two-preload-system.class.js";
import { LevelMenuHint } from "../../ui/level-menu-hint.class.js";
import { setMuteButtonGameMode, setMuteButtonVisibility } from
  "../controllers/mute-button-controller.class.js";
import { TEST_LEVEL } from "../../../js/config/test-level-settings.js";
import {
  BULLDOG_EVENTS,
  BULLDOG_TEXTURES,
} from "../../../js/config/bulldog-animation-settings.js";
import { LEVEL_MUSIC } from "../../../js/config/level-music-settings.js";
import { SCENES } from "../../../js/config/game-settings.js";
import { PLAYER_CAMERA } from
  "../../../js/config/player-camera-settings.js";
import { LEVEL_ITEMS } from "../../../js/config/level-item-settings.js";

/**
 * Manages level one scene behavior.
 */
export class LevelOneScene extends Phaser.Scene {
  /**
   * Creates a new instance.
   */
  constructor() {
    super(SCENES.levelOne);
  }

  /**
   * Handles init.
   * @returns {void} No value is returned.
   */
  init() {
    this.isLevelCompleting = false;
  }

  /**
   * Preloads the current state.
   * @returns {void} No value is returned.
   */
  preload() {
    if (!LevelOnePreloadSystem.isReady(this)) {
      LevelOnePreloadSystem.queue(this);
    }
  }

  /**
   * Creates the current state.
   * @returns {void} No value is returned.
   */
  create() {
    setMuteButtonGameMode(true);
    setMuteButtonVisibility(true);
    this.createLevelWorld();
    this.createLevelGameplay();
    this.createLevelInterface();
    this.prepareLevelTransition();
    LevelOnePreloadSystem.completeEntry(this);
  }

  /**
   * Creates level world.
   * @returns {void} No value is returned.
   */
  createLevelWorld() {
    this.configureWorld();
    LevelEnvironmentSystem.create(this);
    this.platforms = LevelOnePlatformSystem.create(this);
    BulldogAnimationSystem.register(this);
    DogCatcherAnimationSystem.register(this);
  }

  /**
   * Creates level gameplay.
   * @returns {void} No value is returned.
   */
  createLevelGameplay() {
    this.createPlayer();
    this.createBackgroundMusic();
    this.dogCatchers = DogCatcherSystem.create(this, this.platforms);
    this.dogCatcherRangeDebug = DogCatcherRangeDebugSystem.create(
      this,
      this.dogCatchers,
      this.player,
    );
    EnemyHealthBarSystem.attachDogCatchers(this, this.dogCatchers);
    this.levelExit = LevelExitSystem.create(this);
    DogCatcherSystem.onceDefeated(
      this.dogCatchers,
      () => this.completeFirstCombat(),
    );
  }

  /**
   * Creates level interface.
   * @returns {void} No value is returned.
   */
  createLevelInterface() {
    this.configureCamera();
    const hud = LevelHudSystem.create(this, {}, this.player);
    this.healthSystem = hud.health;
    this.collectibleSystem = hud.collectibles;
    this.mutationSystem = hud.mutation;
    this.menuHint = new LevelMenuHint(this, 1);
    this.levelItems = LevelItemSystem.create(
      this,
      this.player,
      this.healthSystem,
      this.collectibleSystem,
    );
    this.createMovementInfoPopup();
    this.bindSceneControls();
  }

  /**
   * Completes first combat.
   * @returns {void} No value is returned.
   */
  completeFirstCombat() {
    this.levelExit.unlock();
    LevelItemSystem.addPlacements(
      this,
      this.levelItems,
      LEVEL_ITEMS.placements.afterFirstCombat,
    );
  }

  /**
   * Handles prepare level transition.
   * @returns {void} No value is returned.
   */
  prepareLevelTransition() {
    this.levelTwoAssetsReady = LevelTwoPreloadSystem.preloadAfterEntry(this);
    this.cameras.main.fadeIn(TEST_LEVEL.sceneFadeInMs, 0, 0, 0);
  }

  /**
   * Configures world.
   * @returns {void} No value is returned.
   */
  configureWorld() {
    const { width, height } = TEST_LEVEL.world;
    this.physics.world.setBounds(0, 0, width, height);
    this.cameras.main.setBounds(0, 0, width, height);
  }

  /**
   * Creates player.
   * @returns {void} No value is returned.
   */
  createPlayer() {
    const settings = TEST_LEVEL.playerSpawn;
    this.player = new Bulldog(
      this,
      settings.startX,
      settings.startY,
      BULLDOG_TEXTURES.stand.key,
    );
    this.connectPlayerSystems();
  }

  /**
   * Handles connect player systems.
   */
  connectPlayerSystems() {
    this.inputSystem = new InputSystem(this);
    this.touchControls = TouchControlSystem.create(
      this,
      this.inputSystem,
      this.player,
    );
    this.physics.add.collider(this.player, this.platforms);
    this.player.onceKnockOutComplete(() => this.scene.start(SCENES.gameOver));
  }

  /**
   * Creates background music.
   * @returns {void} No value is returned.
   */
  createBackgroundMusic() {
    this.backgroundMusic = new BackgroundMusicSystem(this);
    this.backgroundMusic.play(LEVEL_MUSIC.opening);
    this.player.once(BULLDOG_EVENTS.knockedOut, () => {
      this.backgroundMusic.fadeOutAndStop(
        LEVEL_MUSIC.opening.fadeOutMs,
      );
    });
  }

  /**
   * Configures camera.
   * @returns {void} No value is returned.
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
   * Creates movement info popup.
   * @returns {void} No value is returned.
   */
  createMovementInfoPopup() {
    if (TouchControlSystem.isSupported()) return;
    const settings = TEST_LEVEL.movementInfoPopup;
    const popup = this.createMovementInfoText(settings);
    this.time.delayedCall(settings.visibleDurationMs, () =>
      this.fadeOutMovementInfo(popup, settings));
  }

  /**
   * Creates movement info text.
   */
  createMovementInfoText(settings) {
    return this.add.text(settings.x, settings.y, settings.text, {
      fontFamily: settings.fontFamily,
      fontSize: `${settings.fontSize}px`,
      color: settings.color,
      align: "center",
      backgroundColor: settings.backgroundColor,
      padding: { x: settings.paddingX, y: settings.paddingY },
      lineSpacing: settings.lineSpacing,
    })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(settings.depth);
  }

  /**
   * Fades out movement info.
   */
  fadeOutMovementInfo(popup, settings) {
      this.tweens.add({
        targets: popup,
        alpha: 0,
        duration: settings.fadeDurationMs,
        ease: "Sine.easeIn",
        onComplete: () => popup.destroy(),
      });
  }

  /**
   * Binds scene controls.
   * @returns {void} No value is returned.
   */
  bindSceneControls() {
    this.input.keyboard?.once("keydown-ESC", () =>
      this.scene.start(SCENES.menu),
    );
  }

  /**
   * Completes level.
   * @returns {void} No value is returned.
   */
  completeLevel() {
    if (this.isLevelCompleting) return;
    this.isLevelCompleting = true;
    const playerState = this.createPlayerStateSnapshot();
    this.backgroundMusic.stop();
    LevelTwoPreloadSystem.enterWhenReady(
      this,
      this.levelTwoAssetsReady,
      () => this.startLevelTwo(playerState),
    );
  }

  /**
   * Starts level two.
   * @param {{health: number, collectibles: Record<string, number>}} playerState - The player state value.
   * @returns {void} No value is returned.
   */
  startLevelTwo(playerState) {
    this.scene.start(SCENES.levelTwo, {
      playerState,
      enterFromPreviousLevel: true,
    });
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
   * Updates the current state.
   * @param {number} time - The current scene time in milliseconds.
   * @param {number} delta - The elapsed time since the previous frame in milliseconds.
   * @returns {void} No value is returned.
   */
  update(time, delta) {
    this.updatePlayer(time);
    this.updateEnemies(time);
    this.dogCatcherRangeDebug?.update();
    LevelEnvironmentSystem.update(this, delta);
    if (this.levelExit?.update(this.player)) {
      this.completeLevel();
    }
  }

  /**
   * Updates player.
   */
  updatePlayer(time) {
    this.mutationSystem?.update(this.inputSystem);
    if (this.levelExit?.isTransitioning) return;
    this.player?.updateMovement(this.inputSystem, time);
  }

  /**
   * Updates enemies.
   */
  updateEnemies(time) {
    DogCatcherSystem.update(
      this.dogCatchers,
      this.player,
      this.healthSystem,
      time,
    );
  }
}
