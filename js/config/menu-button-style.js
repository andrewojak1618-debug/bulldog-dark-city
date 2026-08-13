/** @type {{normal: string, hover: string, selected: string, pressed: string, disabled: string}} */
export const MENU_BUTTON_STATE = Object.freeze({
  normal: "normal",
  hover: "hover",
  selected: "selected",
  pressed: "pressed",
  disabled: "disabled",
});

/** @type {Object<string, Object>} */
export const MENU_BUTTON_STYLE = Object.freeze({
  [MENU_BUTTON_STATE.normal]: Object.freeze({
    fillColor: 0x08060d,
    fillAlpha: 0.78,
    strokeColor: 0x5a2a73,
    strokeAlpha: 0.8,
    textColor: "#d8d1df",
    iconTint: 0xa776c6,
    scale: 1,
  }),
  [MENU_BUTTON_STATE.hover]: Object.freeze({
    fillColor: 0x260b2d,
    fillAlpha: 0.92,
    strokeColor: 0xff2cb8,
    strokeAlpha: 1,
    textColor: "#ffffff",
    iconTint: 0xff2cb8,
    scale: 1.02,
  }),
  [MENU_BUTTON_STATE.selected]: Object.freeze({
    fillColor: 0x4a0b40,
    fillAlpha: 0.94,
    strokeColor: 0xff2cb8,
    strokeAlpha: 1,
    textColor: "#ffffff",
    iconTint: 0xff2cb8,
    scale: 1,
  }),
  [MENU_BUTTON_STATE.pressed]: Object.freeze({
    fillColor: 0x19051d,
    fillAlpha: 1,
    strokeColor: 0xb91585,
    strokeAlpha: 1,
    textColor: "#e6bddd",
    iconTint: 0xd51bdc,
    scale: 0.97,
  }),
  [MENU_BUTTON_STATE.disabled]: Object.freeze({
    fillColor: 0x08060d,
    fillAlpha: 0.5,
    strokeColor: 0x55505b,
    strokeAlpha: 0.55,
    textColor: "#77717c",
    iconTint: 0x615b66,
    scale: 1,
  }),
});

/** @type {Object} */
export const MENU_BUTTON_CONTENT = Object.freeze({
  edgeDepth: 7,
  strokeWidth: 1,
  horizontalPadding: 11,
  iconSize: 40,
  iconTextGap: 6,
  fontFamily: "Permanent Marker",
  fontSize: "20px",
});
