import {
  MUTANT_CAT,
  MUTANT_CAT_STATES,
} from "../../js/config/mutant-cat-settings.js";

/** Bündelt Reichweiten- und Höhenprüfungen der mutierten Katze. */
export class MutantCatDetectionSystem {
  /**
   * Prüft horizontale Entfernung und annähernd gleiche Laufhöhe.
   * @param {Phaser.Physics.Arcade.Sprite} cat - Prüfende Katze.
   * @param {Phaser.Physics.Arcade.Sprite} player - Begegnende Bulldogge.
   * @returns {boolean} Ob die Katze die Bulldogge bemerkt.
   */
  static canDetect(cat, player) {
    if (!player?.body || !cat.body) return false;
    return this.getHorizontalDistance(cat, player) <=
      MUTANT_CAT.detectionRange && this.isWithinHeight(cat, player);
  }

  /**
   * Begrenzt Aufmerksamkeit und Angriff auf die erlaubte Laufhöhe.
   * @param {Phaser.Physics.Arcade.Sprite} cat - Prüfende Katze.
   * @param {Phaser.Physics.Arcade.Sprite} player - Begegnende Bulldogge.
   * @returns {boolean} Ob die vertikale Entfernung zulässig ist.
   */
  static isWithinHeight(cat, player) {
    if (!player?.body || !cat.body) return false;
    const heightDifference = Math.abs(player.body.bottom - cat.body.bottom);
    return heightDifference <= MUTANT_CAT.detectionHeightTolerance;
  }

  /**
   * Prüft, ob die Katze ihre aktive Begegnung beenden soll.
   * @param {Phaser.Physics.Arcade.Sprite} cat - Prüfende Katze.
   * @param {Phaser.Physics.Arcade.Sprite} player - Begegnende Bulldogge.
   * @returns {boolean} Ob die Katze zur Patrouille zurückkehren soll.
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
   * Liefert den absoluten horizontalen Abstand zur Bulldogge.
   * @param {Phaser.Physics.Arcade.Sprite} cat - Prüfende Katze.
   * @param {Phaser.Physics.Arcade.Sprite} player - Begegnende Bulldogge.
   * @returns {number} Horizontaler Abstand in Pixeln.
   */
  static getHorizontalDistance(cat, player) {
    return player ? Math.abs(player.x - cat.x) : Number.POSITIVE_INFINITY;
  }
}
