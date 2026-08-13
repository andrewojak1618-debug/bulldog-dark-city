/**
 * Manages mutant cat grounding system behavior.
 */
export class MutantCatGroundingSystem {
  static groundBottoms = new WeakMap();

  /**
   * Updates the current state.
   * @param {import("../entities/enemies/mutant-cat.class.js").MutantCat} cat - The mutant cat instance.
   * @returns {void} No value is returned.
   */
  static update(cat) {
    if (!cat?.body?.enable || cat.isDead) return;
    if (!this.groundBottoms.has(cat)) {
      this.registerGroundContact(cat);
      return;
    }
    this.restoreGroundContact(cat);
  }

  /**
   * Registers ground contact.
   * @param {import("../entities/enemies/mutant-cat.class.js").MutantCat} cat - The mutant cat instance.
   * @returns {void} No value is returned.
   */
  static registerGroundContact(cat) {
    if (!this.isGrounded(cat)) return;
    this.groundBottoms.set(cat, cat.body.bottom);
    cat.body.setAllowGravity(false);
    cat.setVelocityY(0);
  }

  /**
   * Restores ground contact.
   * @param {import("../entities/enemies/mutant-cat.class.js").MutantCat} cat - The mutant cat instance.
   * @returns {void} No value is returned.
   */
  static restoreGroundContact(cat) {
    const groundBottom = this.groundBottoms.get(cat);
    const correction = groundBottom - cat.body.bottom;
    cat.setVelocityY(0);
    if (Math.abs(correction) < 0.01) return;
    cat.y += correction;
    cat.body.updateFromGameObject();
  }

  /**
   * Checks the grounded condition.
   * @param {import("../entities/enemies/mutant-cat.class.js").MutantCat} cat - The mutant cat instance.
   * @returns {boolean} Whether the requested condition is met.
   */
  static isGrounded(cat) {
    return cat.body.blocked.down || cat.body.touching.down;
  }

  /**
   * Applies geometry keeping body bottom.
   * @param {import("../entities/enemies/mutant-cat.class.js").MutantCat} cat - The mutant cat instance.
   * @param {number} width - The width in pixels.
   * @param {number} height - The height in pixels.
   * @param {number|null} [bodyOffsetY=null] - The body offset y value.
   * @returns {void} No value is returned.
   */
  static applyGeometryKeepingBodyBottom(cat, width, height, bodyOffsetY = null) {
    const bodyBottom = cat.body.bottom;
    if (Number.isFinite(bodyOffsetY)) {
      cat.body.setOffset(cat.body.offset.x, bodyOffsetY);
    }
    cat.setDisplaySize(width, height);
    cat.body.updateFromGameObject();
    cat.y += bodyBottom - cat.body.bottom;
    cat.body.updateFromGameObject();
  }
}
