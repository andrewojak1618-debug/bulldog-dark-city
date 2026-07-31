/**
 * Zeichnet Füllung und Kontur eines rechteckigen Icon-Buttons.
 * @param {Phaser.GameObjects.Graphics} background - Zeichenfläche.
 * @param {number} width - Breite des Buttons.
 * @param {number} height - Höhe des Buttons.
 * @param {Object} style - Farben und Transparenzen des Zustands.
 * @param {Object} shape - Gemeinsame Werte für Kontur und Rundung.
 * @returns {void}
 */
export function drawIconButtonBackground(
  background,
  width,
  height,
  style,
  shape,
) {
  const left = -width / 2;
  const top = -height / 2;
  background.clear();
  background.fillStyle(style.fillColor, style.fillAlpha);
  background.fillRoundedRect(
    left,
    top,
    width,
    height,
    shape.borderRadius,
  );
  background.lineStyle(
    shape.strokeWidth,
    style.strokeColor,
    style.strokeAlpha,
  );
  background.strokeRoundedRect(
    left,
    top,
    width,
    height,
    shape.borderRadius,
  );
}
