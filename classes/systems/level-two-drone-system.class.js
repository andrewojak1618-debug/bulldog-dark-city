import Phaser from "phaser";
import { LEVEL_TWO } from "../../js/config/level-two-settings.js";
import { LevelTwoDroneBeamSystem } from
  "./level-two-drone-beam-system.class.js";
import { LevelTwoScoutDroneSystem } from
  "./level-two-scout-drone-system.class.js";
import { LevelTwoDroneAnimationSystem } from
  "./level-two-drone-animation-system.class.js";

/**
 * Manages level two drone system behavior.
 */
export class LevelTwoDroneSystem {
  /**
   * Loads the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static load(scene) {
    LevelTwoDroneAnimationSystem.load(scene);
  }

  /**
   * Creates the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {Phaser.GameObjects.Sprite[]} The resulting collection.
   */
  static create(scene) {
    return LEVEL_TWO.drones.variants.map((drone) =>
      this.createDrone(scene, drone),
    );
  }

  /**
   * Creates drone.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {object} drone - The drone value.
   * @returns {Phaser.GameObjects.Sprite} The resulting data object.
   */
  static createDrone(scene, drone) {
    const settings = LEVEL_TWO.drones;
    LevelTwoDroneAnimationSystem.register(scene, settings, drone);
    const sprite = this.createDroneSprite(scene, settings, drone);
    this.initializeCoreData(scene, sprite, settings, drone);
    this.initializeVisualData(scene, sprite, settings, drone);
    return sprite;
  }

  /**
   * Creates drone sprite.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {object} settings - The configuration values to use.
   * @param {object} drone - The drone value.
   * @returns {Phaser.GameObjects.Sprite} The resulting data object.
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
   * Initializes core data.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.GameObjects.Sprite} sprite - The sprite value.
   * @param {object} settings - The configuration values to use.
   * @param {object} drone - The drone value.
   * @returns {void} No value is returned.
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
    sprite.setData("hitPoints", drone.hitPoints);
    sprite.setData("isDestroyed", false);
  }

  /**
   * Initializes visual data.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.GameObjects.Sprite} sprite - The sprite value.
   * @param {object} settings - The configuration values to use.
   * @param {object} drone - The drone value.
   * @returns {void} No value is returned.
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
   * Updates the current state.
   * @param {Phaser.GameObjects.Sprite[]} drones - The drones value.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @param {number} delta - The elapsed time since the previous frame in milliseconds.
   * @returns {void} No value is returned.
   */
  static update(drones = [], player, delta = 0) {
    if (!player) return;
    drones.forEach((sprite) => this.updateDrone(sprite, player, delta));
  }

  /**
   * Updates drone.
   * @param {Phaser.GameObjects.Sprite} sprite - The sprite value.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @param {number} delta - The elapsed time since the previous frame in milliseconds.
   * @returns {void} No value is returned.
   */
  static updateDrone(sprite, player, delta) {
    if (sprite.getData("isDestroyed")) return;
    const isNearby = Math.abs(player.x - sprite.x) <=
      LEVEL_TWO.drones.detectionRange;
    if (!isNearby) {
      this.deactivateAlarm(sprite);
      return;
    }
    this.activateAlarm(sprite);
    this.updateAlarmPatrol(sprite, player, delta);
    this.updateScoutApproach(sprite, delta);
    this.updateTrackingBeam(sprite, player);
  }

  /**
   * Handles activate alarm.
   * @param {Phaser.GameObjects.Sprite} sprite - The sprite value.
   * @returns {void} No value is returned.
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
   * Handles deactivate alarm.
   * @param {Phaser.GameObjects.Sprite} sprite - The sprite value.
   * @returns {void} No value is returned.
   */
  static deactivateAlarm(sprite) {
    if (!sprite.getData("isAlert")) return;
    const drone = sprite.getData("drone");

    sprite.setData("isAlert", false);
    sprite.setOrigin(0.5);
    sprite.getData("beam")?.clear();
    if (drone.scoutApproach) {
      this.resetScoutApproach(sprite, drone);
    }
    sprite.play(drone.animationKey);
    sprite.getData("patrolTween")?.resume();
  }

  /**
   * Resets scout approach.
   * @param {Phaser.GameObjects.Sprite} sprite - The sprite value.
   * @param {object} drone - The drone value.
   * @returns {void} No value is returned.
   */
  static resetScoutApproach(sprite, drone) {
    sprite.y = drone.y;
    sprite.setData("scoutStep", 0);
    sprite.setData("scoutDirection", 1);
    sprite.setData("scoutPauseRemaining", 0);
    sprite.getData("hoverTween")?.restart();
  }

  /**
   * Updates alarm patrol.
   * @param {Phaser.GameObjects.Sprite} sprite - The sprite value.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @param {number} delta - The elapsed time since the previous frame in milliseconds.
   * @returns {void} No value is returned.
   */
  static updateAlarmPatrol(sprite, player, delta) {
    const settings = LEVEL_TWO.drones;
    const { minX, maxX } = this.getAlarmPatrolBounds(settings, player);
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
   * Returns alarm patrol bounds.
   * @param {object} settings - The configuration values to use.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @returns {{minX: number, maxX: number}} The resulting numeric value.
   */
  static getAlarmPatrolBounds(settings, player) {
    return {
      minX: Math.max(
        settings.patrolMinX,
        player.x - settings.alarmPatrolRadius,
      ),
      maxX: Math.min(
        settings.patrolMaxX,
        player.x + settings.alarmPatrolRadius,
      ),
    };
  }

  /**
   * Updates scout approach.
   * @param {Phaser.GameObjects.Sprite} sprite - The sprite value.
   * @param {number} delta - The elapsed time since the previous frame in milliseconds.
   * @returns {void} No value is returned.
   */
  static updateScoutApproach(sprite, delta) {
    LevelTwoScoutDroneSystem.update(sprite, delta);
  }

  /**
   * Creates tracking beam.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {object} drone - The drone value.
   * @returns {Phaser.GameObjects.Graphics|null} The resulting data object.
   */
  static createTrackingBeam(scene, drone) {
    return LevelTwoDroneBeamSystem.create(scene, drone);
  }

  /**
   * Updates tracking beam.
   * @param {Phaser.GameObjects.Sprite} sprite - The sprite value.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @returns {void} No value is returned.
   */
  static updateTrackingBeam(sprite, player) {
    LevelTwoDroneBeamSystem.update(sprite, player);
  }

  /**
   * Creates patrol tween.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.GameObjects.Sprite} sprite - The sprite value.
   * @param {object} settings - The configuration values to use.
   * @param {object} drone - The drone value.
   * @returns {Phaser.Tweens.Tween} The created instance.
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
   * Creates hover tween.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Phaser.GameObjects.Sprite} sprite - The sprite value.
   * @param {object} settings - The configuration values to use.
   * @param {object} drone - The drone value.
   * @returns {Phaser.Tweens.Tween} The created instance.
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
