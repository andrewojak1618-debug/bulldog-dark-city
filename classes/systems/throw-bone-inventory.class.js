/** Verwaltet die beiden Wurfknochen-Vorräte und informiert ihre Anzeige. */
export class ThrowBoneInventory {
  /**
   * Erstellt einen leeren Vorrat für alle bekannten Knochenarten.
   * @param {string[]} types - Erlaubte Knochenarten.
   */
  constructor(types = []) {
    this.counts = new Map(types.map((type) => [type, 0]));
    this.listeners = new Set();
  }

  /**
   * Gibt den aktuellen Vorrat einer Knochenart zurück.
   * @param {string} type - Abzufragende Knochenart.
   * @returns {number} Aktuell verfügbare Anzahl.
   */
  getCount(type) {
    return this.counts.get(type) ?? 0;
  }

  /**
   * Fügt einen Knochen hinzu und informiert alle Beobachter.
   * @param {string} type - Eingesammelte Knochenart.
   * @returns {boolean} Ob die bekannte Knochenart aufgenommen wurde.
   */
  collect(type) {
    if (!this.counts.has(type)) return false;
    this.counts.set(type, this.getCount(type) + 1);
    this.emitChange(type);
    return true;
  }

  /**
   * Verbraucht genau einen Knochen, sofern ein Vorrat vorhanden ist.
   * @param {string} type - Zu verbrauchende Knochenart.
   * @returns {boolean} Ob ein Knochen verbraucht wurde.
   */
  consume(type) {
    const count = this.getCount(type);
    if (count <= 0) return false;
    this.counts.set(type, count - 1);
    this.emitChange(type);
    return true;
  }

  /**
   * Registriert einen Listener und übermittelt sofort alle Anfangswerte.
   * @param {Function} listener - Empfänger für Typ und aktuellen Vorrat.
   * @returns {Function} Funktion zum Entfernen des Listeners.
   */
  onChange(listener) {
    this.listeners.add(listener);
    this.counts.forEach((count, type) => listener(type, count));
    return () => this.listeners.delete(listener);
  }

  /**
   * Informiert alle Listener über den veränderten Vorrat.
   * @param {string} type - Veränderte Knochenart.
   * @returns {void}
   */
  emitChange(type) {
    const count = this.getCount(type);
    this.listeners.forEach((listener) => listener(type, count));
  }
}
