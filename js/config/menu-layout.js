import { GAME_DIMENSIONS } from "./game-settings.js";

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
  canvas: GAME_DIMENSIONS,
  mainMenu: Object.freeze({
    buttonWidth: 190,
    buttonHeight: 38,
    buttonGap: 7,
  }),
  areas: Object.freeze({
    logo: createArea(24, 20, 230, 112),
    mainMenu: createArea(24, 172, 190, 230),
    quickActions: createArea(572, 20, 124, 48),
    version: createArea(16, 442, 90, 22),
    inputHint: createArea(250, 434, 220, 32),
    socialMedia: createArea(574, 432, 130, 34),
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
