import { LEVEL_TWO } from "../../js/config/level-two-settings.js";
import { AssetLoaderSystem } from "./asset-loader-system.class.js";

/** Lädt und registriert alle Animationen der Level-2-Drohnen. */
export class LevelTwoDroneAnimationSystem {
  /**
   * Lädt alle konfigurierten Drohnen-Sprite-Sheets.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @returns {void}
   */
  static load(scene) {
    const settings = LEVEL_TWO.drones;
    settings.variants.forEach((drone) => {
      this.loadDroneTextures(scene, settings, drone);
    });
  }

  /**
   * Lädt Flug-, Alarm- und Zerstörungstextur einer Drohnenvariante.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @param {object} settings - Gemeinsame Drohneneinstellungen.
   * @param {object} drone - Konfiguration der Drohnenvariante.
   * @returns {void}
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
   * Liefert die drei Sprite-Sheet-Schlüssel einer Drohnenvariante.
   * @param {object} drone - Konfiguration der Drohnenvariante.
   * @returns {{key: string, path: string}[]} Zu ladende Sprite-Sheets.
   */
  static getTextureAssets(drone) {
    return [
      { key: drone.key, path: drone.path },
      { key: drone.alarmKey, path: drone.alarmPath },
      { key: drone.destructionKey, path: drone.destructionPath },
    ];
  }

  /**
   * Registriert Flug-, Alarm- und Zerstörungsanimation genau einmal.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @param {object} settings - Gemeinsame Drohneneinstellungen.
   * @param {object} drone - Konfiguration der Drohnenvariante.
   * @returns {void}
   */
  static register(scene, settings, drone) {
    this.registerFlight(scene, settings, drone);
    this.registerAlarm(scene, settings, drone);
    this.registerDestruction(scene, settings, drone);
  }

  /**
   * Registriert die vier Flugphasen genau einmal.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @param {object} settings - Gemeinsame Drohneneinstellungen.
   * @param {object} drone - Konfiguration der Drohnenvariante.
   * @returns {void}
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
   * Registriert die einmalige Alarmsequenz genau einmal.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @param {object} settings - Gemeinsame Drohneneinstellungen.
   * @param {object} drone - Konfiguration der Drohnenvariante.
   * @returns {void}
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
   * Registriert die einmalige Zerstörungssequenz genau einmal.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @param {object} settings - Gemeinsame Drohneneinstellungen.
   * @param {object} drone - Konfiguration der Drohnenvariante.
   * @returns {void}
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
