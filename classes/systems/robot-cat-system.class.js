import {
  ROBOT_CAT,
  ROBOT_CAT_STATES,
  ROBOT_CAT_WALK_TEXTURE,
} from "../../js/config/robot-cat-settings.js";
import { RobotCatAnimationSystem } from
  "./robot-cat-animation-system.class.js";
import { RobotCatAudioSystem } from
  "./robot-cat-audio-system.class.js";
import { RobotCatCollisionSystem } from
  "./robot-cat-collision-system.class.js";
import { RobotCatFlightSystem } from
  "./robot-cat-flight-system.class.js";

/**
 * Manages robot cat system behavior.
 */
export class RobotCatSystem {
  /**
   * Loads the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static load(scene) {
    RobotCatAnimationSystem.load(scene);
    RobotCatAudioSystem.load(scene);
  }

  /**
   * Creates the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {number} surfaceY - The surface y value.
   * @returns {Phaser.GameObjects.Sprite} The resulting data object.
   */
  static create(scene, surfaceY) {
    const groundY = surfaceY + ROBOT_CAT.groundOffsetY;
    RobotCatAnimationSystem.register(scene);
    const collision = RobotCatCollisionSystem.create(scene, groundY);
    const robotCat = this.createSprite(scene, groundY);
    this.initializeMovementData(robotCat, collision, groundY);
    scene.events.once("shutdown", () =>
      RobotCatAudioSystem.stopThrustFlight(robotCat)
    );
    return robotCat;
  }

  /**
   * Creates sprite.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {number} groundY - The ground y value.
   * @returns {Phaser.GameObjects.Sprite} The resulting data object.
   */
  static createSprite(scene, groundY) {
    return scene.add.sprite(
      ROBOT_CAT.spawnX,
      groundY,
      ROBOT_CAT_WALK_TEXTURE.key,
      0,
    ).setOrigin(0.5, 1)
      .setDisplaySize(ROBOT_CAT.displayWidth, ROBOT_CAT.displayHeight)
      .setDepth(ROBOT_CAT.depth)
      .play(ROBOT_CAT_WALK_TEXTURE.animationKey);
  }

  /**
   * Initializes movement data.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @param {Phaser.GameObjects.Rectangle} collision - The collision value.
   * @param {number} groundY - The ground y value.
   * @returns {void} No value is returned.
   */
  static initializeMovementData(robotCat, collision, groundY) {
    robotCat.setDataEnabled();
    Object.entries(this.createMovementData(collision, groundY))
      .forEach(([key, value]) => robotCat.setData(key, value));
  }

  /**
   * Creates the initial robot cat movement data.
   * @param {Phaser.GameObjects.Rectangle} collision - The collision object.
   * @param {number} groundY - The ground position.
   * @returns {object} The movement data.
   */
  static createMovementData(collision, groundY) {
    return {
      direction: -1,
      collision,
      groundY,
      movementState: ROBOT_CAT_STATES.walking,
      stateElapsed: 0,
      activeObstacleX: null,
      lastObstacleId: null,
      lastObstacleX: null,
      thrustFlightSound: null,
      thrustFlightFadeTween: null,
    };
  }

  /**
   * Checks the block grounded player condition.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @param {number} surfaceY - The surface y value.
   * @returns {boolean} Whether the requested condition is met.
   */
  static canBlockGroundedPlayer(robotCat, player, surfaceY) {
    return RobotCatCollisionSystem.canBlockGroundedPlayer(
      robotCat,
      player,
      surfaceY,
    );
  }

  /**
   * Updates the current state.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @param {number} delta - The elapsed time since the previous frame in milliseconds.
   * @param {Phaser.Physics.Arcade.Sprite|null} [player=null] - The player-controlled bulldog.
   * @returns {void} No value is returned.
   */
  static update(robotCat, delta, player = null) {
    if (!this.canUpdateMovement(robotCat, player)) return;
    const state = robotCat.getData("movementState");
    if (state !== ROBOT_CAT_STATES.walking) {
      RobotCatFlightSystem.update(robotCat, delta);
      return;
    }
    this.updateWalking(robotCat, delta, player);
  }

  /**
   * Checks the update movement condition.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @param {Phaser.Physics.Arcade.Sprite|null} player - The player-controlled bulldog.
   * @returns {boolean} Whether the requested condition is met.
   */
  static canUpdateMovement(robotCat, player) {
    return Boolean(
      robotCat?.active &&
      !player?.isKnockedOut &&
      !robotCat.getData("isAttacking") &&
      !robotCat.getData("isHitReacting") &&
      !robotCat.getData("isDefeated"),
    );
  }

  /**
   * Updates walking.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @param {number} delta - The elapsed time since the previous frame in milliseconds.
   * @param {Phaser.Physics.Arcade.Sprite|null} player - The player-controlled bulldog.
   * @returns {void} No value is returned.
   */
  static updateWalking(robotCat, delta, player) {
    const movement = this.getGroundMovement(robotCat, delta);
    this.applyGroundMovement(robotCat, movement);
    this.resetPassedObstacle(robotCat);
    const obstacle = this.findObstacleAhead(
      robotCat,
      movement.direction,
      player,
    );
    if (obstacle) {
      RobotCatFlightSystem.begin(robotCat, obstacle);
      return;
    }
    RobotCatCollisionSystem.sync(robotCat);
  }

  /**
   * Returns ground movement.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @param {number} delta - The elapsed time since the previous frame in milliseconds.
   * @returns {{x: number, direction: number}} The resulting numeric value.
   */
  static getGroundMovement(robotCat, delta) {
    let direction = robotCat.getData("direction") ?? -1;
    let x = robotCat.x + direction * ROBOT_CAT.patrolSpeed * delta / 1_000;
    if (x <= ROBOT_CAT.patrolMinX || x >= ROBOT_CAT.patrolMaxX) {
      direction *= -1;
      x = this.clampPatrolX(x);
    }
    return { x, direction };
  }

  /**
   * Clamps patrol x.
   * @param {number} x - The horizontal position.
   * @returns {number} The resulting numeric value.
   */
  static clampPatrolX(x) {
    return Math.min(ROBOT_CAT.patrolMaxX, Math.max(ROBOT_CAT.patrolMinX, x));
  }

  /**
   * Applies ground movement.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @param {{x: number, direction: number}} movement - The movement value.
   * @returns {void} No value is returned.
   */
  static applyGroundMovement(robotCat, movement) {
    robotCat.setData("direction", movement.direction);
    robotCat.setX(movement.x).setFlipX(movement.direction > 0);
  }

  /**
   * Finds obstacle ahead.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @param {number} direction - The horizontal movement direction.
   * @param {Phaser.Physics.Arcade.Sprite|null} player - The player-controlled bulldog.
   * @returns {{id: string, x: number}|null} The resulting string value.
   */
  static findObstacleAhead(robotCat, direction, player = null) {
    const lastObstacleId = robotCat.getData("lastObstacleId");
    const candidates = this.getFlightObstacles(robotCat, player)
      .filter(({ id }) => id !== lastObstacleId)
      .map((obstacle) => this.getObstacleDistance(robotCat, obstacle, direction))
      .filter(({ distance, triggerDistance }) =>
        distance >= 0 && distance <= triggerDistance
      )
      .sort((first, second) => first.distance - second.distance);
    const obstacle = candidates[0];
    return obstacle ? { id: obstacle.id, x: obstacle.x } : null;
  }

  /**
   * Returns obstacle distance.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @param {{id: string, x: number, triggerDistance: number}} obstacle - The obstacle value.
   * @param {number} direction - The horizontal movement direction.
   * @returns {{id: string, x: number, triggerDistance: number, distance: number}} The resulting string value.
   */
  static getObstacleDistance(robotCat, obstacle, direction) {
    return {
      ...obstacle,
      distance: (obstacle.x - robotCat.x) * direction,
    };
  }

  /**
   * Returns flight obstacles.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @param {Phaser.Physics.Arcade.Sprite|null} player - The player-controlled bulldog.
   * @returns {{id: string, x: number, triggerDistance: number}[]} The resulting string value.
   */
  static getFlightObstacles(robotCat, player) {
    const obstacles = ROBOT_CAT.flightObstaclesX.map((x, index) => ({
      id: `box-${index}`,
      x,
      triggerDistance: ROBOT_CAT.obstacleTriggerDistance,
    }));
    if (this.isPlayerGroundObstacle(robotCat, player)) {
      obstacles.push(this.createPlayerObstacle(player));
    }
    return obstacles;
  }

  /**
   * Creates player obstacle.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @returns {{id: string, x: number, triggerDistance: number}} The resulting string value.
   */
  static createPlayerObstacle(player) {
    return {
      id: ROBOT_CAT.playerObstacleId,
      x: player.x,
      triggerDistance: ROBOT_CAT.playerObstacleTriggerDistance,
    };
  }

  /**
   * Checks the player ground obstacle condition.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @param {Phaser.Physics.Arcade.Sprite|null} player - The player-controlled bulldog.
   * @returns {boolean} Whether the requested condition is met.
   */
  static isPlayerGroundObstacle(robotCat, player) {
    if (!player?.active || !player.body?.enable || player.isKnockedOut) {
      return false;
    }
    const groundY = robotCat.getData("groundY");
    return Math.abs(player.body.bottom - groundY) <=
      ROBOT_CAT.playerObstacleGroundTolerance;
  }

  /**
   * Resets passed obstacle.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @returns {void} No value is returned.
   */
  static resetPassedObstacle(robotCat) {
    const obstacleX = robotCat.getData("lastObstacleX");
    if (obstacleX === null) return;
    if (Math.abs(robotCat.x - obstacleX) <= ROBOT_CAT.obstacleResetDistance) {
      return;
    }
    robotCat.setData("lastObstacleId", null);
    robotCat.setData("lastObstacleX", null);
  }
}
