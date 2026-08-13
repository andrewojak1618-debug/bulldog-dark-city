import Phaser from "phaser";
import { getTextRenderResolution } from
  "../../js/config/game-settings.js";

/**
 * Manages sharp text plugin behavior.
 */
export class SharpTextPlugin extends Phaser.Plugins.ScenePlugin {
  /**
   * Handles boot.
   */
  boot() {
    this.systems.events.on(
      Phaser.Scenes.Events.ADDED_TO_SCENE,
      this.applyResolution,
      this,
    );
  }

  /**
   * Applies resolution.
   * @param {Phaser.GameObjects.GameObject} gameObject - The game object value.
   * @returns {void} No value is returned.
   */
  applyResolution(gameObject) {
    if (gameObject.type !== "Text") return;
    gameObject.setResolution(getTextRenderResolution());
  }
}
