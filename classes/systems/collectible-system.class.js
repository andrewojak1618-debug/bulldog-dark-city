/**
 * Manages collectible system behavior.
 */
export class CollectibleSystem {
  /**
   * Creates a new instance.
   * @param {ReadonlyArray<string>} keys - The keys value.
   * @param {Readonly<Record<string, number>>} [initialCounts={}] - The initial counts value.
   */
  constructor(keys, initialCounts = {}) {
    this.counts = new Map(keys.map((key) => [
      key,
      this.getSafeInitialCount(initialCounts[key]),
    ]));
    this.listeners = new Set();
  }

  /**
   * Returns safe initial count.
   * @param {number} count - The count value.
   * @returns {number} The resulting numeric value.
   */
  getSafeInitialCount(count) {
    return Number.isFinite(count) ? Math.max(0, count) : 0;
  }

  /**
   * Collects the current state.
   * @param {string} key - The lookup key.
   * @param {number} [amount=1] - The amount value.
   * @param {number} [maximum=Number.POSITIVE_INFINITY] - The maximum value.
   * @returns {number} The resulting numeric value.
   */
  collect(key, amount = 1, maximum = Number.POSITIVE_INFINITY) {
    if (!this.counts.has(key)) {
      throw new Error(`Unbekanntes Sammelobjekt: ${key}`);
    }

    const count = Math.min(
      Math.max(0, maximum),
      this.counts.get(key) + Math.max(0, amount),
    );
    this.counts.set(key, count);
    this.emitChange(key, count);
    return count;
  }

  /**
   * Returns count.
   * @param {string} key - The lookup key.
   * @returns {number} The resulting numeric value.
   */
  getCount(key) {
    return this.counts.get(key) ?? 0;
  }

  /**
   * Sets count.
   * @param {string} key - The lookup key.
   * @param {number} count - The count value.
   * @returns {number} The resulting numeric value.
   */
  setCount(key, count) {
    if (!this.counts.has(key)) {
      throw new Error(`Unbekanntes Sammelobjekt: ${key}`);
    }
    const safeCount = this.getSafeInitialCount(count);
    this.counts.set(key, safeCount);
    this.emitChange(key, safeCount);
    return safeCount;
  }

  /**
   * Returns snapshot.
   * @returns {Record<string, number>} The resulting string value.
   */
  getSnapshot() {
    return Object.fromEntries(this.counts);
  }

  /**
   * Handles on change.
   * @param {(key: string, count: number) => void} listener - The listener value.
   * @returns {() => void} No value is returned.
   */
  onChange(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Handles emit change.
   * @param {string} key - The lookup key.
   * @param {number} count - The count value.
   * @returns {void} No value is returned.
   */
  emitChange(key, count) {
    this.listeners.forEach((listener) => listener(key, count));
  }
}
