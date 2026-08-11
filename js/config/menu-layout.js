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
