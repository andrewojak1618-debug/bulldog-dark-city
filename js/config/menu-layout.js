/**
 * Erstellt einen unveränderlichen rechteckigen Layoutbereich.
 * @param {number} x - Horizontale Startposition.
 * @param {number} y - Vertikale Startposition.
 * @param {number} width - Breite des Bereichs.
 * @param {number} height - Höhe des Bereichs.
 * @returns {{x: number, y: number, width: number, height: number}} Layoutbereich.
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
  mainMenu: Object.freeze({
    buttonWidth: 176,
    buttonHeight: 38,
    buttonGap: 7,
  }),
  unavailableLabel: Object.freeze({
    text: "BALD",
    offsetX: 8,
    offsetY: 5,
    fontFamily: "Arial",
    fontSize: 16,
    color: "#ff2cb8",
    backgroundColor: "rgba(5, 6, 10, 0.78)",
    paddingX: 3,
    paddingY: 2,
    idleAlpha: 0.22,
    hoverAlpha: 1,
  }),
  quickActions: Object.freeze({
    buttonGap: 6,
    iconSize: 26,
  }),
  version: Object.freeze({
    text: "vol.1.0",
    color: "#96919c",
    fontFamily: "Arial",
    fontSize: 10,
  }),
  inputHint: Object.freeze({
    x: 360,
    y: 453,
    fontFamily: "Arial",
    fontSize: 11,
    color: "#c4bdca",
    backgroundColor: "rgba(5, 6, 10, 0.72)",
    paddingX: 10,
    paddingY: 5,
  }),
  areas: Object.freeze({
    logo: createArea(24, 20, 230, 112),
    mainMenu: createArea(30, 172, 176, 230),
    quickActions: createArea(597, 30, 124, 48),
    version: createArea(33, 442, 120, 22),
  }),
});

/** Vergrößert Menüinhalt und Bedienflächen für skalierte Touch-Canvas. */
export const TOUCH_MENU_LAYOUT = Object.freeze({
  ...MENU_LAYOUT,
  logo: Object.freeze({
    ...MENU_LAYOUT.logo,
    scale: 0.98,
    extraWidth: 20,
    offsetY: 8,
  }),
  mainMenu: Object.freeze({
    buttonWidth: 210,
    buttonHeight: 48,
    buttonGap: 18,
    hitHeight: 66,
    fontSize: "24px",
    iconSize: 48,
  }),
  unavailableLabel: Object.freeze({
    ...MENU_LAYOUT.unavailableLabel,
    offsetX: 10,
    fontSize: 24,
    paddingX: 4,
    paddingY: 2,
  }),
  version: Object.freeze({
    ...MENU_LAYOUT.version,
    fontSize: 24,
  }),
  inputHint: Object.freeze({
    ...MENU_LAYOUT.inputHint,
    x: 360,
    y: 434,
    fontSize: 24,
    paddingX: 8,
    paddingY: 3,
    popupDurationMs: 3000,
    fadeDurationMs: 300,
  }),
  areas: Object.freeze({
    logo: createArea(18, 8, 230, 105),
    mainMenu: createArea(20, 151, 210, 304),
    quickActions: createArea(640, 14, 68, 65),
    version: createArea(25, 436, 120, 34),
  }),
});

/**
 * Liefert das passende Menülayout für die aktuelle Eingabeoberfläche.
 * @param {boolean} isTouchLayout - Ob große Touchflächen benötigt werden.
 * @returns {typeof MENU_LAYOUT|typeof TOUCH_MENU_LAYOUT} Aktives Menülayout.
 */
export function getMenuLayout(isTouchLayout) {
  return isTouchLayout ? TOUCH_MENU_LAYOUT : MENU_LAYOUT;
}

/**
 * Berechnet den Mittelpunkt eines rechteckigen Layoutbereichs.
 * @param {{x: number, y: number, width: number, height: number}} area - Layoutbereich.
 * @returns {{x: number, y: number}} Mittelpunkt des Bereichs.
 */
export const getAreaCenter = ({ x, y, width, height }) =>
  Object.freeze({
    x: x + width / 2,
    y: y + height / 2,
  });
