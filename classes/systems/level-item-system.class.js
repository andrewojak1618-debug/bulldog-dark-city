import { LEVEL_ITEMS } from "../../js/config/level-item-settings.js";

/**
 * Lädt und erzeugt die animierten Sammelobjekte des Testlevels.
 */
export class LevelItemSystem {
  /**
   * Lädt alle konfigurierten Item-Spritesheets.
   * @param {Phaser.Scene} scene - Zugehörige Spielszene.
   * @returns {void}
   */
  static load(scene) {
    Object.values(LEVEL_ITEMS.textures).forEach((texture) => {
      scene.load.spritesheet(texture.key, texture.path, {
        frameWidth: texture.frameWidth,
        frameHeight: texture.frameHeight,
      });
    });
  }

  /**
   * Registriert jede Item-Animation höchstens einmal im Animationsmanager.
   * @param {Phaser.Scene} scene - Zugehörige Spielszene.
   * @returns {void}
   */
  static registerAnimations(scene) {
    Object.values(LEVEL_ITEMS.animations).forEach((animation) => {
      if (scene.anims.exists(animation.key)) return;

      scene.anims.create({
        key: animation.key,
        frames: animation.frames.map((frame) => ({
          key: animation.textureKey,
          frame,
        })),
        frameRate: animation.frameRate,
        yoyo: animation.yoyo ?? false,
        repeat: -1,
      });
    });
  }

  /**
   * Setzt die konfigurierten Testitems ins Level und startet ihre Animation.
   * @param {Phaser.Scene} scene - Zugehörige Spielszene.
   * @returns {Phaser.GameObjects.Group} Gruppe aller sichtbaren Items.
   */
  static create(scene) {
    this.registerAnimations(scene);
    const group = scene.add.group({ runChildUpdate: false });

    LEVEL_ITEMS.placements.forEach((placement) => {
      const animation = LEVEL_ITEMS.animations[placement.type];
      const item = scene.add
        .sprite(placement.x, placement.y, animation.textureKey, 0)
        .setDisplaySize(placement.size, placement.size)
        .setDepth(LEVEL_ITEMS.depth);
      item.play(animation.key);
      group.add(item);
    });

    return group;
  }
}
