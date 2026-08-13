import { DISPLAY_MODES } from "../systems/global-display-system.class.js";
import { PLAYER_GUIDE } from "../../js/config/player-guide-settings.js";

/**
 * Manages options display section behavior.
 */
export class OptionsDisplaySection {
  /**
   * Creates a new instance.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {import("./options-dialog.class.js").OptionsDialog} host - The host value.
   * @param {import("../systems/global-display-system.class.js").GlobalDisplaySystem} displaySystem - The display system value.
   */
  constructor(scene, host, displaySystem) {
    this.displaySystem = displaySystem;
    const settings = PLAYER_GUIDE.display;
    const layout = PLAYER_GUIDE.contentLayout;
    this.heading = host.createHeading(
      scene,
      0,
      layout.displayY,
      settings.title,
    );
    host.addToScroll(this.heading);
    this.action = this.createAction(scene, host, displaySystem);
    this.positionAction(layout.headingContentGap);
    host.addToScroll(this.action);
    this.unsubscribe = displaySystem.onChange((mode) => this.updateLabel(mode));
  }

  /**
   * Creates the display mode action.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {import("./options-dialog.class.js").OptionsDialog} host - The dialog host.
   * @param {object} displaySystem - The display system.
   * @returns {Phaser.GameObjects.Text} The action text.
   */
  createAction(scene, host, displaySystem) {
    return host.createAction(
      scene,
      PLAYER_GUIDE.dialog.displayActionX,
      0,
      "",
      () => displaySystem.toggle(),
    );
  }

  /**
   * Handles position action.
   * @param {number} gap - The gap value.
   * @returns {void} No value is returned.
   */
  positionAction(gap) {
    this.action.setY(
      this.heading.y + this.heading.height + gap + this.action.height / 2,
    );
  }

  /**
   * Updates label.
   * @param {string} mode - The mode value.
   * @returns {void} No value is returned.
   */
  updateLabel(mode) {
    const settings = PLAYER_GUIDE.display;
    const label =
      mode === DISPLAY_MODES.oled ? settings.oledLabel : settings.standardLabel;
    this.action.setText(label);
  }

  /**
   * Releases the current state.
   */
  destroy() {
    this.unsubscribe?.();
  }
}
