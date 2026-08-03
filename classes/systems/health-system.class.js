/**
 * Verwaltet begrenzte Lebenspunkte und informiert die HUD-Anzeige.
 */
export class HealthSystem {
  /**
   * Erstellt einen vollständig gefüllten Lebenspunktevorrat.
   * @param {number} maximum - Maximale Lebenspunkte.
   * @param {number} [current=maximum] - Zu übernehmende Lebenspunkte.
   */
  constructor(maximum = 100, current = maximum) {
    this.maximum = Number.isFinite(maximum) ? Math.max(0, maximum) : 100;
    this.current = Math.min(
      this.maximum,
      Math.max(0, Number.isFinite(current) ? current : this.maximum),
    );
    this.listeners = new Set();
  }

  /**
   * Gibt den aktuellen Lebenspunktestand für einen Szenenwechsel zurück.
   * @returns {number} Aktuelle Lebenspunkte.
   */
  getCurrent() {
    return this.current;
  }

  /**
   * Zieht Schaden ab, ohne den Wert unter null fallen zu lassen.
   * @param {number} amount - Abzuziehende Lebenspunkte.
   * @returns {number} Verbleibende Lebenspunkte.
   */
  takeDamage(amount) {
    this.current = Math.max(0, this.current - Math.max(0, amount));
    this.emitChange();
    return this.current;
  }

  /**
   * Heilt bis zum konfigurierten Maximum.
   * @param {number} amount - Hinzuzufügende Lebenspunkte.
   * @returns {number} Aktuelle Lebenspunkte.
   */
  heal(amount) {
    this.current = Math.min(
      this.maximum,
      this.current + Math.max(0, amount),
    );
    this.emitChange();
    return this.current;
  }

  /**
   * Prüft, ob keine weiteren Lebenspunkte aufgenommen werden können.
   * @returns {boolean} `true`, wenn die Lebenspunkte vollständig gefüllt sind.
   */
  isFull() {
    return this.current >= this.maximum;
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
