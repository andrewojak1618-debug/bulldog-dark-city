import {
  MUTANT_CAT,
  MUTANT_CAT_STATES,
} from "../../js/config/mutant-cat-settings.js";

/**
 * Manages mutant cat detection system behavior.
 */
export class MutantCatDetectionSystem {
  /**
   * Checks the detect condition.
   * @param {Phaser.Physics.Arcade.Sprite} cat - The mutant cat instance.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @returns {boolean} Whether the requested condition is met.
   */
  static canDetect(cat, player) {
    if (!player?.body || !cat.body) return false;
    return this.getHorizontalDistance(cat, player) <=
      MUTANT_CAT.detectionRange && this.isWithinHeight(cat, player);
  }

  /**
   * Checks the within height condition.
   * @param {Phaser.Physics.Arcade.Sprite} cat - The mutant cat instance.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @returns {boolean} Whether the requested condition is met.
   */
  static isWithinHeight(cat, player) {
    if (!player?.body || !cat.body) return false;
    const heightDifference = Math.abs(player.body.bottom - cat.body.bottom);
    return heightDifference <= MUTANT_CAT.detectionHeightTolerance;
  }

  /**
   * Checks the disengage condition.
   * @param {Phaser.Physics.Arcade.Sprite} cat - The mutant cat instance.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @returns {boolean} Whether the requested condition is met.
   */
  static shouldDisengage(cat, player) {
    if (!this.isWithinHeight(cat, player)) return true;
    if (cat.state === MUTANT_CAT_STATES.patrol) {
      return !this.canDetect(cat, player);
    }
    return this.getHorizontalDistance(cat, player) >
      MUTANT_CAT.disengageRange;
  }

  /**
   * Returns horizontal distance.
   * @param {Phaser.Physics.Arcade.Sprite} cat - The mutant cat instance.
   * @param {Phaser.Physics.Arcade.Sprite} player - The player-controlled bulldog.
   * @returns {number} The resulting numeric value.
   */
  static getHorizontalDistance(cat, player) {
    return player ? Math.abs(player.x - cat.x) : Number.POSITIVE_INFINITY;
  }
}
