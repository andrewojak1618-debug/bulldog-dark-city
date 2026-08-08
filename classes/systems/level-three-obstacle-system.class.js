import { LEVEL_THREE } from "../../js/config/level-three-settings.js";

/** Laedt und erstellt die kollidierbaren Hindernisse des dritten Levels. */
export class LevelThreeObstacleSystem {
  /**
   * Laedt das Spritesheet der kleinen Katzenbox.
   * @param {Phaser.Scene} scene - Aktive Level-3-Szene.
   * @returns {void}
   */
  static load(scene) {
    const settings = LEVEL_THREE.catBoxSmall;
    scene.load.spritesheet(settings.key, settings.path, {
      frameWidth: settings.frameWidth,
      frameHeight: settings.frameHeight,
    });
  }

  /**
   * Erstellt Animation, Grafik und statische Kollision der Katzenbox.
   * @param {Phaser.Scene} scene - Aktive Level-3-Szene.
   * @param {Phaser.Physics.Arcade.StaticGroup} platforms - Kollisionsgruppe.
   * @param {number} surfaceY - Gemeinsame Laufkante von Boden und Box.
   * @returns {Phaser.GameObjects.Sprite} Sichtbare Katzenbox.
   */
  static create(scene, platforms, surfaceY) {
    const settings = LEVEL_THREE.catBoxSmall;
    const bottomY = surfaceY + settings.verticalOffsetY;
    this.registerAnimation(scene, settings);
    this.createCollision(scene, platforms, settings, bottomY);

    return scene.add.sprite(settings.x, bottomY, settings.key, 0)
      .setOrigin(0.5, 1)
      .setDisplaySize(settings.displayWidth, settings.displayHeight)
      .setDepth(settings.depth)
      .play(settings.animationKey);
  }

  /**
   * Registriert die dezente Pulsanimation genau einmal.
   * @param {Phaser.Scene} scene - Aktive Level-3-Szene.
   * @param {object} settings - Zentrale Boxkonfiguration.
   * @returns {void}
   */
  static registerAnimation(scene, settings) {
    if (scene.anims.exists(settings.animationKey)) return;

    scene.anims.create({
      key: settings.animationKey,
      frames: scene.anims.generateFrameNumbers(settings.key, {
        start: 0,
        end: settings.frameCount - 1,
      }),
      frameRate: settings.frameRate,
      repeat: -1,
    });
  }

  /**
   * Legt die Oberkante der Hitbox passend unter die sichtbare Boxoberkante.
   * @param {Phaser.Scene} scene - Aktive Level-3-Szene.
   * @param {Phaser.Physics.Arcade.StaticGroup} platforms - Kollisionsgruppe.
   * @param {object} settings - Zentrale Boxkonfiguration.
   * @param {number} bottomY - Vertikal korrigierte Unterkante der Box.
   * @returns {Phaser.GameObjects.Rectangle} Unsichtbare statische Hitbox.
   */
  static createCollision(scene, platforms, settings, bottomY) {
    const collision = scene.add.rectangle(
      settings.x,
      bottomY - settings.collisionHeight / 2,
      settings.collisionWidth,
      settings.collisionHeight,
    ).setVisible(false);

    platforms.add(collision);
    return collision;
  }
}
