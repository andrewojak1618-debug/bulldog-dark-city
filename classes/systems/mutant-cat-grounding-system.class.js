/** Hält bodengebundene Katzen auf ihrer zuerst erreichten Laufebene. */
export class MutantCatGroundingSystem {
  static groundBottoms = new WeakMap();

  /** Registriert oder korrigiert den festen Bodenkontakt einer Katze. */
  static update(cat) {
    if (!cat?.body?.enable || cat.isDead) return;
    if (!this.groundBottoms.has(cat)) {
      this.registerGroundContact(cat);
      return;
    }
    this.restoreGroundContact(cat);
  }

  /** Speichert die erste durch Arcade Physics bestätigte Bodenposition. */
  static registerGroundContact(cat) {
    if (!this.isGrounded(cat)) return;
    this.groundBottoms.set(cat, cat.body.bottom);
    cat.body.setAllowGravity(false);
    cat.setVelocityY(0);
  }

  /** Setzt eine abgewichene Physics-Unterkante auf die Laufebene zurück. */
  static restoreGroundContact(cat) {
    const groundBottom = this.groundBottoms.get(cat);
    const correction = groundBottom - cat.body.bottom;
    cat.setVelocityY(0);
    if (Math.abs(correction) < 0.01) return;
    cat.y += correction;
    cat.body.updateFromGameObject();
  }

  /** Prüft den von Arcade Physics gemeldeten Bodenkontakt. */
  static isGrounded(cat) {
    return cat.body.blocked.down || cat.body.touching.down;
  }
}
