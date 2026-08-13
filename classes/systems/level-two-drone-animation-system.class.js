import { LEVEL_TWO } from "../../js/config/level-two-settings.js";
import { AssetLoaderSystem } from "./asset-loader-system.class.js";

/**
 * Manages level two drone animation system behavior.
 */
export class LevelTwoDroneAnimationSystem {
  /**
   * Loads the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static load(scene) {
    const settings = LEVEL_TWO.drones;
    settings.variants.forEach((drone) => {
      this.loadDroneTextures(scene, settings, drone);
    });
  }

  /**
   * Loads drone textures.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {object} settings - The configuration values to use.
   * @param {object} drone - The drone value.
   * @returns {void} No value is returned.
   */
  static loadDroneTextures(scene, settings, drone) {
    this.getTextureAssets(drone).forEach((asset) => {
      AssetLoaderSystem.loadSpritesheet(scene, {
        ...asset,
        frameWidth: settings.frameWidth,
        frameHeight: settings.frameHeight,
      });
    });
  }

  /**
   * Returns texture assets.
   * @param {object} drone - The drone value.
   * @returns {{key: string, path: string}[]} The resulting string value.
   */
  static getTextureAssets(drone) {
    return [
      { key: drone.key, path: drone.path },
      { key: drone.alarmKey, path: drone.alarmPath },
      { key: drone.destructionKey, path: drone.destructionPath },
    ];
  }

  /**
   * Registers the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {object} settings - The configuration values to use.
   * @param {object} drone - The drone value.
   * @returns {void} No value is returned.
   */
  static register(scene, settings, drone) {
    this.registerFlight(scene, settings, drone);
    this.registerAlarm(scene, settings, drone);
    this.registerDestruction(scene, settings, drone);
  }

  /**
   * Registers flight.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {object} settings - The configuration values to use.
   * @param {object} drone - The drone value.
   * @returns {void} No value is returned.
   */
  static registerFlight(scene, settings, drone) {
    if (scene.anims.exists(drone.animationKey)) return;
    scene.anims.create({
      key: drone.animationKey,
      frames: scene.anims.generateFrameNumbers(drone.key, {
        start: 0,
        end: 3,
      }),
      frameRate: settings.frameRate,
      repeat: -1,
    });
  }

  /**
   * Registers alarm.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {object} settings - The configuration values to use.
   * @param {object} drone - The drone value.
   * @returns {void} No value is returned.
   */
  static registerAlarm(scene, settings, drone) {
    if (scene.anims.exists(drone.alarmAnimationKey)) return;
    scene.anims.create({
      key: drone.alarmAnimationKey,
      frames: scene.anims.generateFrameNumbers(drone.alarmKey, {
        start: 0,
        end: drone.alarmEndFrame,
      }),
      frameRate: settings.alarmFrameRate,
      repeat: 0,
    });
  }

  /**
   * Registers destruction.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {object} settings - The configuration values to use.
   * @param {object} drone - The drone value.
   * @returns {void} No value is returned.
   */
  static registerDestruction(scene, settings, drone) {
    if (scene.anims.exists(drone.destructionAnimationKey)) return;
    scene.anims.create({
      key: drone.destructionAnimationKey,
      frames: scene.anims.generateFrameNumbers(drone.destructionKey, {
        start: 0,
        end: 3,
      }),
      frameRate: settings.destructionFrameRate,
      repeat: 0,
    });
  }
}
