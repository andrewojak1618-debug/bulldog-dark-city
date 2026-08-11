import { ROBOT_CAT } from "../../js/config/robot-cat-settings.js";

/** Erstellt und synchronisiert die Blockierfläche der Roboterkatze. */
export class RobotCatCollisionSystem {
  /**
   * Erstellt eine statische Hitbox innerhalb der sichtbaren Roboterkontur.
   * @param {Phaser.Scene} scene - Aktive Level-3-Szene.
   * @param {number} groundY - Unterkante der Roboterkatze.
   * @returns {Phaser.GameObjects.Rectangle} Unsichtbare Roboter-Hitbox.
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
   * Erlaubt die seitliche Blockade nur auf der gemeinsamen Laufebene.
   * @param {Phaser.GameObjects.Sprite} robotCat - Roboterkatze mit Hitbox.
   * @param {Phaser.Physics.Arcade.Sprite} player - Steuerbare Bulldogge.
   * @param {number} surfaceY - Technische Laufkante des Levels.
   * @returns {boolean} Ob Phaser die seitliche Kollision auflösen darf.
   */
  static canBlockGroundedPlayer(robotCat, player, surfaceY) {
    const collision = robotCat?.getData("collision");
    if (!collision?.body?.enable || !player?.body) return false;
    return player.body.bottom >= surfaceY - ROBOT_CAT.groundCollisionTolerance;
  }

  /**
   * Aktiviert oder deaktiviert die seitliche Blockierfläche.
   * @param {Phaser.GameObjects.Sprite} robotCat - Roboterkatzen-Sprite.
   * @param {boolean} isEnabled - Gewünschter Kollisionszustand.
   * @returns {void}
   */
  static setEnabled(robotCat, isEnabled) {
    const collision = robotCat.getData("collision");
    if (collision?.body) collision.body.enable = isEnabled;
  }

  /**
   * Richtet die Blockierfläche an der sichtbaren Roboterkatze aus.
   * @param {Phaser.GameObjects.Sprite} robotCat - Roboterkatzen-Sprite.
   * @returns {void}
   */
  static sync(robotCat) {
    const collision = robotCat.getData("collision");
    collision?.setX(robotCat.x);
    collision?.body?.updateFromGameObject();
  }
}
