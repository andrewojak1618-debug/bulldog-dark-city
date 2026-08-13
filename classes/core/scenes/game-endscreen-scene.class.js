import Phaser from "phaser";
import { GameEndscreen } from "../../ui/game-endscreen.class.js";
import { setMuteButtonGameMode, setMuteButtonVisibility } from
  "../controllers/mute-button-controller.class.js";
import {
  resolveEndscreenResult,
} from "../../../js/config/game-endscreen-settings.js";
import { SCENES } from "../../../js/config/game-settings.js";

/**
 * Manages game endscreen scene behavior.
 */
export class GameEndscreenScene extends Phaser.Scene {
  /**
   * Creates a new instance.
   */
  constructor() {
    super(SCENES.endscreen);
  }

  /**
   * Handles init.
   * @param {{result?: string}} [data={}] - The data value.
   * @returns {void} No value is returned.
   */
  init(data = {}) {
    this.result = resolveEndscreenResult(data.result);
    this.isResolvingAction = false;
  }

  /**
   * Creates the current state.
   * @returns {void} No value is returned.
   */
  create() {
    this.stopAllAudio();
    setMuteButtonGameMode(false);
    setMuteButtonVisibility(true);
    this.endscreen = new GameEndscreen(this, {
      result: this.result,
      onRetry: () => this.startNewRun(),
      onMenu: () => this.returnToMenu(),
    });
  }

  /**
   * Starts new run.
   * @returns {void} No value is returned.
   */
  startNewRun() {
    this.resolveAction(SCENES.levelOne);
  }

  /**
   * Handles return to menu.
   * @returns {void} No value is returned.
   */
  returnToMenu() {
    this.resolveAction(SCENES.menu);
  }

  /**
   * Resolves action.
   * @param {string} targetScene - The target scene value.
   * @returns {void} No value is returned.
   */
  resolveAction(targetScene) {
    if (this.isResolvingAction) return;
    this.isResolvingAction = true;
    this.endscreen?.setInputEnabled(false);
    this.stopAllAudio();
    this.scene.start(targetScene);
  }

  /**
   * Stops all audio.
   * @returns {void} No value is returned.
   */
  stopAllAudio() {
    this.sound.stopAll();
  }

  /**
   * Updates the current state.
   * @returns {void} No value is returned.
   */
  update() {
    this.endscreen?.updateInput();
  }
}
