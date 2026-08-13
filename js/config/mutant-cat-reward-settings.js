/**
 * Defines the mutant cat reward configuration.
 */
export const MUTANT_CAT_REWARD = Object.freeze({
  fastDefeatLimitMs: 15_000,
  dropOffsetY: 46,
  goldenCoinSize: 62,
  healthItemSize: 54,
  healthItemOffsetX: 38,
});

/**
 * Defines the is fast mutant cat defeat configuration.
 * @param {number} elapsedMs - The elapsed ms value.
 * @returns {boolean} Whether the requested condition is met.
 */
export const isFastMutantCatDefeat = (elapsedMs) =>
  elapsedMs <= MUTANT_CAT_REWARD.fastDefeatLimitMs;
