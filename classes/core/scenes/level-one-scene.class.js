import Phaser from "phaser";
import { Bulldog } from "../../entities/characters/bulldog.class.js";
import { InputSystem } from "../../input/input-system.class.js";
import { BulldogAnimationSystem } from "../../systems/bulldog-animation-system.class.js";
import { DogCatcherAnimationSystem } from
  "../../systems/dog-catcher-animation-system.class.js";
import { DogCatcherSystem } from "../../systems/dog-catcher-system.class.js";
import { LevelHudSystem } from "../../systems/level-hud-system.class.js";
import { LevelItemSystem } from "../../systems/level-item-system.class.js";
import { LevelExitSystem } from "../../systems/level-exit-system.class.js";
import { BackgroundMusicSystem } from
  "../../systems/background-music-system.class.js";
import { LevelEnvironmentSystem } from "../../systems/level-environment-system.class.js";
import { LevelFlowSystem } from "../../systems/level-flow-system.class.js";
import { LevelOnePlatformSystem } from
  "../../systems/level-one-platform-system.class.js";
import { TEST_LEVEL } from "../../../js/config/test-level-settings.js";
import {
  BULLDOG_EVENTS,
  BULLDOG_TEXTURES,
} from "../../../js/config/bulldog-animation-settings.js";
import { LEVEL_MUSIC } from "../../../js/config/level-music-settings.js";
import { LEVEL_EXIT } from "../../../js/config/level-exit-settings.js";
import { SCENES } from "../../../js/config/game-settings.js";
import { PLAYER_CAMERA } from
  "../../../js/config/player-camera-settings.js";

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
    BulldogAnimationSystem.load(this);
    DogCatcherSystem.load(this);
    LevelHudSystem.load(this);
    LevelItemSystem.load(this);
    LevelExitSystem.load(this);
    BackgroundMusicSystem.load(this, LEVEL_MUSIC.opening);
    LevelEnvironmentSystem.load(this);
    LevelOnePlatformSystem.load(this);
  }

  /**
   * Baut Testwelt, Plattformen, Spieler, Kamera und Bedienhinweise auf.
   * @returns {void}
   */
  create() {
    this.configureWorld();
    LevelEnvironmentSystem.create(this);
    this.platforms = LevelOnePlatformSystem.create(this);
    BulldogAnimationSystem.register(this);
    DogCatcherAnimationSystem.register(this);
    this.createPlayer();
    this.createBackgroundMusic();
    this.dogCatchers = DogCatcherSystem.create(this, this.platforms);
    this.levelExit = LevelExitSystem.create(this);
    DogCatcherSystem.onceDefeated(
      this.dogCatchers,
      () => this.levelExit.unlock(),
    );
    this.configureCamera();
    const hud = LevelHudSystem.create(this, {}, this.player);
    this.healthSystem = hud.health;
    this.collectibleSystem = hud.collectibles;
    this.mutationSystem = hud.mutation;
    LevelItemSystem.create(
      this,
      this.player,
      this.healthSystem,
      this.collectibleSystem,
    );
    this.createDebugOverlay();
    this.bindSceneControls();
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
   * Zeigt Steuerung und Status unabhängig von der Kameraposition an.
   * @returns {void}
   */
  createDebugOverlay() {
    const { depth, instructions, position } = TEST_LEVEL.debugOverlay;
    this.add
      .text(
        instructions.x,
        instructions.y,
        instructions.text,
        {
          fontFamily: instructions.fontFamily,
          fontSize: `${instructions.fontSize}px`,
          color: instructions.color,
          backgroundColor: instructions.backgroundColor,
          padding: {
            x: instructions.paddingX,
            y: instructions.paddingY,
          },
          lineSpacing: instructions.lineSpacing,
        },
      )
      .setScrollFactor(0)
      .setDepth(depth);
    this.positionText = this.add
      .text(position.x, position.y, "", {
        fontFamily: position.fontFamily,
        fontSize: `${position.fontSize}px`,
        color: position.color,
        backgroundColor: position.backgroundColor,
        padding: { x: position.paddingX, y: position.paddingY },
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(depth);
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
   * Aktualisiert Spielerbewegung und technische Positionsanzeige.
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
    LevelEnvironmentSystem.update(this, delta);
    if (this.levelExit?.update(this.player)) {
      this.completeLevel();
      return;
    }
    const currentZone = LevelFlowSystem.getZoneAt(this.player.x);
    this.positionText?.setText(
      `X ${Math.round(this.player.x)}  Y ${Math.round(this.player.y)}` +
        `\n${currentZone.label}`,
    );
  }
}
