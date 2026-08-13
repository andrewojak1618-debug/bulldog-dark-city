/**
 * Defines the create area configuration.
 * @param {number} x - The horizontal position.
 * @param {number} y - The vertical position.
 * @param {number} width - The width in pixels.
 * @param {number} height - The height in pixels.
 * @returns {{x: number, y: number, width: number, height: number}} The resulting numeric value.
 */
const createArea = (x, y, width, height) =>
  Object.freeze({ x, y, width, height });

export const MENU_LAYOUT = Object.freeze({
  logo: Object.freeze({
    scale: 1.08,
    extraWidth: 30,
    angle: -6,
    offsetX: 8,
    offsetY: 15,
  }),
  areas: Object.freeze({
    logo: createArea(24, 20, 230, 112),
  }),
});

/**
 * Defines the touch menu layout configuration.
 */
export const TOUCH_MENU_LAYOUT = Object.freeze({
  ...MENU_LAYOUT,
  logo: Object.freeze({
    ...MENU_LAYOUT.logo,
    scale: 0.98,
    extraWidth: 20,
    offsetY: 8,
  }),
  areas: Object.freeze({
    logo: createArea(18, 8, 230, 105),
  }),
});

/**
 * Returns menu layout.
 * @param {boolean} isTouchLayout - The is touch layout value.
 * @returns {typeof MENU_LAYOUT|typeof TOUCH_MENU_LAYOUT} The resulting value.
 */
export function getMenuLayout(isTouchLayout) {
  return isTouchLayout ? TOUCH_MENU_LAYOUT : MENU_LAYOUT;
}

/**
 * Defines the get area center configuration.
 * @param {{x: number, y: number, width: number, height: number}} area - The area value.
 * @returns {{x: number, y: number}} The resulting numeric value.
 */
export const getAreaCenter = ({ x, y, width, height }) =>
  Object.freeze({
    x: x + width / 2,
    y: y + height / 2,
  });
