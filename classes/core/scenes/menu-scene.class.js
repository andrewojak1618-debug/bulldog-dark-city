import Phaser from "phaser";
import { SCENES } from "../../../js/config/game-config.js";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super(SCENES.menu);
  }

  create() {
    this.add
      .text(360, 240, "BULLDOG: DARK CITY", {
        fontFamily: "Arial",
        fontSize: "32px",
        color: "#ffffff",
      })
      .setOrigin(0.5);
  }
}
