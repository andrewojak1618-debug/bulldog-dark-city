import Phaser from "phaser";
import { MenuButton } from "../../ui/menu-button.class.js";
import { QuickActionButton } from "../../ui/quick-action-button.class.js";
import { SocialMediaButton } from "../../ui/social-media-button.class.js";
import { getAssetPath } from "../../../js/config/asset-paths.js";
import { MENU_BUTTONS } from "../../../js/config/menu-buttons.js";
import { QUICK_ACTIONS } from "../../../js/config/quick-actions.js";
import { SOCIAL_ACTIONS } from "../../../js/config/social-actions.js";
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
const MENU_LOGO_KEY = "menu-logo";
const MENU_LOGO_PATH = getAssetPath(
  "ui",
  "menu/logo/bulldog-dark-city-logo.png",
);
const MENU_ICON_PATH = "menu/icons";

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
    this.load.image(MENU_LOGO_KEY, MENU_LOGO_PATH);
    SOCIAL_ACTIONS.forEach((action) =>
      this.load.image(
        action.textureKey,
        getAssetPath("ui", action.iconFile),
      ),
    );
    MENU_BUTTONS.forEach((button) => this.loadMenuIcon(button));
    const menuIconKeys = new Set(
      MENU_BUTTONS.map(({ iconKey }) => iconKey),
    );
    QUICK_ACTIONS.filter(
      ({ iconKey }) => !menuIconKeys.has(iconKey),
    ).forEach((action) => this.loadMenuIcon(action));
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
    this.createLogo();
    this.createVersionInfo();
    this.createMainMenu();
    this.createQuickActions();
    this.createSocialMedia();
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
   * Positioniert das Logo proportional innerhalb des vorgesehenen Bereichs.
   * @returns {void}
   */
  createLogo() {
    const area = MENU_LAYOUT.areas.logo;
    const center = getAreaCenter(area);
    const source = this.textures
      .get(MENU_LOGO_KEY)
      .getSourceImage();
    const scale = Math.min(
      area.width / source.width,
      area.height / source.height,
    ) * MENU_LAYOUT.logo.scale;
    const displayWidth =
      source.width * scale + MENU_LAYOUT.logo.extraWidth;
    const displayHeight =
      displayWidth * (source.height / source.width);

    this.add
      .image(
        center.x + MENU_LAYOUT.logo.offsetX,
        center.y + MENU_LAYOUT.logo.offsetY,
        MENU_LOGO_KEY,
      )
      .setDisplaySize(displayWidth, displayHeight)
      .setAngle(MENU_LAYOUT.logo.angle);
  }

  /**
   * Zeigt Versionsnummer und Projektband dezent am unteren linken Rand.
   * @returns {Phaser.GameObjects.Text} Erstellte Versionsanzeige.
   */
  createVersionInfo() {
    const { version, areas } = MENU_LAYOUT;
    return this.add
      .text(
        areas.version.x,
        areas.version.y + areas.version.height / 2,
        version.text,
        {
          fontFamily: version.fontFamily,
          fontSize: `${version.fontSize}px`,
          color: version.color,
        },
      )
      .setOrigin(0, 0.5);
  }

  /**
   * Erstellt Beschriftung und Social-Media-Buttons unten rechts.
   * @returns {void}
   */
  createSocialMedia() {
    this.socialMediaHeading = this.createSocialMediaHeading();
    this.socialMediaButtons = SOCIAL_ACTIONS.map(
      (action, index) =>
        new SocialMediaButton(this, {
          ...this.getSocialMediaPosition(index),
          size: MENU_LAYOUT.socialMedia.buttonSize,
          iconSize: MENU_LAYOUT.socialMedia.iconSize,
          textureKey: action.textureKey,
        }),
    );
  }

  /**
   * Zeigt die Überschrift oberhalb der Social-Media-Buttons.
   * @returns {Phaser.GameObjects.Text} Erstellte Überschrift.
   */
  createSocialMediaHeading() {
    const { areas, socialMedia } = MENU_LAYOUT;
    return this.add
      .text(
        areas.socialMedia.x,
        areas.socialMedia.y - socialMedia.headingGap,
        socialMedia.heading,
        {
          fontFamily: socialMedia.headingFontFamily,
          fontSize: `${socialMedia.headingFontSize}px`,
          color: socialMedia.headingColor,
        },
      )
      .setOrigin(0, 1);
  }

  /**
   * Berechnet die Mittelpunktposition eines Social-Media-Buttons.
   * @param {number} index - Position innerhalb der Social-Media-Leiste.
   * @returns {{x: number, y: number}} Mittelpunktposition.
   */
  getSocialMediaPosition(index) {
    const { socialMedia } = MENU_LAYOUT;
    const step = socialMedia.buttonSize + socialMedia.buttonGap;
    const buttonsWidth =
      SOCIAL_ACTIONS.length * socialMedia.buttonSize +
      (SOCIAL_ACTIONS.length - 1) * socialMedia.buttonGap;
    const rowStartX =
      this.socialMediaHeading.x +
      this.socialMediaHeading.width / 2 -
      buttonsWidth / 2;

    return {
      x: rowStartX + socialMedia.buttonSize / 2 + index * step,
      y:
        MENU_LAYOUT.areas.socialMedia.y +
        socialMedia.buttonSize / 2,
    };
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
   * Erzeugt die Schnellzugriffe aus einer gemeinsamen Komponente.
   * @returns {void}
   */
  createQuickActions() {
    this.quickActionButtons = QUICK_ACTIONS.map(
      (action, index) =>
        new QuickActionButton(this, {
          ...this.getQuickActionPosition(action, index),
          width: action.buttonDisplaySize.width,
          height: action.buttonDisplaySize.height,
          iconSize: MENU_LAYOUT.quickActions.iconSize,
          iconKey: action.iconKey,
          iconCrop: action.iconCrop,
          iconDisplaySize: action.iconDisplaySize,
          iconOffsetY: action.iconOffsetY,
        }),
    );
  }

  /**
   * Berechnet die Mittelpunktposition eines Schnellzugriffs.
   * @param {Object} action - Konfiguration des Schnellzugriffs.
   * @param {number} index - Position innerhalb der Schnellzugriffe.
   * @returns {{x: number, y: number}} Mittelpunktposition.
   */
  getQuickActionPosition(action, index) {
    const { areas, quickActions } = MENU_LAYOUT;
    const precedingWidth = QUICK_ACTIONS.slice(0, index).reduce(
      (width, precedingAction) =>
        width +
        precedingAction.buttonDisplaySize.width +
        quickActions.buttonGap,
      0,
    );
    return {
      x:
        areas.quickActions.x +
        precedingWidth +
        action.buttonDisplaySize.width / 2,
      y:
        areas.quickActions.y +
        action.buttonDisplaySize.height / 2,
    };
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
      fontSize: buttonConfig.fontSize,
      iconKey: buttonConfig.iconKey,
      iconCrop: buttonConfig.iconCrop,
      iconOffsetY: buttonConfig.iconOffsetY,
      selected: buttonConfig.selected,
      disabled: buttonConfig.disabled,
      onActivate: (button) => this.activateMenuButton(button),
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
   * @returns {void}
   */
  activateMenuButton(activeButton) {
    this.menuButtons.forEach((button) => button.setSelected(false));
    activeButton.setSelected(true);
  }
}
