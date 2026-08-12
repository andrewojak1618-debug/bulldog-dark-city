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

/** Profilgrenzen für ergonomisch getrennte Smartphone- und Tabletlayouts. */
export const TOUCH_LAYOUT_BREAKPOINTS = Object.freeze({
  tabletLongSide: 960,
  tabletShortSide: 600,
});

/** Randabstände und Zwischenräume der beiden Touchlayout-Profile. */
export const TOUCH_LAYOUT_PROFILES = Object.freeze({
  phone: Object.freeze({
    edgeInsetX: 18,
    bottomInset: 16,
    movementGap: 12,
    actionGap: 12,
    utilityGap: 8,
    rowGap: 10,
  }),
  tablet: Object.freeze({
    edgeInsetX: 14,
    bottomInset: 12,
    movementGap: 16,
    actionGap: 16,
    utilityGap: 10,
    rowGap: 12,
  }),
});

/** Zentrale Darstellung und Grundgrößen der mobilen Touchbuttons. */
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
    Object.freeze({ action: TOUCH_ACTIONS.left, x: 0, y: 0,
      size: 68, label: "◀", fontSize: 29 }),
    Object.freeze({ action: TOUCH_ACTIONS.right, x: 0, y: 0,
      size: 68, label: "▶", fontSize: 29 }),
    Object.freeze({ action: TOUCH_ACTIONS.mutation, x: 0, y: 0,
      size: 66, label: "M", fontSize: 22 }),
    Object.freeze({ action: TOUCH_ACTIONS.attack, x: 0, y: 0,
      size: 68, label: "J", fontSize: 26 }),
    Object.freeze({ action: TOUCH_ACTIONS.jump, x: 0, y: 0,
      size: 72, label: "↑", fontSize: 32 }),
    Object.freeze({ action: TOUCH_ACTIONS.normalBone, x: 0, y: 0,
      size: 66, label: "K", fontSize: 22, throwControl: true }),
    Object.freeze({ action: TOUCH_ACTIONS.nuclearBone, x: 0, y: 0,
      size: 66, label: "L", fontSize: 22, throwControl: true }),
  ]),
});

const CONTROLS_BY_ACTION = Object.freeze(Object.fromEntries(
  TOUCH_CONTROLS.controls.map((control) => [control.action, control]),
));

/**
 * Wählt anhand beider Viewportseiten das passende Touchlayout.
 * @param {number} viewportWidth - Sichtbare Browserbreite in CSS-Pixeln.
 * @param {number} viewportHeight - Sichtbare Browserhöhe in CSS-Pixeln.
 * @returns {"phone"|"tablet"} Name des passenden Layoutprofils.
 */
export function getTouchLayoutProfile(viewportWidth, viewportHeight) {
  const longSide = Math.max(viewportWidth, viewportHeight);
  const shortSide = Math.min(viewportWidth, viewportHeight);
  const breakpoint = TOUCH_LAYOUT_BREAKPOINTS;
  return longSide >= breakpoint.tabletLongSide &&
    shortSide >= breakpoint.tabletShortSide ? "tablet" : "phone";
}

/**
 * Liest einen sicheren, nicht negativen Randwert.
 * @param {Object} safeArea - Übermittelte Safe-Area-Werte.
 * @param {"left"|"right"|"bottom"} side - Gewünschte Seite.
 * @returns {number} Verwendbarer Randwert in Canvas-Pixeln.
 */
function getSafeInset(safeArea, side) {
  return Math.max(0, Number(safeArea?.[side]) || 0);
}

/**
 * Berechnet die beiden Bewegungsbuttons ab der linken unteren Ecke.
 * @param {number} canvasHeight - Interne Canvashöhe.
 * @param {Object} profile - Aktives Layoutprofil.
 * @param {Object} safeArea - Safe Area in Canvas-Pixeln.
 * @returns {Object} Positionen für Links und Rechts.
 */
function getMovementPositions(canvasHeight, profile, safeArea) {
  const left = CONTROLS_BY_ACTION[TOUCH_ACTIONS.left];
  const right = CONTROLS_BY_ACTION[TOUCH_ACTIONS.right];
  const edgeX = getSafeInset(safeArea, "left") + profile.edgeInsetX;
  const edgeY = canvasHeight - getSafeInset(safeArea, "bottom") -
    profile.bottomInset;
  return {
    [left.action]: { x: edgeX + left.size / 2, y: edgeY - left.size / 2 },
    [right.action]: {
      x: edgeX + left.size + profile.movementGap + right.size / 2,
      y: edgeY - right.size / 2,
    },
  };
}

/**
 * Berechnet Sprung und Angriff ab der rechten unteren Ecke.
 * @param {number} canvasWidth - Interne Canvasbreite.
 * @param {number} canvasHeight - Interne Canvashöhe.
 * @param {Object} profile - Aktives Layoutprofil.
 * @param {Object} safeArea - Safe Area in Canvas-Pixeln.
 * @returns {Object} Positionen für Sprung und Angriff.
 */
function getPrimaryActionPositions(
  canvasWidth,
  canvasHeight,
  profile,
  safeArea,
) {
  const jump = CONTROLS_BY_ACTION[TOUCH_ACTIONS.jump];
  const attack = CONTROLS_BY_ACTION[TOUCH_ACTIONS.attack];
  const rightEdge = canvasWidth - getSafeInset(safeArea, "right") -
    profile.edgeInsetX;
  const bottomEdge = canvasHeight - getSafeInset(safeArea, "bottom") -
    profile.bottomInset;
  return {
    [jump.action]: {
      x: rightEdge - jump.size / 2,
      y: bottomEdge - jump.size / 2,
    },
    [attack.action]: {
      x: rightEdge - jump.size - profile.actionGap - attack.size / 2,
      y: bottomEdge - attack.size / 2,
    },
  };
}

/**
 * Ordnet Mutation und Wurfknochen in einer zweiten rechten Reihe an.
 * @param {number} canvasWidth - Interne Canvasbreite.
 * @param {number} canvasHeight - Interne Canvashöhe.
 * @param {Object} profile - Aktives Layoutprofil.
 * @param {Object} safeArea - Safe Area in Canvas-Pixeln.
 * @returns {Object} Positionen der optionalen Aktionsbuttons.
 */
function getUtilityPositions(canvasWidth, canvasHeight, profile, safeArea) {
  const mutation = CONTROLS_BY_ACTION[TOUCH_ACTIONS.mutation];
  const nuclear = CONTROLS_BY_ACTION[TOUCH_ACTIONS.nuclearBone];
  const normal = CONTROLS_BY_ACTION[TOUCH_ACTIONS.normalBone];
  const jump = CONTROLS_BY_ACTION[TOUCH_ACTIONS.jump];
  const attack = CONTROLS_BY_ACTION[TOUCH_ACTIONS.attack];
  const rightEdge = canvasWidth - getSafeInset(safeArea, "right") -
    profile.edgeInsetX;
  const primaryTop = canvasHeight - getSafeInset(safeArea, "bottom") -
    profile.bottomInset - Math.max(jump.size, attack.size) - profile.rowGap;
  const nuclearRight = rightEdge - mutation.size - profile.utilityGap;
  const normalRight = nuclearRight - nuclear.size - profile.utilityGap;
  return {
    [mutation.action]: {
      x: rightEdge - mutation.size / 2,
      y: primaryTop - mutation.size / 2,
    },
    [nuclear.action]: {
      x: nuclearRight - nuclear.size / 2,
      y: primaryTop - nuclear.size / 2,
    },
    [normal.action]: {
      x: normalRight - normal.size / 2,
      y: primaryTop - normal.size / 2,
    },
  };
}

/**
 * Erstellt alle Positionen randbasiert für das aktuelle Gerät.
 * @param {number} canvasWidth - Interne Canvasbreite.
 * @param {number} canvasHeight - Interne Canvashöhe.
 * @param {number} viewportWidth - Sichtbare Browserbreite.
 * @param {number} viewportHeight - Sichtbare Browserhöhe.
 * @param {Object} [safeArea={}] - Safe Area in Canvas-Pixeln.
 * @returns {Object[]} Touchbuttons mit berechneten Positionen.
 */
export function createTouchControlLayout(
  canvasWidth,
  canvasHeight,
  viewportWidth,
  viewportHeight,
  safeArea = {},
) {
  const profileName = getTouchLayoutProfile(viewportWidth, viewportHeight);
  const profile = TOUCH_LAYOUT_PROFILES[profileName];
  const positions = {
    ...getMovementPositions(canvasHeight, profile, safeArea),
    ...getPrimaryActionPositions(canvasWidth, canvasHeight, profile, safeArea),
    ...getUtilityPositions(canvasWidth, canvasHeight, profile, safeArea),
  };
  return TOUCH_CONTROLS.controls.map((control) => ({
    ...control,
    ...positions[control.action],
  }));
}
