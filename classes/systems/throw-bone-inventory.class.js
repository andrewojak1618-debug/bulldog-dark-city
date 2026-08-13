/**
 * Manages throw bone inventory behavior.
 */
export class ThrowBoneInventory {
  /**
   * Creates a new instance.
   * @param {string[]} types - The types value.
   */
  constructor(types = []) {
    this.counts = new Map(types.map((type) => [type, 0]));
    this.listeners = new Set();
  }

  /**
   * Returns count.
   * @param {string} type - The requested item type.
   * @returns {number} The resulting numeric value.
   */
  getCount(type) {
    return this.counts.get(type) ?? 0;
  }

  /**
   * Collects the current state.
   * @param {string} type - The requested item type.
   * @returns {boolean} Whether the requested condition is met.
   */
  collect(type) {
    if (!this.counts.has(type)) return false;
    this.counts.set(type, this.getCount(type) + 1);
    this.emitChange(type);
    return true;
  }

  /**
   * Consumes the current state.
   * @param {string} type - The requested item type.
   * @returns {boolean} Whether the requested condition is met.
   */
  consume(type) {
    const count = this.getCount(type);
    if (count <= 0) return false;
    this.counts.set(type, count - 1);
    this.emitChange(type);
    return true;
  }

  /**
   * Handles on change.
   * @param {Function} listener - The listener value.
   * @returns {Function} The generated callback function.
   */
  onChange(listener) {
    this.listeners.add(listener);
    this.counts.forEach((count, type) => listener(type, count));
    return () => this.listeners.delete(listener);
  }

  /**
   * Handles emit change.
   * @param {string} type - The requested item type.
   * @returns {void} No value is returned.
   */
  emitChange(type) {
    const count = this.getCount(type);
    this.listeners.forEach((listener) => listener(type, count));
  }
}
