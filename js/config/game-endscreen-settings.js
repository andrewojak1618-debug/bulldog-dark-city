/**
 * Defines the endscreen result configuration.
 */
export const ENDSCREEN_RESULT = Object.freeze({
  gameOver: "gameOver",
  victory: "victory",
});

/**
 * Defines the game endscreen configuration.
 */
export const GAME_ENDSCREEN = Object.freeze({
  defaultResult: ENDSCREEN_RESULT.gameOver,
  background: Object.freeze({
    color: 0x050309,
    alpha: 1,
  }),
  panel: Object.freeze({
    width: 430,
    height: 340,
    fillColor: 0x090b13,
    fillAlpha: 0.96,
    borderColor: 0x7d2a8f,
    borderAlpha: 0.9,
    borderWidth: 2,
    radius: 14,
  }),
  variants: Object.freeze({
    [ENDSCREEN_RESULT.gameOver]: Object.freeze({
      title: "GAME OVER",
      message: "Die Dark City gibt dir noch eine Chance.",
      titleColor: "#ff2cb8",
    }),
    [ENDSCREEN_RESULT.victory]: Object.freeze({
      title: "YOU WIN",
      message: "Du hast die Roboterkatze besiegt.",
      titleColor: "#92ff5f",
    }),
  }),
  title: Object.freeze({
    y: -112,
    fontFamily: "Permanent Marker",
    fontSize: 44,
  }),
  message: Object.freeze({
    y: -65,
    fontFamily: "Arial",
    fontSize: 16,
    color: "#e8e5ec",
  }),
  buttons: Object.freeze({
    y: 14,
    width: 286,
    height: 50,
    gap: 16,
    fontSize: "20px",
    retryLabel: "NOCHMAL SPIELEN",
    menuLabel: "ZUM HAUPTMENÜ",
  }),
  hint: Object.freeze({
    y: 132,
    desktopText: "↑ ↓ / W S  ·  ENTER / A",
    touchText: "Auswahl antippen",
    fontFamily: "Arial",
    fontSize: 16,
    color: "#aaa3b2",
  }),
  depth: 100,
});

/**
 * Resolves endscreen result.
 * @param {string|undefined} result - The result value.
 * @returns {string} The resulting string value.
 */
export function resolveEndscreenResult(result) {
  return Object.hasOwn(GAME_ENDSCREEN.variants, result)
    ? result
    : GAME_ENDSCREEN.defaultResult;
}
