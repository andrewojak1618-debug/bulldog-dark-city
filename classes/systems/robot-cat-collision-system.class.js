import { ROBOT_CAT } from "../../js/config/robot-cat-settings.js";

/**
 * Manages robot cat collision system behavior.
 */
export class RobotCatCollisionSystem {
  /**
   * Creates the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {number} groundY - The ground y value.
   * @returns {Phaser.GameObjects.Rectangle} The resulting data object.
   */
  static create(scene, groundY) {
    const collision = scene.add.rectangle(
      ROBOT_CAT.spawnX,
      groundY - ROBOT_CAT.collisionHeight / 2,
      ROBOT_CAT.collisionWidth,
      ROBOT_CAT.collisionHeight,
    ).setVisible(false);
    scene.physics.add.existing(collision, true);
    return collision;
  }

  /**
   * Checks the block grounded player condition.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @param {number} surfaceY - The surface y value.
   * @returns {boolean} Whether the requested condition is met.
   */
  static canBlockGroundedPlayer(robotCat, player, surfaceY) {
    const collision = robotCat?.getData("collision");
    if (!collision?.body?.enable || !player?.body) return false;
    return player.body.bottom >= surfaceY - ROBOT_CAT.groundCollisionTolerance;
  }

  /**
   * Sets enabled.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @param {boolean} isEnabled - The is enabled value.
   * @returns {void} No value is returned.
   */
  static setEnabled(robotCat, isEnabled) {
    const collision = robotCat.getData("collision");
    if (collision?.body) collision.body.enable = isEnabled;
  }

  /**
   * Synchronizes the current state.
   * @param {Phaser.GameObjects.Sprite} robotCat - The robot cat instance.
   * @returns {void} No value is returned.
   */
  static sync(robotCat) {
    const collision = robotCat.getData("collision");
    collision?.setX(robotCat.x);
    collision?.body?.updateFromGameObject();
  }
}
