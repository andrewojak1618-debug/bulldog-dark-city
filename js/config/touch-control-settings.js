/**
 * Defines the touch actions configuration.
 */
export const TOUCH_ACTIONS = Object.freeze({
  left: "left",
  right: "right",
  jump: "jump",
  attack: "attack",
  mutation: "mutation",
  normalBone: "normalBone",
  nuclearBone: "nuclearBone",
});

/**
 * Defines the touch layout breakpoints configuration.
 */
export const TOUCH_LAYOUT_BREAKPOINTS = Object.freeze({
  tabletLongSide: 960,
  tabletShortSide: 600,
});

/**
 * Defines the touch layout profiles configuration.
 */
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

/**
 * Defines the touch controls configuration.
 */
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
      size: 68, label: "F", fontSize: 26 }),
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
 * Returns touch layout profile.
 * @param {number} viewportWidth - The viewport width value.
 * @param {number} viewportHeight - The viewport height value.
 * @returns {"phone"|"tablet"} The resulting value.
 */
export function getTouchLayoutProfile(viewportWidth, viewportHeight) {
  const longSide = Math.max(viewportWidth, viewportHeight);
  const shortSide = Math.min(viewportWidth, viewportHeight);
  const breakpoint = TOUCH_LAYOUT_BREAKPOINTS;
  return longSide >= breakpoint.tabletLongSide &&
    shortSide >= breakpoint.tabletShortSide ? "tablet" : "phone";
}

/**
 * Returns safe inset.
 * @param {Object} safeArea - The safe area value.
 * @param {"left"|"right"|"bottom"} side - The side value.
 * @returns {number} The resulting numeric value.
 */
function getSafeInset(safeArea, side) {
  return Math.max(0, Number(safeArea?.[side]) || 0);
}

/**
 * Returns movement positions.
 * @param {number} canvasHeight - The canvas height value.
 * @param {Object} profile - The profile value.
 * @param {Object} safeArea - The safe area value.
 * @returns {Object} The resulting data object.
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
 * Returns primary action positions.
 * @param {number} canvasWidth - The canvas width value.
 * @param {number} canvasHeight - The canvas height value.
 * @param {Object} profile - The profile value.
 * @param {Object} safeArea - The safe area value.
 * @returns {Object} The resulting data object.
 */
function getPrimaryActionPositions(
  canvasWidth,
  canvasHeight,
  profile,
  safeArea,
) {
  const jump = CONTROLS_BY_ACTION[TOUCH_ACTIONS.jump];
  const attack = CONTROLS_BY_ACTION[TOUCH_ACTIONS.attack];
  const rightEdge = getRightEdge(canvasWidth, profile, safeArea);
  const bottomEdge = getBottomEdge(canvasHeight, profile, safeArea);
  return {
    [jump.action]: getControlPosition(rightEdge, bottomEdge, jump),
    [attack.action]: getControlPosition(
      rightEdge - jump.size - profile.actionGap, bottomEdge, attack,
    ),
  };
}

/**
 * Returns the right control edge.
 * @param {number} canvasWidth - The canvas width.
 * @param {object} profile - The active touch profile.
 * @param {object} safeArea - The safe area insets.
 * @returns {number} The right edge position.
 */
function getRightEdge(canvasWidth, profile, safeArea) {
  return canvasWidth - getSafeInset(safeArea, "right") - profile.edgeInsetX;
}

/**
 * Returns the bottom control edge.
 * @param {number} canvasHeight - The canvas height.
 * @param {object} profile - The active touch profile.
 * @param {object} safeArea - The safe area insets.
 * @returns {number} The bottom edge position.
 */
function getBottomEdge(canvasHeight, profile, safeArea) {
  return canvasHeight - getSafeInset(safeArea, "bottom") -
    profile.bottomInset;
}

/**
 * Returns a control position anchored by its right and bottom edges.
 * @param {number} right - The right edge.
 * @param {number} bottom - The bottom edge.
 * @param {object} control - The control settings.
 * @returns {{x: number, y: number}} The control position.
 */
function getControlPosition(right, bottom, control) {
  return { x: right - control.size / 2, y: bottom - control.size / 2 };
}

/**
 * Returns utility positions.
 * @param {number} canvasWidth - The canvas width value.
 * @param {number} canvasHeight - The canvas height value.
 * @param {Object} profile - The profile value.
 * @param {Object} safeArea - The safe area value.
 * @returns {Object} The resulting data object.
 */
function getUtilityPositions(canvasWidth, canvasHeight, profile, safeArea) {
  const actions = [TOUCH_ACTIONS.mutation, TOUCH_ACTIONS.nuclearBone,
    TOUCH_ACTIONS.normalBone];
  const rightEdge = getRightEdge(canvasWidth, profile, safeArea);
  const bottomEdge = getBottomEdge(canvasHeight, profile, safeArea);
  const primarySize = Math.max(
    CONTROLS_BY_ACTION[TOUCH_ACTIONS.jump].size,
    CONTROLS_BY_ACTION[TOUCH_ACTIONS.attack].size,
  );
  return createUtilityRow(actions, rightEdge,
    bottomEdge - primarySize - profile.rowGap, profile.utilityGap);
}

/**
 * Creates positions for a right-aligned utility control row.
 * @param {string[]} actions - The ordered utility actions.
 * @param {number} rightEdge - The right row edge.
 * @param {number} bottomEdge - The bottom row edge.
 * @param {number} gap - The gap between controls.
 * @returns {Object} The positions keyed by action.
 */
function createUtilityRow(actions, rightEdge, bottomEdge, gap) {
  let currentRight = rightEdge;
  return Object.fromEntries(actions.map((action) => {
    const control = CONTROLS_BY_ACTION[action];
    const entry = [action, getControlPosition(currentRight, bottomEdge, control)];
    currentRight -= control.size + gap;
    return entry;
  }));
}

/**
 * Creates touch control layout.
 * @param {number} canvasWidth - The canvas width value.
 * @param {number} canvasHeight - The canvas height value.
 * @param {number} viewportWidth - The viewport width value.
 * @param {number} viewportHeight - The viewport height value.
 * @param {Object} [safeArea={}] - The safe area value.
 * @returns {Object[]} The resulting collection.
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
  const positions = createControlPositions(
    canvasWidth, canvasHeight, profile, safeArea,
  );
  return TOUCH_CONTROLS.controls.map((control) => ({
    ...control,
    ...positions[control.action],
  }));
}

/**
 * Creates all touch control positions.
 * @param {number} width - The canvas width.
 * @param {number} height - The canvas height.
 * @param {object} profile - The active touch profile.
 * @param {object} safeArea - The safe area insets.
 * @returns {Object} The positions keyed by action.
 */
function createControlPositions(width, height, profile, safeArea) {
  return {
    ...getMovementPositions(height, profile, safeArea),
    ...getPrimaryActionPositions(width, height, profile, safeArea),
    ...getUtilityPositions(width, height, profile, safeArea),
  };
}
