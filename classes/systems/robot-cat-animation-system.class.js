import {
  ROBOT_CAT,
  ROBOT_CAT_DEAD_TEXTURE,
  ROBOT_CAT_FLIGHT_TEXTURE,
  ROBOT_CAT_HIT_TEXTURE,
  ROBOT_CAT_WALK_TEXTURE,
} from "../../js/config/robot-cat-settings.js";

/** Lädt und registriert ausschließlich die Animationen der Roboterkatze. */
export class RobotCatAnimationSystem {
  /**
   * Lädt alle vorbereiteten Spritesheets der Roboterkatze.
   * @param {Phaser.Scene} scene - Aktive Level-3-Szene.
   * @returns {void}
   */
  static load(scene) {
    this.getTextures().forEach((texture) => {
      scene.load.spritesheet(texture.key, texture.path, {
        frameWidth: texture.frameWidth,
        frameHeight: texture.frameHeight,
      });
    });
  }

  /**
   * Gibt alle zu ladenden Texturkonfigurationen zurück.
   * @returns {Object[]} Texturen für Bewegung, Treffer und K.-o.
   */
  static getTextures() {
    return [
      ROBOT_CAT_WALK_TEXTURE,
      ROBOT_CAT_FLIGHT_TEXTURE,
      ROBOT_CAT_HIT_TEXTURE,
      ROBOT_CAT_DEAD_TEXTURE,
    ];
  }

  /**
   * Registriert alle Animationen jeweils höchstens einmal.
   * @param {Phaser.Scene} scene - Aktive Level-3-Szene.
   * @returns {void}
   */
  static register(scene) {
    this.registerWalk(scene);
    this.registerTakeoff(scene);
    this.registerSequence(scene, ROBOT_CAT_HIT_TEXTURE);
    this.registerSequence(scene, ROBOT_CAT_DEAD_TEXTURE);
  }

  /**
   * Registriert die endlose Laufanimation.
   * @param {Phaser.Scene} scene - Aktive Level-3-Szene.
   * @returns {void}
   */
  static registerWalk(scene) {
    const texture = ROBOT_CAT_WALK_TEXTURE;
    if (scene.anims.exists(texture.animationKey)) return;
    scene.anims.create({
      key: texture.animationKey,
      frames: scene.anims.generateFrameNumbers(texture.key, {
        start: 0,
        end: texture.frameCount - 1,
      }),
      frameRate: ROBOT_CAT.walkFrameRate,
      repeat: -1,
      yoyo: true,
    });
  }

  /**
   * Registriert die einmalige Abhebeanimation in festgelegter Reihenfolge.
   * @param {Phaser.Scene} scene - Aktive Level-3-Szene.
   * @returns {void}
   */
  static registerTakeoff(scene) {
    const texture = ROBOT_CAT_FLIGHT_TEXTURE;
    if (scene.anims.exists(texture.takeoffAnimationKey)) return;
    scene.anims.create({
      key: texture.takeoffAnimationKey,
      frames: texture.takeoffSequence.map((frame) => ({
        key: texture.key,
        frame,
      })),
      frameRate: ROBOT_CAT.flightFrameRate,
      repeat: 0,
    });
  }

  /**
   * Registriert eine einmalige Animation in der Reihenfolge ihrer Frames.
   * @param {Phaser.Scene} scene - Aktive Level-3-Szene.
   * @param {Object} texture - Konfiguration der einmaligen Animation.
   * @returns {void}
   */
  static registerSequence(scene, texture) {
    if (scene.anims.exists(texture.animationKey)) return;
    scene.anims.create({
      key: texture.animationKey,
      frames: scene.anims.generateFrameNumbers(texture.key, {
        start: 0,
        end: texture.frameCount - 1,
      }),
      frameRate: texture.frameRate,
      repeat: 0,
    });
  }
}
