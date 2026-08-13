import { LEVEL_TWO } from "../../js/config/level-two-settings.js";

/**
 * Manages level two drone beam system behavior.
 */
export class LevelTwoDroneBeamSystem {
  /**
   * Creates the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {object} drone - The drone value.
   * @returns {Phaser.GameObjects.Graphics|null} The resulting data object.
   */
  static create(scene, drone) {
    if (!drone.tracksPlayerWithBeam) return null;
    return scene.add.graphics().setDepth(LEVEL_TWO.drones.beamDepth);
  }

  /**
   * Updates the current state.
   * @param {Phaser.GameObjects.Sprite} sprite - The sprite value.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @returns {void} No value is returned.
   */
  static update(sprite, player) {
    const beam = sprite.getData("beam");
    if (!beam) return;
    beam.clear();
    const geometry = this.calculateGeometry(sprite, player);
    if (geometry) this.draw(beam, geometry);
  }

  /**
   * Calculates geometry.
   * @param {Phaser.GameObjects.Sprite} sprite - The sprite value.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @returns {object|null} The resulting data object.
   */
  static calculateGeometry(sprite, player) {
    const targetY = player.body?.center.y ?? player.y;
    const directionX = player.x - sprite.x;
    const directionY = targetY - sprite.y;
    const distance = Math.hypot(directionX, directionY);
    if (distance === 0) return null;
    return this.createGeometry(
      sprite,
      player.x,
      targetY,
      directionX / distance,
      directionY / distance,
    );
  }

  /**
   * Creates geometry.
   * @param {Phaser.GameObjects.Sprite} sprite - The sprite value.
   * @param {number} targetX - The target x value.
   * @param {number} targetY - The target y value.
   * @param {number} normalX - The normal x value.
   * @param {number} normalY - The normal y value.
   * @returns {object} The resulting data object.
   */
  static createGeometry(sprite, targetX, targetY, normalX, normalY) {
    const settings = LEVEL_TWO.drones;
    const halfWidth = settings.beamEndHalfWidth;
    return {
      startX: sprite.x + normalX * settings.beamStartOffset,
      startY: sprite.y + normalY * settings.beamStartOffset,
      targetX,
      targetY,
      edgeX: -normalY * halfWidth,
      edgeY: normalX * halfWidth,
    };
  }

  /**
   * Draws the current state.
   * @param {Phaser.GameObjects.Graphics} beam - The beam value.
   * @param {object} geometry - The geometry value.
   * @returns {void} No value is returned.
   */
  static draw(beam, geometry) {
    const settings = LEVEL_TWO.drones;
    const { startX, startY, targetX, targetY, edgeX, edgeY } = geometry;
    beam.fillStyle(settings.beamColor, settings.beamFillAlpha);
    beam.fillTriangle(
      startX,
      startY,
      targetX + edgeX,
      targetY + edgeY,
      targetX - edgeX,
      targetY - edgeY,
    );
    beam.lineStyle(2, settings.beamColor, settings.beamLineAlpha);
    beam.lineBetween(startX, startY, targetX, targetY);
  }
}
