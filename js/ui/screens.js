/**
 * Macht einen vorhandenen DOM-Bereich sichtbar.
 * @param {HTMLElement|null|undefined} element - Ein- oder auszublendender Bereich.
 * @returns {void}
 */
export const showScreen = (element) => element?.removeAttribute("hidden");

/**
 * Blendet einen vorhandenen DOM-Bereich aus.
 * @param {HTMLElement|null|undefined} element - Ein- oder auszublendender Bereich.
 * @returns {void}
 */
export const hideScreen = (element) => element?.setAttribute("hidden", "");
