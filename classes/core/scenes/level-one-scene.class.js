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

/** Stellt das eigenständige erste Level von Bulldog Dark City bereit. */
export class LevelOneScene extends Phaser.Scene {
  /**
   * Erstellt Level eins mit seinem eindeutigen Szenenschlüssel.
   */
  constructor() {
    super(SCENES.levelOne);
  }

  /**
   * Setzt den einmaligen Übergang bei jedem neuen Leveldurchlauf zurück.
   * @returns {void}
   */
  init() {
    this.isLevelCompleting = false;
  }

  /**
   * Lädt die aktuell benötigten Bulldog-Spritesheets.
   * @returns {void}
   */
  preload() {
    if (!LevelOnePreloadSystem.isReady(this)) {
      LevelOnePreloadSystem.queue(this);
    }
  }

  /**
   * Baut Testwelt, Plattformen, Spieler, Kamera und Bedienhinweise auf.
   * @returns {void}
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
   * Erstellt Weltgrenzen, Umgebung, Plattformen und Animationen.
   * @returns {void}
   */
  createLevelWorld() {
    this.configureWorld();
    LevelEnvironmentSystem.create(this);
    this.platforms = LevelOnePlatformSystem.create(this);
    BulldogAnimationSystem.register(this);
    DogCatcherAnimationSystem.register(this);
  }

  /**
   * Erstellt Spieler, Gegner, Musik und freischaltbaren Ausgang.
   * @returns {void}
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
      () => this.levelExit.unlock(),
    );
  }

  /**
   * Erstellt Kamera, HUD, Sammelobjekte und Bedienhinweise.
   * @returns {void}
   */
  createLevelInterface() {
    this.configureCamera();
    const hud = LevelHudSystem.create(this, {}, this.player);
    this.healthSystem = hud.health;
    this.collectibleSystem = hud.collectibles;
    this.mutationSystem = hud.mutation;
    this.menuHint = new LevelMenuHint(this, 1);
    LevelItemSystem.create(
      this,
      this.player,
      this.healthSystem,
      this.collectibleSystem,
    );
    this.createMovementInfoPopup();
    this.bindSceneControls();
  }

  /**
   * Lädt Level zwei vor und blendet den ersten Leveldurchlauf ein.
   * @returns {void}
   */
  prepareLevelTransition() {
    this.levelTwoAssetsReady = LevelTwoPreloadSystem.preloadAfterEntry(this);
    this.cameras.main.fadeIn(TEST_LEVEL.sceneFadeInMs, 0, 0, 0);
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
   * Erstellt die Spielfigur und verbindet sie mit den Plattformen.
   * @returns {void}
   */
  createPlayer() {
    const settings = TEST_LEVEL.playerSpawn;
    this.player = new Bulldog(
      this,
      settings.startX,
      settings.startY,
      BULLDOG_TEXTURES.stand.key,
    );
    this.inputSystem = new InputSystem(this);
    this.touchControls = TouchControlSystem.create(
      this,
      this.inputSystem,
      this.player,
    );
    this.physics.add.collider(this.player, this.platforms);
    this.player.onceKnockOutComplete(() => {
      this.scene.start(SCENES.gameOver);
    });
  }

  /**
   * Startet die Einstiegsmusik und blendet sie beim K. o. weich aus.
   * @returns {void}
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
   * Lässt die Kamera weich innerhalb der Weltgrenzen folgen.
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
   * Zeigt die Desktop-Steuerung zu Levelbeginn kurz als mittiges Popup.
   * Touchgeräte erhalten stattdessen ihre sichtbaren Bildschirmbuttons.
   * @returns {void}
   */
  createMovementInfoPopup() {
    if (TouchControlSystem.isSupported()) return;
    const settings = TEST_LEVEL.movementInfoPopup;
    const popup = this.add.text(settings.x, settings.y, settings.text, {
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
    this.time.delayedCall(settings.visibleDurationMs, () => {
      this.tweens.add({
        targets: popup,
        alpha: 0,
        duration: settings.fadeDurationMs,
        ease: "Sine.easeIn",
        onComplete: () => popup.destroy(),
      });
    });
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
   * Blendet Level eins aus und startet die vorbereitete zweite Szene.
   * @returns {void}
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
   * Startet das vollständig vorgeladene zweite Level.
   * @param {{health: number, collectibles: Record<string, number>}}
   * playerState - Zu übernehmender Spielerzustand.
   * @returns {void}
   */
  startLevelTwo(playerState) {
    this.scene.start(SCENES.levelTwo, {
      playerState,
      enterFromPreviousLevel: true,
    });
  }

  /**
   * Sichert die über Levelgrenzen hinweg benötigten Spielerwerte.
   * @returns {{health: number, collectibles: Record<string, number>}}
   * Aktueller Lebens- und Sammelzustand.
   */
  createPlayerStateSnapshot() {
    return {
      health: this.healthSystem.getCurrent(),
      collectibles: this.collectibleSystem.getSnapshot(),
    };
  }

  /**
   * Aktualisiert Spielerbewegung, Gegner, Umgebung und Levelausgang.
   * @param {number} time - Aktuelle Szenenzeit in Millisekunden.
   * @param {number} delta - Vergangene Millisekunden seit dem letzten Frame.
   * @returns {void}
   */
  update(time, delta) {
    this.mutationSystem?.update(this.inputSystem);
    if (!this.levelExit?.isTransitioning) {
      this.player?.updateMovement(this.inputSystem, time);
    }
    DogCatcherSystem.update(
      this.dogCatchers,
      this.player,
      this.healthSystem,
      time,
    );
    this.dogCatcherRangeDebug?.update();
    LevelEnvironmentSystem.update(this, delta);
    if (this.levelExit?.update(this.player)) {
      this.completeLevel();
      return;
    }
  }
}
