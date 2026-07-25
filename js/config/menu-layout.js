const createArea = (x, y, width, height) =>
  Object.freeze({ x, y, width, height });

export const MENU_LAYOUT = Object.freeze({
  canvas: Object.freeze({
    width: 720,
    height: 480,
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

export const getAreaCenter = ({ x, y, width, height }) =>
  Object.freeze({
    x: x + width / 2,
    y: y + height / 2,
  });

export const isAreaInsideCanvas = (
  { x, y, width, height },
  canvas = MENU_LAYOUT.canvas,
) =>
  x >= 0 &&
  y >= 0 &&
  x + width <= canvas.width &&
  y + height <= canvas.height;
