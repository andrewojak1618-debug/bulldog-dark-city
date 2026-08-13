import { OptionsDialog } from "../../ui/options-dialog.class.js";
import { globalMuteSystem } from
  "../../systems/global-mute-system.class.js";
import { globalDisplaySystem } from
  "../../systems/global-display-system.class.js";
import { LevelOnePreloadSystem } from
  "../../systems/level-one-preload-system.class.js";
import { SCENES } from "../../../js/config/game-settings.js";

/**
 * Manages menu navigation controller behavior.
 */
export class MenuNavigationController {
  /**
   * Creates a new instance.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {import( "../../input/menu-input-controller.class.js" ).MenuInputController} menuInput - The menu input value.
   * @param {(() => void)|null} [onDialogClosed=null] - The on dialog closed value.
   * @param {((isOpen: boolean, hideInterface?: boolean) => void)|null} [onDialogStateChange=null] - The on dialog state change value.
   */
  constructor(
    scene,
    menuInput,
    onDialogClosed = null,
    onDialogStateChange = null,
  ) {
    this.scene = scene;
    this.menuInput = menuInput;
    this.onDialogClosed = onDialogClosed;
    this.onDialogStateChange = onDialogStateChange;
    this.activeDialog = null;
    this.isTransitioning = false;
  }

  /**
   * Handles run.
   * @param {string} action - The requested action.
   * @returns {void} No value is returned.
   */
  run(action) {
    const actions = {
      start: () => this.startLevelOne(),
      options: () => this.openOptionsDialog(),
      upgrades: () => this.openLockedFeatureDialog("upgrades"),
      extras: () => this.openLockedFeatureDialog("extras"),
    };
    actions[action]?.();
  }

  /**
   * Starts level one.
   * @returns {void} No value is returned.
   */
  startLevelOne() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.menuInput.setEnabled(false);

    this.scene.playStartSequence(() => {
      LevelOnePreloadSystem.enterWhenReady(
        this.scene,
        this.scene.levelOneAssetsReady,
        () => this.scene.scene.start(SCENES.levelOne),
      );
    });
  }

  /**
   * Opens options dialog.
   */
  openOptionsDialog() {
    if (this.activeDialog || this.isTransitioning) return;
    this.menuInput.setEnabled(false);
    this.onDialogStateChange?.(true, true);
    this.activeDialog = new OptionsDialog(this.scene, {
      muteSystem: globalMuteSystem,
      displaySystem: globalDisplaySystem,
      onClose: () => this.restoreMenu(),
    });
  }

  /**
   * Opens locked feature dialog.
   */
  openLockedFeatureDialog(action) {
    if (this.activeDialog || this.isTransitioning) return;
    this.menuInput.setEnabled(false);
    this.onDialogStateChange?.(true, false);
    this.activeDialog = this.scene.menuInterface.openFeatureDialog(
      action,
      () => this.restoreMenu(),
    );
  }

  /**
   * Restores menu.
   */
  restoreMenu() {
    this.activeDialog = null;
    this.menuInput.setEnabled(true);
    this.onDialogStateChange?.(false, false);
    this.onDialogClosed?.();
  }

}
