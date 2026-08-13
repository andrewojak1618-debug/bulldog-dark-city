/**
 * Manages health system behavior.
 */
export class HealthSystem {
  /**
   * Creates a new instance.
   * @param {number} maximum - The maximum value.
   * @param {number} [current=maximum] - The current value.
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
   * Returns current.
   * @returns {number} The resulting numeric value.
   */
  getCurrent() {
    return this.current;
  }

  /**
   * Handles take damage.
   * @param {number} amount - The amount value.
   * @returns {number} The resulting numeric value.
   */
  takeDamage(amount) {
    this.current = Math.max(0, this.current - Math.max(0, amount));
    this.emitChange();
    return this.current;
  }

  /**
   * Handles heal.
   * @param {number} amount - The amount value.
   * @returns {number} The resulting numeric value.
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
   * Checks the full condition.
   * @returns {boolean} Whether the requested condition is met.
   */
  isFull() {
    return this.current >= this.maximum;
  }

  /**
   * Handles on change.
   * @param {(current: number, maximum: number) => void} listener - The listener value.
   * @returns {() => void} No value is returned.
   */
  onChange(listener) {
    this.listeners.add(listener);
    listener(this.current, this.maximum);
    return () => this.listeners.delete(listener);
  }

  /**
   * Handles emit change.
   * @returns {void} No value is returned.
   */
  emitChange() {
    this.listeners.forEach((listener) => {
      listener(this.current, this.maximum);
    });
  }
}
