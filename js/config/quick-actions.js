/**
 * Beschreibt die Schnellzugriffe im oberen rechten Menübereich.
 * @type {ReadonlyArray<{
 *   iconKey: string,
 *   iconFile: string,
 *   iconCrop: {x: number, y: number, width: number, height: number},
 *   iconDisplaySize?: {width: number, height: number},
 *   buttonDisplaySize: {width: number, height: number},
 *   iconOffsetY?: number
 * }>}
 */
export const QUICK_ACTIONS = Object.freeze([
  Object.freeze({
    iconKey: "quick-achievements",
    iconFile: "achievements-trophy.png",
    iconCrop: Object.freeze({
      x: 304,
      y: 279,
      width: 644,
      height: 590,
    }),
    iconDisplaySize: Object.freeze({
      width: 29,
      height: 32,
    }),
    buttonDisplaySize: Object.freeze({
      width: 27,
      height: 30,
    }),
  }),
  Object.freeze({
    iconKey: "quick-statistics",
    iconFile: "statistics-bars.png",
    iconCrop: Object.freeze({
      x: 383,
      y: 346,
      width: 515,
      height: 499,
    }),
    iconDisplaySize: Object.freeze({
      width: 32,
      height: 31,
    }),
    buttonDisplaySize: Object.freeze({
      width: 30,
      height: 29,
    }),
  }),
  Object.freeze({
    iconKey: "menu-options",
    iconFile: "settings-gear.png",
    iconCrop: Object.freeze({
      x: 288,
      y: 219,
      width: 680,
      height: 674,
    }),
    iconDisplaySize: Object.freeze({
      width: 32,
      height: 32,
    }),
    buttonDisplaySize: Object.freeze({
      width: 30,
      height: 30,
    }),
    iconOffsetY: 2,
  }),
]);
