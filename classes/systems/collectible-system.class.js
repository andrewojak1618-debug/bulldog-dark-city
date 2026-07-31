/**
 * Verwaltet die Zähler aller eingesammelten Objektarten.
 */
export class CollectibleSystem {
  /**
   * Erstellt für jeden bekannten Schlüssel einen Zähler mit dem Wert null.
   * @param {ReadonlyArray<string>} keys - Unterstützte Sammelobjektschlüssel.
   */
  constructor(keys) {
    this.counts = new Map(keys.map((key) => [key, 0]));
    this.listeners = new Set();
  }

  /**
   * Erhöht einen registrierten Sammelzähler.
   * @param {string} key - Schlüssel der Objektart.
   * @param {number} [amount=1] - Hinzuzufügende Anzahl.
   * @returns {number} Neuer Zählerstand.
   */
  collect(key, amount = 1) {
    if (!this.counts.has(key)) {
      throw new Error(`Unbekanntes Sammelobjekt: ${key}`);
    }

    const count = this.counts.get(key) + Math.max(0, amount);
    this.counts.set(key, count);
    this.emitChange(key, count);
    return count;
  }

  /**
   * Liest den aktuellen Wert eines Sammelobjekts.
   * @param {string} key - Schlüssel der Objektart.
   * @returns {number} Aktueller Zählerstand.
   */
  getCount(key) {
    return this.counts.get(key) ?? 0;
  }

  /**
   * Registriert eine Anzeige für Zähleränderungen.
   * @param {(key: string, count: number) => void} listener - Callback.
   * @returns {() => void} Funktion zum Entfernen des Callbacks.
   */
  onChange(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Informiert alle registrierten Anzeigen über einen neuen Zählerstand.
   * @param {string} key - Geänderter Schlüssel.
   * @param {number} count - Neuer Zählerstand.
   * @returns {void}
   */
  emitChange(key, count) {
    this.listeners.forEach((listener) => listener(key, count));
  }
}
