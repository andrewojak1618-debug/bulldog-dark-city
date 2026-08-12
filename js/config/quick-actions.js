/**
 * Beschreibt die Schnellzugriffe im oberen rechten Menübereich.
 * @type {ReadonlyArray<{
 *   action: string,
 *   iconKey: string,
 *   iconFile: string,
 *   iconCrop: {x: number, y: number, width: number, height: number},
 *   iconDisplaySize?: {width: number, height: number},
 *   buttonDisplaySize: {width: number, height: number},
 *   iconOffsetY?: number,
 *   disabled?: boolean,
 *   unavailableLabel?: string
 * }>}
 */
export const QUICK_ACTIONS = Object.freeze([
  Object.freeze({
    action: "achievements",
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
    disabled: true,
    unavailableLabel: "BALD",
  }),
  Object.freeze({
    action: "statistics",
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
    disabled: true,
    unavailableLabel: "BALD",
  }),
]);
