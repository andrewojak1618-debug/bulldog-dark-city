/**
 * Beschreibt alle Hauptmenüpunkte und ihre zugehörigen Symbole.
 * @type {ReadonlyArray<{
 *   label: string,
 *   iconKey: string,
 *   iconFile: string,
 *   iconCrop: {x: number, y: number, width: number, height: number},
 *   fontSize?: string,
 *   iconOffsetY?: number,
 *   selected?: boolean,
 *   disabled?: boolean
 * }>}
 */
export const MENU_BUTTONS = Object.freeze([
  Object.freeze({
    label: "START",
    iconKey: "menu-start",
    iconFile: "start-paw.png",
    iconCrop: Object.freeze({
      x: 303,
      y: 252,
      width: 660,
      height: 618,
    }),
    iconOffsetY: 2,
  }),
  Object.freeze({
    label: "OPTIONEN",
    fontSize: "16px",
    iconKey: "menu-options",
    iconFile: "settings-gear.png",
    iconCrop: Object.freeze({
      x: 288,
      y: 219,
      width: 680,
      height: 674,
    }),
    iconOffsetY: 2,
  }),
  Object.freeze({
    label: "UPGRADES",
    fontSize: "16px",
    iconKey: "menu-upgrades",
    iconFile: "upgrades-arrow.png",
    iconCrop: Object.freeze({
      x: 302,
      y: 244,
      width: 651,
      height: 729,
    }),
  }),
  Object.freeze({
    label: "EXTRAS",
    fontSize: "16px",
    iconKey: "menu-extras",
    iconFile: "extras-star.png",
    iconCrop: Object.freeze({
      x: 274,
      y: 269,
      width: 708,
      height: 653,
    }),
    disabled: true,
  }),
  Object.freeze({
    label: "BEENDEN",
    fontSize: "16px",
    iconKey: "menu-exit",
    iconFile: "exit-power.png",
    iconCrop: Object.freeze({
      x: 295,
      y: 237,
      width: 667,
      height: 706,
    }),
  }),
]);
