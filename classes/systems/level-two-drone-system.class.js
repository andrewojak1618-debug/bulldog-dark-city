import Phaser from "phaser";
import { LEVEL_TWO } from "../../js/config/level-two-settings.js";
import { LevelTwoDroneBeamSystem } from
  "./level-two-drone-beam-system.class.js";
import { LevelTwoScoutDroneSystem } from
  "./level-two-scout-drone-system.class.js";

/**
 * Lädt und steuert die rein visuellen Drohnenpatrouillen in Level zwei.
 */
export class LevelTwoDroneSystem {
  /**
   * Lädt alle konfigurierten Drohnen-Spritesheets.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @returns {void}
   */
  static load(scene) {
    const settings = LEVEL_TWO.drones;

    settings.variants.forEach((drone) => {
      scene.load.spritesheet(drone.key, drone.path, {
        frameWidth: settings.frameWidth,
        frameHeight: settings.frameHeight,
      });
      scene.load.spritesheet(drone.alarmKey, drone.alarmPath, {
        frameWidth: settings.frameWidth,
        frameHeight: settings.frameHeight,
      });
    });
  }

  /**
   * Erstellt beide Drohnen mit entgegengesetzten Flugrichtungen.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @returns {Phaser.GameObjects.Sprite[]} Erstellte Drohnen.
   */
  static create(scene) {
    return LEVEL_TWO.drones.variants.map((drone) =>
      this.createDrone(scene, drone),
    );
  }

  /**
   * Registriert Animation und Patrouille einer einzelnen Drohne.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @param {object} drone - Konfiguration der Drohnenvariante.
   * @returns {Phaser.GameObjects.Sprite} Animierte Drohne.
   */
  static createDrone(scene, drone) {
    const settings = LEVEL_TWO.drones;
    this.registerAnimation(scene, settings, drone);
    this.registerAlarmAnimation(scene, settings, drone);
    const sprite = this.createDroneSprite(scene, settings, drone);
    this.initializeCoreData(scene, sprite, settings, drone);
    this.initializeVisualData(scene, sprite, settings, drone);
    return sprite;
  }

  /**
   * Erzeugt die sichtbare Drohne an ihrer konfigurierten Startposition.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @param {object} settings - Gemeinsame Drohneneinstellungen.
   * @param {object} drone - Konfiguration der Drohnenvariante.
   * @returns {Phaser.GameObjects.Sprite} Sichtbare Drohne.
   */
  static createDroneSprite(scene, settings, drone) {
    const startsMovingRight = drone.initialDirection > 0;
    const startX = startsMovingRight
      ? settings.patrolMinX
      : settings.patrolMaxX;
    return scene.add
      .sprite(startX, drone.y, drone.key, 0)
      .setDisplaySize(drone.displaySize, drone.displaySize)
      .setDepth(settings.depth)
      .setFlipX(startsMovingRight)
      .play(drone.animationKey);
  }

  /**
   * Hinterlegt die fachlichen Zustands- und Patrouillendaten.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @param {Phaser.GameObjects.Sprite} sprite - Neue Drohne.
   * @param {object} settings - Gemeinsame Drohneneinstellungen.
   * @param {object} drone - Konfiguration der Drohnenvariante.
   * @returns {void}
   */
  static initializeCoreData(scene, sprite, settings, drone) {
    sprite.setDataEnabled();
    sprite.setData("drone", drone);
    sprite.setData(
      "patrolTween",
      this.createPatrolTween(scene, sprite, settings, drone),
    );
    sprite.setData("isAlert", false);
    sprite.setData("alarmDirection", drone.initialDirection);
  }

  /**
   * Hinterlegt Lichtkegel, Schweben und Aufklärungszustand.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @param {Phaser.GameObjects.Sprite} sprite - Neue Drohne.
   * @param {object} settings - Gemeinsame Drohneneinstellungen.
   * @param {object} drone - Konfiguration der Drohnenvariante.
   * @returns {void}
   */
  static initializeVisualData(scene, sprite, settings, drone) {
    sprite.setData("beam", this.createTrackingBeam(scene, drone));
    sprite.setData(
      "hoverTween",
      this.createHoverTween(scene, sprite, settings, drone),
    );
    sprite.setData("scoutStep", 0);
    sprite.setData("scoutDirection", 1);
    sprite.setData("scoutPauseRemaining", 0);
  }

  /**
   * Registriert die vier Flugphasen genau einmal.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @param {object} settings - Gemeinsame Drohneneinstellungen.
   * @param {object} drone - Konfiguration der Drohnenvariante.
   * @returns {void}
   */
  static registerAnimation(scene, settings, drone) {
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
  static registerAlarmAnimation(scene, settings, drone) {
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
   * Aktualisiert den Alarmzustand aller Drohnen anhand der Bulldogge.
   * @param {Phaser.GameObjects.Sprite[]} drones - Aktive Drohnen.
   * @param {Phaser.Physics.Arcade.Sprite} player - Steuerbare Bulldogge.
   * @param {number} delta - Zeit seit dem letzten Frame in Millisekunden.
   * @returns {void}
   */
  static update(drones = [], player, delta = 0) {
    if (!player) return;

    drones.forEach((sprite) => {
      const isPlayerNearby = Math.abs(player.x - sprite.x) <=
        LEVEL_TWO.drones.detectionRange;
      if (isPlayerNearby) {
        this.activateAlarm(sprite);
        this.updateAlarmPatrol(sprite, player, delta);
        this.updateScoutApproach(sprite, delta);
        this.updateTrackingBeam(sprite, player);
      } else {
        this.deactivateAlarm(sprite);
      }
    });
  }

  /**
   * Stoppt die Patrouille und spielt die Alarmsequenz einmal ab.
   * @param {Phaser.GameObjects.Sprite} sprite - Alarmierte Drohne.
   * @returns {void}
   */
  static activateAlarm(sprite) {
    if (sprite.getData("isAlert")) return;
    const drone = sprite.getData("drone");

    sprite.setData("isAlert", true);
    sprite.getData("patrolTween")?.pause();
    if (drone.scoutApproach) {
      sprite.getData("hoverTween")?.pause();
      sprite.y = drone.y;
    }
    sprite.setOrigin(0.5, LEVEL_TWO.drones.alarmOriginY);
    sprite.play(drone.alarmAnimationKey);
  }

  /**
   * Setzt nach Verlassen des Sichtbereichs die Flugpatrouille fort.
   * @param {Phaser.GameObjects.Sprite} sprite - Beruhigte Drohne.
   * @returns {void}
   */
  static deactivateAlarm(sprite) {
    if (!sprite.getData("isAlert")) return;
    const drone = sprite.getData("drone");

    sprite.setData("isAlert", false);
    sprite.setOrigin(0.5);
    sprite.getData("beam")?.clear();
    if (drone.scoutApproach) {
      sprite.y = drone.y;
      sprite.setData("scoutStep", 0);
      sprite.setData("scoutDirection", 1);
      sprite.setData("scoutPauseRemaining", 0);
      sprite.getData("hoverTween")?.restart();
    }
    sprite.play(drone.animationKey);
    sprite.getData("patrolTween")?.resume();
  }

  /**
   * Bewegt eine alarmierte Drohne kontrolliert über der Bulldogge hin und her.
   * @param {Phaser.GameObjects.Sprite} sprite - Alarmierte Drohne.
   * @param {Phaser.Physics.Arcade.Sprite} player - Verfolgte Bulldogge.
   * @param {number} delta - Zeit seit dem letzten Frame in Millisekunden.
   * @returns {void}
   */
  static updateAlarmPatrol(sprite, player, delta) {
    const settings = LEVEL_TWO.drones;
    const minX = Math.max(
      settings.patrolMinX,
      player.x - settings.alarmPatrolRadius,
    );
    const maxX = Math.min(
      settings.patrolMaxX,
      player.x + settings.alarmPatrolRadius,
    );
    let direction = sprite.getData("alarmDirection");

    if (sprite.x <= minX) direction = 1;
    if (sprite.x >= maxX) direction = -1;
    sprite.setData("alarmDirection", direction);
    sprite.x = Phaser.Math.Clamp(
      sprite.x + direction * settings.alarmPatrolSpeed * delta / 1_000,
      minX,
      maxX,
    );
    sprite.setFlipX(direction > 0);
  }

  /**
   * Lässt die kleine Aufklärungsdrohne stufenweise absinken und zurückkehren.
   * @param {Phaser.GameObjects.Sprite} sprite - Alarmierte Drohne.
   * @param {number} delta - Zeit seit dem letzten Frame in Millisekunden.
   * @returns {void}
   */
  static updateScoutApproach(sprite, delta) {
    LevelTwoScoutDroneSystem.update(sprite, delta);
  }

  /**
   * Erstellt den separaten Lichtkegel nur für entsprechend konfigurierte Drohnen.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @param {object} drone - Konfiguration der Drohnenvariante.
   * @returns {Phaser.GameObjects.Graphics|null} Lichtkegel oder `null`.
   */
  static createTrackingBeam(scene, drone) {
    return LevelTwoDroneBeamSystem.create(scene, drone);
  }

  /**
   * Richtet den roten Lichtkegel der großen Drohne auf die Bulldogge aus.
   * @param {Phaser.GameObjects.Sprite} sprite - Lichtquelle.
   * @param {Phaser.Physics.Arcade.Sprite} player - Verfolgtes Ziel.
   * @returns {void}
   */
  static updateTrackingBeam(sprite, player) {
    LevelTwoDroneBeamSystem.update(sprite, player);
  }

  /**
   * Bewegt eine Drohne dauerhaft zwischen den hinteren Patrouillengrenzen.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @param {Phaser.GameObjects.Sprite} sprite - Bewegte Drohne.
   * @param {object} settings - Gemeinsame Drohneneinstellungen.
   * @param {object} drone - Konfiguration der Drohnenvariante.
   * @returns {Phaser.Tweens.Tween} Horizontaler Patrouillen-Tween.
   */
  static createPatrolTween(scene, sprite, settings, drone) {
    const targetX = drone.initialDirection > 0
      ? settings.patrolMaxX
      : settings.patrolMinX;
    const distance = settings.patrolMaxX - settings.patrolMinX;

    return scene.tweens.add({
      targets: sprite,
      x: targetX,
      duration: distance / drone.speed * 1_000,
      ease: "Linear",
      yoyo: true,
      repeat: -1,
      onYoyo: () => sprite.toggleFlipX(),
      onRepeat: () => sprite.toggleFlipX(),
    });
  }

  /**
   * Ergänzt eine kleine unabhängige Schwebewegung.
   * @param {Phaser.Scene} scene - Aktive Level-2-Szene.
   * @param {Phaser.GameObjects.Sprite} sprite - Schwebende Drohne.
   * @param {object} settings - Gemeinsame Drohneneinstellungen.
   * @param {object} drone - Konfiguration der Drohnenvariante.
   * @returns {Phaser.Tweens.Tween} Vertikaler Schwebe-Tween.
   */
  static createHoverTween(scene, sprite, settings, drone) {
    return scene.tweens.add({
      targets: sprite,
      y: drone.y + settings.hoverDistance,
      duration: settings.hoverDurationMs,
      ease: "Sine.inOut",
      yoyo: true,
      repeat: -1,
    });
  }
}
