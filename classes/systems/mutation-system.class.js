/**
 * Verwaltet den begrenzten Fortschritt bis zur Mutation.
 */
export class MutationSystem {
  /**
   * Erstellt eine leere Mutationsanzeige.
   * @param {number} maximum - Für eine volle Mutation benötigter Wert.
   */
  constructor(maximum = 100) {
    this.maximum = maximum;
    this.current = 0;
    this.listeners = new Set();
  }

  /**
   * Erhöht den Mutationsfortschritt bis zum Maximum.
   * @param {number} amount - Hinzuzufügender Wert.
   * @returns {number} Aktueller Mutationswert.
   */
  add(amount) {
    this.current = Math.min(
      this.maximum,
      this.current + Math.max(0, amount),
    );
    this.emitChange();
    return this.current;
  }

  /**
   * Registriert eine Anzeige für künftige Änderungen.
   * @param {(current: number, maximum: number) => void} listener - Callback.
   * @returns {() => void} Funktion zum Entfernen des Callbacks.
   */
  onChange(listener) {
    this.listeners.add(listener);
    listener(this.current, this.maximum);
    return () => this.listeners.delete(listener);
  }

  /**
   * Informiert alle registrierten Anzeigen über den neuen Wert.
   * @returns {void}
   */
  emitChange() {
    this.listeners.forEach((listener) => {
      listener(this.current, this.maximum);
    });
  }
}
