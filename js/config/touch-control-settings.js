/** Eindeutige Aktionsschlüssel der mobilen Spielsteuerung. */
export const TOUCH_ACTIONS = Object.freeze({
  left: "left",
  right: "right",
  jump: "jump",
  attack: "attack",
  mutation: "mutation",
  normalBone: "normalBone",
  nuclearBone: "nuclearBone",
});

/** Zentrale Positionen und Darstellungswerte der mobilen Touchbuttons. */
export const TOUCH_CONTROLS = Object.freeze({
  depth: 300,
  idleAlpha: 0.36,
  pressedAlpha: 0.76,
  disabledAlpha: 0.16,
  backgroundColor: 0x08060d,
  borderColor: 0xe72daf,
  pressedColor: 0x70ffae,
  textColor: "#ffffff",
  strokeColor: "#16051d",
  strokeThickness: 3,
  fontFamily: "Permanent Marker",
  controls: Object.freeze([
    Object.freeze({ action: TOUCH_ACTIONS.left, x: 54, y: 416,
      size: 64, label: "◀", fontSize: 27 }),
    Object.freeze({ action: TOUCH_ACTIONS.right, x: 126, y: 416,
      size: 64, label: "▶", fontSize: 27 }),
    Object.freeze({ action: TOUCH_ACTIONS.mutation, x: 654, y: 338,
      size: 54, label: "M", fontSize: 20 }),
    Object.freeze({ action: TOUCH_ACTIONS.attack, x: 580, y: 414,
      size: 62, label: "J", fontSize: 24 }),
    Object.freeze({ action: TOUCH_ACTIONS.jump, x: 658, y: 414,
      size: 68, label: "↑", fontSize: 30 }),
    Object.freeze({ action: TOUCH_ACTIONS.normalBone, x: 510, y: 342,
      size: 50, label: "K", fontSize: 18, throwControl: true }),
    Object.freeze({ action: TOUCH_ACTIONS.nuclearBone, x: 566, y: 342,
      size: 50, label: "L", fontSize: 18, throwControl: true }),
  ]),
});
