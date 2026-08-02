/**
 * Levelübergreifende Darstellungs- und Physikwerte der normalen Bulldogge.
 *
 * Beide Level verwenden bewusst dieselben Werte, damit Hitbox, Laufen,
 * Springen und Fallen unabhängig von der jeweiligen Levelkonfiguration
 * identisch bleiben.
 */
export const BULLDOG_GAMEPLAY = Object.freeze({
  displayWidth: 128,
  displayHeight: 128,
  bodyWidth: 104,
  bodyHeight: 64,
  bodyOffsetX: 12,
  bodyOffsetY: 60,
  moveSpeed: 250,
  jumpVelocity: -520,
  fallGravityBoost: 150,
  maxFallSpeed: 1050,
});
