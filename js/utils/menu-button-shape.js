import Phaser from "phaser";

/**
 * Erstellt die Einrisse der rechten Buttonkante.
 * @param {number} right - Rechte Außenposition.
 * @param {number} top - Obere Außenposition.
 * @param {number} bottom - Untere Außenposition.
 * @returns {Phaser.Geom.Point[]} Punkte der rechten Kante.
 */
const getRightEdgePoints = (right, top, bottom) => [
  new Phaser.Geom.Point(right, top + 4),
  new Phaser.Geom.Point(right - 3, top + 10),
  new Phaser.Geom.Point(right, 0),
  new Phaser.Geom.Point(right - 4, bottom - 8),
  new Phaser.Geom.Point(right, bottom - 3),
];

/**
 * Erstellt die Einrisse der linken Buttonkante.
 * @param {number} left - Linke Außenposition.
 * @param {number} top - Obere Außenposition.
 * @param {number} bottom - Untere Außenposition.
 * @returns {Phaser.Geom.Point[]} Punkte der linken Kante.
 */
const getLeftEdgePoints = (left, top, bottom) => [
  new Phaser.Geom.Point(left, bottom - 4),
  new Phaser.Geom.Point(left + 3, bottom - 10),
  new Phaser.Geom.Point(left, 1),
  new Phaser.Geom.Point(left + 4, top + 9),
  new Phaser.Geom.Point(left, top + 3),
];

/**
 * Erstellt eine geschlossene Buttonkontur mit eingerissenen Seiten.
 * @param {number} width - Breite des Buttons.
 * @param {number} height - Höhe des Buttons.
 * @param {number} depth - Tiefe der unregelmäßigen Seitenkanten.
 * @returns {Phaser.Geom.Point[]} Punkte der geschlossenen Außenkontur.
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
