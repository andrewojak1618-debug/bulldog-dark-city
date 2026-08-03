import Phaser from "phaser";

const INPUT_HINTS = Object.freeze({
  keyboard: "↑ ↓ / W S  ·  ENTER / LEERTASTE",
  gamepad: "STEUERKREUZ  ·  A ZUM BESTÄTIGEN",
  mouse: "MAUS  ·  KLICK ZUM AUSWÄHLEN",
  touch: "ANTIPPEN ZUM AUSWÄHLEN",
});

/**
 * Zeigt dynamisch die Bedienhilfe zur zuletzt verwendeten Eingabeart.
 */
export class MenuInputHint extends Phaser.GameObjects.Text {
  /**
   * Erstellt den Eingabehinweis anhand der zentralen Layoutwerte.
   * @param {Phaser.Scene} scene - Zugehörige Menüszene.
   * @param {{x: number, y: number, fontFamily: string,
   * fontSize: number, color: string}} style - Layout und Textstil.
   */
  constructor(scene, style) {
    super(scene, style.x, style.y, INPUT_HINTS.keyboard, {
      fontFamily: style.fontFamily,
      fontSize: `${style.fontSize}px`,
      color: style.color,
      backgroundColor: style.backgroundColor,
      padding: { x: style.paddingX, y: style.paddingY },
    });
    this.setOrigin(0.5);
    scene.add.existing(this);
  }

  /**
   * Aktualisiert den Text passend zur aktiven Eingabeart.
   * @param {"keyboard"|"gamepad"|"mouse"|"touch"} inputMode - Aktive Eingabeart.
   * @returns {void}
   */
  setInputMode(inputMode) {
    this.setText(INPUT_HINTS[inputMode] ?? INPUT_HINTS.keyboard);
  }
}
