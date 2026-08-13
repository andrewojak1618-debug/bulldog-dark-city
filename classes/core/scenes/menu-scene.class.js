import Phaser from "phaser";
import { HtmlMenuInterface } from "../../ui/html-menu-interface.class.js";
import { MenuInputController } from "../../input/menu-input-controller.class.js";
import { InputDeviceDetector } from "../../input/input-device-detector.class.js";
import { MenuNavigationController } from "../controllers/menu-navigation-controller.class.js";
import { MenuIntroController } from "../controllers/menu-intro-controller.class.js";
import {
  setMuteButtonGameMode,
  setMuteButtonVisibility,
} from "../controllers/mute-button-controller.class.js";
import { setMenuSocialLinkVisibility } from "../controllers/menu-social-link-controller.js";
import { setMenuLegalNavigationVisibility } from
  "../controllers/menu-legal-navigation-controller.js";
import { LevelOnePreloadSystem } from "../../systems/level-one-preload-system.class.js";
import { getAssetPath } from "../../../js/config/asset-paths.js";
import { SCENES } from "../../../js/config/game-settings.js";
import { MENU_START_TRANSITION } from "../../../js/config/menu-transition-settings.js";
import { getAreaCenter, getMenuLayout } from "../../../js/config/menu-layout.js";

const MENU_BACKGROUND_KEY = "menu-background";
const MENU_BACKGROUND_PATH = getAssetPath("backgrounds", "menu-background.png");
const MENU_LOGO_KEY = "menu-logo";
const MENU_LOGO_PATH = getAssetPath(
  "ui",
  "menu/logo/bulldog-dark-city-logo.png",
);
const MENU_ACTION_LOCK_MS = 180;

/**
 * Manages menu scene behavior.
 */
export class MenuScene extends Phaser.Scene {
  /**
   * Creates a new instance.
   */
  constructor() {
    super(SCENES.menu);
  }

  /**
   * Preloads the current state.
   */
  preload() {
    this.load.image(MENU_BACKGROUND_KEY, MENU_BACKGROUND_PATH);
    this.load.image(MENU_LOGO_KEY, MENU_LOGO_PATH);
    this.load.video(
      MENU_START_TRANSITION.video.key,
      MENU_START_TRANSITION.video.url,
      MENU_START_TRANSITION.video.noAudio,
    );
  }

  /**
   * Creates the current state.
   */
  create() {
    this.isTouchLayout = InputDeviceDetector.isTouchLayout();
    this.menuLayout = getMenuLayout(this.isTouchLayout);
    this.registerMenuLifecycle();
    this.createMenuElements();
    this.initializeMenuSystems();
  }

  /**
   * Registers menu lifecycle.
   */
  registerMenuLifecycle() {
    document.body.classList.add("is-menu-scene");
    setMuteButtonGameMode(false);
    this.setExternalMenuControlsVisibility(true);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanupMenu());
  }

  /**
   * Handles cleanup menu.
   */
  cleanupMenu() {
    this.introController?.destroy();
    this.introController = null;
    this.menuInterface?.destroy();
    this.menuInterface = null;
    document.body.classList.remove("is-menu-scene");
    this.setExternalMenuControlsVisibility(false);
  }

  /**
   * Creates menu elements.
   */
  createMenuElements() {
    this.createBackground();
    this.createLogo();
    this.menuInterface = new HtmlMenuInterface(this, {
      onActivate: (button) => this.activateMenuButton(button),
      onFocus: (button, pointer) => this.focusMenuButton(button, pointer),
    });
    this.menuButtons = this.menuInterface.buttons;
    this.menuInterface.show();
    this.menuInterface.showInitialHint(this.isTouchLayout);
  }

  /**
   * Initializes menu systems.
   */
  initializeMenuSystems() {
    this.createMenuInput();
    this.introController = new MenuIntroController(this);
    this.introController.prepare();
    this.levelOneAssetsReady = LevelOnePreloadSystem.preload(this);
  }

  /**
   * Creates background.
   */
  createBackground() {
    const { width, height } = this.scale;
    this.add
      .image(width / 2, height / 2, MENU_BACKGROUND_KEY)
      .setDisplaySize(width, height);
  }

  /**
   * Creates logo.
   */
  createLogo() {
    const area = this.menuLayout.areas.logo;
    const center = getAreaCenter(area);
    const source = this.textures.get(MENU_LOGO_KEY).getSourceImage();
    const scale = this.calculateLogoScale(area, source);
    const displayWidth = source.width * scale + this.menuLayout.logo.extraWidth;
    const displayHeight = displayWidth * (source.height / source.width);
    this.logo = this.addLogoImage(center, displayWidth, displayHeight);
  }

  /**
   * Calculates logo scale.
   */
  calculateLogoScale(area, source) {
    const containScale = Math.min(
      area.width / source.width,
      area.height / source.height,
    );
    return containScale * this.menuLayout.logo.scale;
  }

  /**
   * Adds logo image.
   */
  addLogoImage(center, displayWidth, displayHeight) {
    return this.add
      .image(
        center.x + this.menuLayout.logo.offsetX,
        center.y + this.menuLayout.logo.offsetY,
        MENU_LOGO_KEY,
      )
      .setDisplaySize(displayWidth, displayHeight)
      .setAngle(this.menuLayout.logo.angle);
  }

  /**
   * Creates menu input.
   */
  createMenuInput() {
    this.isMenuActionLocked = false;
    this.menuInput = new MenuInputController(
      this,
      this.menuButtons,
      (inputMode) => this.menuInterface?.setInputMode(inputMode),
    );
    this.createMenuNavigation();
  }

  /**
   * Creates menu navigation.
   */
  createMenuNavigation() {
    this.menuNavigation = new MenuNavigationController(
      this,
      this.menuInput,
      () => this.unlockMenuAction(),
      (isOpen, hideInterface) =>
        this.handleDialogStateChange(isOpen, hideInterface),
    );
  }

  /**
   * Handles focus menu button.
   */
  focusMenuButton(button, pointer) {
    const inputMode = pointer?.pointerType === "touch" ? "touch" : "mouse";
    this.menuInput?.focusButton(button, inputMode);
  }

  /**
   * Handles unlock menu action.
   */
  unlockMenuAction() {
    this.isMenuActionLocked = false;
  }

  /**
   * Handles dialog state change.
   * @param {boolean} isOpen - The is open value.
   * @param {boolean} hideInterface - The hide interface value.
   */
  handleDialogStateChange(isOpen, hideInterface = true) {
    this.setExternalMenuControlsVisibility(!isOpen);
    if (isOpen && hideInterface) this.menuInterface?.hide();
    if (!isOpen) this.menuInterface?.show();
  }

  /**
   * Sets external menu controls visibility.
   */
  setExternalMenuControlsVisibility(isVisible) {
    setMuteButtonVisibility(isVisible);
    setMenuSocialLinkVisibility(isVisible);
    setMenuLegalNavigationVisibility(isVisible);
  }

  /**
   * Handles activate menu button.
   */
  activateMenuButton(activeButton) {
    if (this.isMenuActionLocked || this.menuNavigation.isTransitioning) return;
    this.isMenuActionLocked = true;
    this.menuNavigation.run(activeButton.menuAction);
    if (!this.menuNavigation.isTransitioning) this.scheduleMenuUnlock();
  }

  /**
   * Handles schedule menu unlock.
   */
  scheduleMenuUnlock() {
    this.time.delayedCall(MENU_ACTION_LOCK_MS, () => this.unlockMenuAction());
  }

  /**
   * Plays start sequence.
   */
  playStartSequence(onComplete) {
    this.introController.play(onComplete);
  }

  /**
   * Updates the current state.
   */
  update() {
    this.menuInput?.update();
  }
}
