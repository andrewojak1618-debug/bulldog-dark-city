import { LEVEL_TWO } from "../../js/config/level-two-settings.js";

/**
 * Lädt und erzeugt die Hindernisse des zweiten Levels.
 */
export class LevelTwoObstacleSystem {
  /**
   * Lädt das Spritesheet der Nuklearbox.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @returns {void}
   */
  static load(scene) {
    const box = LEVEL_TWO.nuclearBoxObstacle;

    scene.load.spritesheet(box.key, box.path, {
      frameWidth: box.frameWidth,
      frameHeight: box.frameHeight,
    });
  }

  /**
   * Erstellt Nuklearbox, Animation und statische Sprungkollision.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @param {Phaser.Physics.Arcade.StaticGroup} platforms - Kollisionsgruppe.
   * @param {number} surfaceY - Vertikale Position der Laufkante.
   * @returns {Phaser.GameObjects.Sprite} Erstellte Nuklearbox.
   */
  static createNuclearBox(scene, platforms, surfaceY) {
    const settings = LEVEL_TWO.nuclearBoxObstacle;

    this.registerAnimation(scene, settings);
    const obstacle = this.createSprite(scene, settings, surfaceY);
    this.createCollision(scene, platforms, settings, surfaceY);
    return obstacle;
  }

  /**
   * Registriert die stabilisierte grüne Pulsanimation genau einmal.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @param {object} settings - Zentrale Nuklearbox-Konfiguration.
   * @returns {void}
   */
  static registerAnimation(scene, settings) {
    if (scene.anims.exists(settings.animationKey)) return;

    scene.anims.create({
      key: settings.animationKey,
      frames: scene.anims.generateFrameNumbers(settings.key, {
        frames: settings.frameSequence,
      }),
      frameRate: settings.frameRate,
      repeat: -1,
    });
  }

  /**
   * Erzeugt die sichtbare und animierte Nuklearbox.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @param {object} settings - Zentrale Nuklearbox-Konfiguration.
   * @param {number} surfaceY - Vertikale Position der Laufkante.
   * @returns {Phaser.GameObjects.Sprite} Erstellte Nuklearbox.
   */
  static createSprite(scene, settings, surfaceY) {
    return scene.add
      .sprite(settings.x, surfaceY, settings.key, 0)
      .setOrigin(0.5, 1)
      .setDisplaySize(settings.displayWidth, settings.displayHeight)
      .setDepth(settings.depth)
      .play(settings.animationKey);
  }

  /**
   * Fügt eine faire, unsichtbare Hitbox zur Plattformgruppe hinzu.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @param {Phaser.Physics.Arcade.StaticGroup} platforms - Kollisionsgruppe.
   * @param {object} settings - Zentrale Nuklearbox-Konfiguration.
   * @param {number} surfaceY - Vertikale Position der Laufkante.
   * @returns {Phaser.GameObjects.Rectangle} Erstellte Kollisionsfläche.
   */
  static createCollision(scene, platforms, settings, surfaceY) {
    const collision = scene.add.rectangle(
      settings.x,
      surfaceY - settings.collisionHeight / 2,
      settings.collisionWidth,
      settings.collisionHeight,
    );

    collision.setVisible(false);
    platforms.add(collision);
    return collision;
  }
}
