/**
 * Begrenzt einen Zahlenwert auf einen festgelegten Bereich.
 * @param {number} value - Zu begrenzender Ausgangswert.
 * @param {number} min - Kleinster erlaubter Wert.
 * @param {number} max - Größter erlaubter Wert.
 * @returns {number} Begrenzter Zahlenwert.
 */
export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
