import Phaser from "phaser";
import { SCENES } from "../../../js/config/game-settings.js";

/**
 * Stellt die spätere erste Spielszene bereit.
 */
export class LevelOneScene extends Phaser.Scene {
  /**
   * Erstellt Level eins mit seinem eindeutigen Szenenschlüssel.
   */
  constructor() {
    super(SCENES.levelOne);
  }

  /**
   * Zeigt eine klar erkennbare Platzhalter-Spielansicht für den Menüübergang.
   * @returns {void}
   */
  create() {
    const { width, height } = this.scale;
    this.cameras.main.fadeIn(260, 0, 0, 0);
    this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x080d18,
    );
    this.add
      .text(width / 2, height / 2 - 25, "LEVEL ONE", {
        fontFamily: "Permanent Marker",
        fontSize: "38px",
        color: "#ff2cb8",
      })
      .setOrigin(0.5);
    this.add
      .text(
        width / 2,
        height / 2 + 30,
        "Die Spielwelt wird als Nächstes aufgebaut.",
        {
          fontFamily: "Arial",
          fontSize: "16px",
          color: "#d7d2dc",
        },
      )
      .setOrigin(0.5);
    this.add
      .text(width / 2, height - 35, "ESC  ·  ZURÜCK ZUM MENÜ", {
        fontFamily: "Arial",
        fontSize: "12px",
        color: "#96919c",
      })
      .setOrigin(0.5);
    this.input.keyboard?.once("keydown-ESC", () =>
      this.scene.start(SCENES.menu),
    );
  }
}
