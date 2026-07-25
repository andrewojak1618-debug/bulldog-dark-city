import Phaser from "phaser";
import { getAssetPath } from "../../../js/config/asset-paths.js";
import { SCENES } from "../../../js/config/game-config.js";
import {
  getAreaCenter,
  MENU_LAYOUT,
} from "../../../js/config/menu-layout.js";

const MENU_BACKGROUND_KEY = "menu-background";
const MENU_BACKGROUND_PATH = getAssetPath(
  "backgrounds",
  "menu-background.png",
);
const LAYOUT_GUIDE_STYLE = Object.freeze({
  fillColor: 0x08060d,
  fillAlpha: 0.5,
  strokeColor: 0xd51bdc,
  strokeAlpha: 0.75,
  strokeWidth: 1,
  textColor: "#ffffff",
  fontFamily: "Arial",
  fontSize: "11px",
});

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

    this.createLayoutGuides();
  }

  createLayoutGuides() {
    const { areas } = MENU_LAYOUT;

    this.createLayoutGuide(areas.logo, "BULLDOG: DARK CITY", 20);
    this.createLayoutGuide(areas.mainMenu, "HAUPTMENÜ");
    this.createLayoutGuide(areas.quickActions, "SCHNELLZUGRIFFE");
    this.createLayoutGuide(areas.version, "v0.1.0", 10);
    this.createLayoutGuide(areas.inputHint, "EINGABEHINWEIS");
    this.createLayoutGuide(areas.socialMedia, "SOCIAL MEDIA", 10);
  }

  createLayoutGuide(area, label, fontSize = LAYOUT_GUIDE_STYLE.fontSize) {
    const center = getAreaCenter(area);
    const graphics = this.add.graphics();

    graphics.fillStyle(
      LAYOUT_GUIDE_STYLE.fillColor,
      LAYOUT_GUIDE_STYLE.fillAlpha,
    );
    graphics.fillRoundedRect(area.x, area.y, area.width, area.height, 6);
    graphics.lineStyle(
      LAYOUT_GUIDE_STYLE.strokeWidth,
      LAYOUT_GUIDE_STYLE.strokeColor,
      LAYOUT_GUIDE_STYLE.strokeAlpha,
    );
    graphics.strokeRoundedRect(area.x, area.y, area.width, area.height, 6);

    this.add
      .text(center.x, center.y, label, {
        fontFamily: LAYOUT_GUIDE_STYLE.fontFamily,
        fontSize: `${fontSize}px`,
        color: LAYOUT_GUIDE_STYLE.textColor,
        align: "center",
      })
      .setOrigin(0.5);
  }
}
