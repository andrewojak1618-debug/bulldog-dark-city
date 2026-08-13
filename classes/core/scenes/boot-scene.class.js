import Phaser from "phaser";
import { SCENES } from "../../../js/config/game-settings.js";

const LOCAL_START_SCENES = new Set([
  SCENES.levelOne,
  SCENES.levelTwo,
  SCENES.levelThree,
  SCENES.gameOver,
  SCENES.victory,
  SCENES.endscreen,
]);

/**
 * Manages boot scene behavior.
 */
export class BootScene extends Phaser.Scene {
  /**
   * Creates a new instance.
   */
  constructor() {
    super(SCENES.boot);
  }

  /**
   * Creates the current state.
   * @returns {void} No value is returned.
   */
  create() {
    this.scene.start(this.getInitialScene());
  }

  /**
   * Returns initial scene.
   * @returns {string} The resulting string value.
   */
  getInitialScene() {
    if (!import.meta.env.DEV) return SCENES.menu;
    const requestedScene = new URLSearchParams(
      window.location.search,
    ).get("debugScene");

    return LOCAL_START_SCENES.has(requestedScene)
      ? requestedScene
      : SCENES.menu;
  }
}
