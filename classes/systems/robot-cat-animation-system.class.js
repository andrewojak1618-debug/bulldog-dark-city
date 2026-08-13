import {
  ROBOT_CAT,
  ROBOT_CAT_ATTACK_TEXTURE,
  ROBOT_CAT_CLAWS_TEXTURE,
  ROBOT_CAT_DEAD_TEXTURE,
  ROBOT_CAT_FLIGHT_TEXTURE,
  ROBOT_CAT_HIT_TEXTURE,
  ROBOT_CAT_WALK_TEXTURE,
} from "../../js/config/robot-cat-settings.js";
import { AssetLoaderSystem } from "./asset-loader-system.class.js";

/**
 * Manages robot cat animation system behavior.
 */
export class RobotCatAnimationSystem {
  /**
   * Loads the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static load(scene) {
    this.getTextures().forEach((texture) => {
      AssetLoaderSystem.loadSpritesheet(scene, texture);
    });
  }

  /**
   * Returns textures.
   * @returns {Object[]} The resulting collection.
   */
  static getTextures() {
    return [
      ROBOT_CAT_WALK_TEXTURE,
      ROBOT_CAT_FLIGHT_TEXTURE,
      ROBOT_CAT_HIT_TEXTURE,
      ROBOT_CAT_DEAD_TEXTURE,
      ROBOT_CAT_ATTACK_TEXTURE,
      ROBOT_CAT_CLAWS_TEXTURE,
    ];
  }

  /**
   * Registers the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static register(scene) {
    this.registerWalk(scene);
    this.registerTakeoff(scene);
    this.registerSequence(scene, ROBOT_CAT_HIT_TEXTURE);
    this.registerSequence(scene, ROBOT_CAT_DEAD_TEXTURE);
    this.registerSequence(scene, ROBOT_CAT_ATTACK_TEXTURE);
    this.registerClaws(scene);
  }

  /**
   * Registers walk.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
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
   * Registers takeoff.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
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
   * Registers sequence.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Object} texture - The texture configuration to use.
   * @returns {void} No value is returned.
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

  /**
   * Registers claws.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static registerClaws(scene) {
    const texture = ROBOT_CAT_CLAWS_TEXTURE;
    if (scene.anims.exists(texture.animationKey)) return;
    scene.anims.create({
      key: texture.animationKey,
      frames: [0, 1, 2, 1].map((frame) => ({
        key: texture.key,
        frame,
      })),
      frameRate: texture.frameRate,
      repeat: -1,
    });
  }
}
