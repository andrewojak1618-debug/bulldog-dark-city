import { LEVEL_EXIT } from "../../js/config/level-exit-settings.js";
import {
  BULLDOG_ANIMATION_KEYS,
} from "../../js/config/bulldog-animation-settings.js";

/**
 * Steuert Sichtbarkeit und Laufübergang am rechten Ende von Level eins.
 */
export class LevelExitSystem {
  /**
   * Lädt den Spritesheet des Cyber-City-Ausgangsschilds.
   * @param {Phaser.Scene} scene - Zugehörige Spielszene.
   * @returns {void}
   */
  static load(scene) {
    scene.load.image(LEVEL_EXIT.postTextureKey, LEVEL_EXIT.postPath);
    scene.load.spritesheet(LEVEL_EXIT.textureKey, LEVEL_EXIT.path, {
      frameWidth: LEVEL_EXIT.frameWidth,
      frameHeight: LEVEL_EXIT.frameHeight,
    });
  }

  /**
   * Erstellt einen zunächst verborgenen Ausgang und seine Animation.
   * @param {Phaser.Scene} scene - Zugehörige Spielszene.
   * @returns {LevelExitSystem} Steuerung des Levelausgangs.
   */
  static create(scene) {
    this.registerAnimation(scene);
    return new LevelExitSystem(scene);
  }

  /**
   * Registriert die Leuchtsequenz nur einmal im globalen Animationsmanager.
   * @param {Phaser.Scene} scene - Zugehörige Spielszene.
   * @returns {void}
   */
  static registerAnimation(scene) {
    if (scene.anims.exists(LEVEL_EXIT.animationKey)) return;
    scene.anims.create({
      key: LEVEL_EXIT.animationKey,
      frames: LEVEL_EXIT.frameSequence.map((frame) => ({
        key: LEVEL_EXIT.textureKey,
        frame,
      })),
      frameRate: LEVEL_EXIT.frameRate,
      repeat: -1,
    });
  }

  /**
   * Erstellt das verborgene Schild am Boden des rechten Levelendes.
   * @param {Phaser.Scene} scene - Zugehörige Spielszene.
   */
  constructor(scene) {
    this.scene = scene;
    this.isUnlocked = false;
    this.isTransitioning = false;
    this.hasCompleted = false;
    this.post = scene.add
      .image(LEVEL_EXIT.x, LEVEL_EXIT.groundY, LEVEL_EXIT.postTextureKey)
      .setOrigin(0.5, 1)
      .setDisplaySize(LEVEL_EXIT.displayWidth, LEVEL_EXIT.displayHeight)
      .setDepth(LEVEL_EXIT.depth)
      .setAlpha(0)
      .setVisible(false);
    this.sign = scene.add
      .sprite(LEVEL_EXIT.x, LEVEL_EXIT.groundY, LEVEL_EXIT.textureKey, 0)
      .setOrigin(0.5, 1)
      .setDisplaySize(LEVEL_EXIT.displayWidth, LEVEL_EXIT.displayHeight)
      .setDepth(LEVEL_EXIT.depth + 0.1)
      .setAlpha(0)
      .setVisible(false);
  }

  /**
   * Macht den Ausgang nach dem besiegten Hundefänger sichtbar.
   * @returns {boolean} `true`, wenn der Ausgang erstmals geöffnet wurde.
   */
  unlock() {
    if (this.isUnlocked) return false;
    this.isUnlocked = true;
    this.post.setVisible(true);
    this.sign.setVisible(true).play(LEVEL_EXIT.animationKey);
    this.scene.tweens.add({
      targets: [this.post, this.sign],
      alpha: 1,
      duration: LEVEL_EXIT.unlockFadeMs,
      ease: "Sine.easeOut",
    });
    return true;
  }

  /**
   * Prüft den Ausgang und bewegt die Bulldogge während des Bildauslaufs.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - Bulldogge.
   * @returns {boolean} `true`, sobald Level zwei gestartet werden darf.
   */
  update(player) {
    if (!this.isUnlocked || this.hasCompleted) return false;
    if (!this.isTransitioning && player.x >= LEVEL_EXIT.triggerX) {
      this.startTransition(player);
    }
    if (!this.isTransitioning) return false;
    player.setVelocityX(LEVEL_EXIT.exitSpeed);
    player.play(BULLDOG_ANIMATION_KEYS.run, true);
    if (player.x < LEVEL_EXIT.leaveWorldX) return false;
    this.hasCompleted = true;
    return true;
  }

  /**
   * Öffnet die rechte Weltgrenze und sperrt die normale Spielersteuerung.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - Bulldogge.
   * @returns {void}
   */
  startTransition(player) {
    this.isTransitioning = true;
    player.setCollideWorldBounds(false);
    player.setFlipX(false);
    player.play(BULLDOG_ANIMATION_KEYS.run, true);
  }
}
