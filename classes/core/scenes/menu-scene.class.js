import Phaser from "phaser";
import { MenuButton } from "../../ui/menu-button.class.js";
import { getAssetPath } from "../../../js/config/asset-paths.js";
import { MENU_BUTTONS } from "../../../js/config/menu-buttons.js";
import { SCENES } from "../../../js/config/game-settings.js";
import {
  getAreaCenter,
  MENU_LAYOUT,
} from "../../../js/config/menu-layout.js";

const MENU_BACKGROUND_KEY = "menu-background";
const MENU_BACKGROUND_PATH = getAssetPath(
  "backgrounds",
  "menu-background.png",
);
const MENU_ICON_PATH = "menu/icons";
const LAYOUT_GUIDE_STYLE = Object.freeze({
  fillColor: 0x08060d,
  fillAlpha: 0.5,
  strokeColor: 0xd51bdc,
  strokeAlpha: 0.75,
  strokeWidth: 1,
  textColor: "#ffffff",
  fontFamily: "Arial",
  fontSize: "11px",
  borderRadius: 6,
});

/**
 * Stellt den Hintergrund und die interaktiven Bereiche des Hauptmenüs dar.
 */
export class MenuScene extends Phaser.Scene {
  /**
   * Erstellt die Menüszene mit ihrem eindeutigen Szenenschlüssel.
   */
  constructor() {
    super(SCENES.menu);
  }

  /**
   * Lädt den Menühintergrund und sämtliche benötigten Buttonsymbole.
   * @returns {void}
   */
  preload() {
    this.load.image(MENU_BACKGROUND_KEY, MENU_BACKGROUND_PATH);
    MENU_BUTTONS.forEach((button) => this.loadMenuIcon(button));
  }

  /**
   * Lädt das Symbol eines einzelnen Menübuttons.
   * @param {{iconKey: string, iconFile: string}} button - Buttonkonfiguration.
   * @returns {void}
   */
  loadMenuIcon({ iconKey, iconFile }) {
    const iconPath = getAssetPath(
      "ui",
      `${MENU_ICON_PATH}/${iconFile}`,
    );
    this.load.image(iconKey, iconPath);
  }

  /**
   * Baut den sichtbaren Inhalt der Menüszene auf.
   * @returns {void}
   */
  create() {
    this.createBackground();
    this.createLayoutGuides();
    this.createMainMenu();
  }

  /**
   * Zeigt das Hintergrundbild über die vollständige Canvasgröße an.
   * @returns {void}
   */
  createBackground() {
    const { width, height } = this.scale;
    this.add
      .image(width / 2, height / 2, MENU_BACKGROUND_KEY)
      .setDisplaySize(width, height);
  }

  /**
   * Erstellt die vorläufigen Platzhalter der übrigen Menübereiche.
   * @returns {void}
   */
  createLayoutGuides() {
    const { areas } = MENU_LAYOUT;
    this.createLayoutGuide(areas.logo, "BULLDOG: DARK CITY", 20);
    this.createLayoutGuide(areas.quickActions, "SCHNELLZUGRIFFE");
    this.createLayoutGuide(areas.version, "v0.1.0", 10);
    this.inputHint = this.createLayoutGuide(
      areas.inputHint,
      "MENÜPUNKT AUSWÄHLEN",
    );
    this.createLayoutGuide(areas.socialMedia, "SOCIAL MEDIA", 10);
  }

  /**
   * Erzeugt sämtliche Hauptmenüpunkte aus derselben Buttonklasse.
   * @returns {void}
   */
  createMainMenu() {
    this.menuButtons = MENU_BUTTONS.map((button, index) =>
      this.createMenuButton(button, index),
    );
  }

  /**
   * Erstellt einen konfigurierten Hauptmenübutton.
   * @param {Object} buttonConfig - Inhalt und Anfangszustand des Buttons.
   * @param {number} index - Position innerhalb des Hauptmenüs.
   * @returns {MenuButton} Erstellter Menübutton.
   */
  createMenuButton(buttonConfig, index) {
    const position = this.getMenuButtonPosition(index);
    return new MenuButton(this, {
      ...position,
      width: MENU_LAYOUT.mainMenu.buttonWidth,
      height: MENU_LAYOUT.mainMenu.buttonHeight,
      label: buttonConfig.label,
      iconKey: buttonConfig.iconKey,
      iconCrop: buttonConfig.iconCrop,
      iconOffsetY: buttonConfig.iconOffsetY,
      selected: buttonConfig.selected,
      disabled: buttonConfig.disabled,
      onActivate: (button) =>
        this.activateMenuButton(button, buttonConfig.label),
    });
  }

  /**
   * Berechnet die Mittelpunktposition eines Hauptmenübuttons.
   * @param {number} index - Position innerhalb des Hauptmenüs.
   * @returns {{x: number, y: number}} Mittelpunktposition des Buttons.
   */
  getMenuButtonPosition(index) {
    const { mainMenu, areas } = MENU_LAYOUT;
    const step = mainMenu.buttonHeight + mainMenu.buttonGap;
    return {
      x: areas.mainMenu.x + mainMenu.buttonWidth / 2,
      y: areas.mainMenu.y + mainMenu.buttonHeight / 2 + index * step,
    };
  }

  /**
   * Wählt einen Menübutton aus und aktualisiert den Eingabehinweis.
   * @param {MenuButton} activeButton - Ausgewählter Menübutton.
   * @param {string} label - Beschriftung für den Eingabehinweis.
   * @returns {void}
   */
  activateMenuButton(activeButton, label) {
    this.menuButtons.forEach((button) => button.setSelected(false));
    activeButton.setSelected(true);
    this.inputHint.setText(`${label} AUSGEWÄHLT`);
  }

  /**
   * Erstellt einen beschrifteten Platzhalter für einen Menübereich.
   * @param {{x: number, y: number, width: number, height: number}} area - Layoutbereich.
   * @param {string} label - Sichtbare Beschriftung.
   * @param {number|string} fontSize - Schriftgröße der Beschriftung.
   * @returns {Phaser.GameObjects.Text} Erstellte Beschriftung.
   */
  createLayoutGuide(
    area,
    label,
    fontSize = LAYOUT_GUIDE_STYLE.fontSize,
  ) {
    this.drawLayoutGuide(area);
    return this.createLayoutLabel(area, label, fontSize);
  }

  /**
   * Zeichnet Hintergrund und Kontur eines Platzhalterbereichs.
   * @param {{x: number, y: number, width: number, height: number}} area - Layoutbereich.
   * @returns {void}
   */
  drawLayoutGuide(area) {
    const graphics = this.add.graphics();
    graphics.fillStyle(
      LAYOUT_GUIDE_STYLE.fillColor,
      LAYOUT_GUIDE_STYLE.fillAlpha,
    );
    graphics.fillRoundedRect(
      area.x,
      area.y,
      area.width,
      area.height,
      LAYOUT_GUIDE_STYLE.borderRadius,
    );
    this.drawLayoutGuideStroke(graphics, area);
  }

  /**
   * Zeichnet die Kontur eines Platzhalterbereichs.
   * @param {Phaser.GameObjects.Graphics} graphics - Zeichenobjekt der Szene.
   * @param {{x: number, y: number, width: number, height: number}} area - Layoutbereich.
   * @returns {void}
   */
  drawLayoutGuideStroke(graphics, area) {
    graphics.lineStyle(
      LAYOUT_GUIDE_STYLE.strokeWidth,
      LAYOUT_GUIDE_STYLE.strokeColor,
      LAYOUT_GUIDE_STYLE.strokeAlpha,
    );
    graphics.strokeRoundedRect(
      area.x,
      area.y,
      area.width,
      area.height,
      LAYOUT_GUIDE_STYLE.borderRadius,
    );
  }

  /**
   * Erstellt die zentrierte Beschriftung eines Platzhalterbereichs.
   * @param {{x: number, y: number, width: number, height: number}} area - Layoutbereich.
   * @param {string} label - Sichtbare Beschriftung.
   * @param {number|string} fontSize - Schriftgröße der Beschriftung.
   * @returns {Phaser.GameObjects.Text} Erstellte Beschriftung.
   */
  createLayoutLabel(area, label, fontSize) {
    const center = getAreaCenter(area);
    return this.add
      .text(center.x, center.y, label, {
        fontFamily: LAYOUT_GUIDE_STYLE.fontFamily,
        fontSize: `${fontSize}px`,
        color: LAYOUT_GUIDE_STYLE.textColor,
        align: "center",
      })
      .setOrigin(0.5);
  }
}
