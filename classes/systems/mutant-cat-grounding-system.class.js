/** Hält bodengebundene Katzen auf ihrer zuerst erreichten Laufebene. */
export class MutantCatGroundingSystem {
  static groundBottoms = new WeakMap();

  /**
   * Registriert oder korrigiert den festen Bodenkontakt einer Katze.
   * @param {import("../entities/enemies/mutant-cat.class.js").MutantCat} cat
   * Zu stabilisierende Katze.
   * @returns {void}
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
   * Speichert die erste durch Arcade Physics bestätigte Bodenposition.
   * @param {import("../entities/enemies/mutant-cat.class.js").MutantCat} cat
   * Zu registrierende Katze.
   * @returns {void}
   */
  static registerGroundContact(cat) {
    if (!this.isGrounded(cat)) return;
    this.groundBottoms.set(cat, cat.body.bottom);
    cat.body.setAllowGravity(false);
    cat.setVelocityY(0);
  }

  /**
   * Setzt eine abgewichene Physics-Unterkante auf die Laufebene zurück.
   * @param {import("../entities/enemies/mutant-cat.class.js").MutantCat} cat
   * Zu korrigierende Katze.
   * @returns {void}
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
   * Prüft den von Arcade Physics gemeldeten Bodenkontakt.
   * @param {import("../entities/enemies/mutant-cat.class.js").MutantCat} cat
   * Zu prüfende Katze.
   * @returns {boolean} Ob die Katze den Boden berührt.
   */
  static isGrounded(cat) {
    return cat.body.blocked.down || cat.body.touching.down;
  }

  /**
   * Ändert Darstellung und Hitbox, ohne die Bodenkante zu verschieben.
   * @param {import("../entities/enemies/mutant-cat.class.js").MutantCat} cat - Katze.
   * @param {number} width - Gewünschte Darstellungsbreite.
   * @param {number} height - Gewünschte Darstellungshöhe.
   * @param {number|null} [bodyOffsetY=null] - Optionaler vertikaler Hitbox-Offset.
   * @returns {void}
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
