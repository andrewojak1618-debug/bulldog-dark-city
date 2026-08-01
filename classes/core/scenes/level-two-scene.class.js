import Phaser from "phaser";
import { SCENES } from "../../../js/config/game-settings.js";

/**
 * Bestätigt vorläufig den erfolgreichen Übergang aus Level eins.
 */
export class LevelTwoScene extends Phaser.Scene {
  /** Erstellt die Platzhalterszene mit eindeutigem Szenenschlüssel. */
  constructor() {
    super(SCENES.levelTwo);
  }

  /**
   * Zeigt den bestätigten Levelwechsel bis zum Aufbau von Level zwei.
   * @returns {void}
   */
  create() {
    this.cameras.main.setBackgroundColor(0x080d18);
    this.add.text(360, 220, "LEVEL 2\nWIRD VORBEREITET", {
      align: "center",
      color: "#35d9a5",
      fontFamily: "Arial",
      fontSize: "28px",
    }).setOrigin(0.5);
    this.add.text(360, 300, "ESC · ZURÜCK ZUM MENÜ", {
      color: "#d7d2dc",
      fontFamily: "Arial",
      fontSize: "14px",
    }).setOrigin(0.5);
    this.input.keyboard?.once("keydown-ESC", () => {
      this.scene.start(SCENES.menu);
    });
  }
}
