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
  quickActions: Object.freeze({
    buttonGap: 6,
    iconSize: 26,
  }),
  version: Object.freeze({
    text: "v0.1.0",
    color: "#96919c",
    fontFamily: "Arial",
    fontSize: 10,
  }),
  socialMedia: Object.freeze({
    heading: "FOLGE UNS",
    headingColor: "#ff2cb8",
    headingFontFamily: "Permanent Marker",
    headingFontSize: 16,
    buttonSize: 24,
    iconSize: 18,
    buttonGap: 6,
    headingGap: 10,
  }),
  inputHint: Object.freeze({
    x: 360,
    y: 457,
    fontFamily: "Arial",
    fontSize: 11,
    color: "#c4bdca",
  }),
  areas: Object.freeze({
    logo: createArea(24, 20, 230, 112),
    mainMenu: createArea(30, 172, 176, 230),
    quickActions: createArea(597, 30, 124, 48),
    version: createArea(30, 442, 120, 22),
    socialMedia: createArea(597, 437, 107, 34),
  }),
});

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
