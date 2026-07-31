/**
 * Gemeinsame Darstellung für quadratische Icon-Buttons.
 */
export const ICON_BUTTON_STYLE = Object.freeze({
  borderRadius: 6,
  strokeWidth: 1,
  disabledAlpha: 0.45,
  normal: Object.freeze({
    fillColor: 0x08060d,
    fillAlpha: 0.78,
    strokeColor: 0x5a2a73,
    strokeAlpha: 0.8,
    scale: 1,
  }),
  hover: Object.freeze({
    fillColor: 0x260b2d,
    fillAlpha: 0.92,
    strokeColor: 0xff2cb8,
    strokeAlpha: 1,
    scale: 1.06,
  }),
});
