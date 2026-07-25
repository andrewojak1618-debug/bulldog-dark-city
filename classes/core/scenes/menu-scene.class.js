import Phaser from "phaser";
import { SCENES } from "../../../js/config/game-config.js";

const MENU_BACKGROUND_KEY = "menu-background";
const MENU_BACKGROUND_PATH = "/img/backgrounds/menu-background.png";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super(SCENES.menu);
  }

  preload() {
    this.load.image(MENU_BACKGROUND_KEY, MENU_BACKGROUND_PATH);
  }

  create() {
    const { width, height } = this.scale;

    this.add
      .image(width / 2, height / 2, MENU_BACKGROUND_KEY)
      .setDisplaySize(width, height);

    this.add
      .text(width / 2, height / 2, "BULLDOG: DARK CITY", {
        fontFamily: "Arial",
        fontSize: "32px",
        color: "#ffffff",
      })
      .setOrigin(0.5);
  }
}
