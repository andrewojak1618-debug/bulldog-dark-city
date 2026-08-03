/** Zentrale Zeitgrenze und Positionierung der Katzenbelohnung. */
export const MUTANT_CAT_REWARD = Object.freeze({
  fastDefeatLimitMs: 15_000,
  dropOffsetY: 46,
  goldenCoinSize: 62,
  healthItemSize: 54,
  healthItemOffsetX: 38,
});

/**
 * Prüft einschließlich der Grenzsekunde auf die schnelle Belohnungsstufe.
 * @param {number} elapsedMs - Kampfzeit vom ersten bis zum neunten Biss.
 * @returns {boolean} `true` für den Golden Coin.
 */
export const isFastMutantCatDefeat = (elapsedMs) =>
  elapsedMs <= MUTANT_CAT_REWARD.fastDefeatLimitMs;
