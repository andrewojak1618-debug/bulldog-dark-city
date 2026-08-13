import Phaser from "phaser";

/**
 * Defines the get right edge points configuration.
 * @param {number} right - The right value.
 * @param {number} top - The top value.
 * @param {number} bottom - The bottom value.
 * @returns {Phaser.Geom.Point[]} The resulting collection.
 */
const getRightEdgePoints = (right, top, bottom) => [
  new Phaser.Geom.Point(right, top + 4),
  new Phaser.Geom.Point(right - 3, top + 10),
  new Phaser.Geom.Point(right, 0),
  new Phaser.Geom.Point(right - 4, bottom - 8),
  new Phaser.Geom.Point(right, bottom - 3),
];

/**
 * Defines the get left edge points configuration.
 * @param {number} left - The left value.
 * @param {number} top - The top value.
 * @param {number} bottom - The bottom value.
 * @returns {Phaser.Geom.Point[]} The resulting collection.
 */
const getLeftEdgePoints = (left, top, bottom) => [
  new Phaser.Geom.Point(left, bottom - 4),
  new Phaser.Geom.Point(left + 3, bottom - 10),
  new Phaser.Geom.Point(left, 1),
  new Phaser.Geom.Point(left + 4, top + 9),
  new Phaser.Geom.Point(left, top + 3),
];

/**
 * Defines the get torn button points configuration.
 * @param {number} width - The width in pixels.
 * @param {number} height - The height in pixels.
 * @param {number} depth - The depth value.
 * @returns {Phaser.Geom.Point[]} The resulting collection.
 */
export const getTornButtonPoints = (width, height, depth) => {
  const left = -width / 2;
  const right = width / 2;
  const top = -height / 2;
  const bottom = height / 2;
  return [
    new Phaser.Geom.Point(left + depth, top),
    new Phaser.Geom.Point(right - depth, top),
    ...getRightEdgePoints(right, top, bottom),
    new Phaser.Geom.Point(right - depth, bottom),
    new Phaser.Geom.Point(left + depth, bottom),
    ...getLeftEdgePoints(left, top, bottom),
  ];
};
