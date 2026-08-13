import { SCENES } from "../../js/config/game-settings.js";
import { PLAYER_CAMERA } from
  "../../js/config/player-camera-settings.js";
import { LevelHudSystem } from "./level-hud-system.class.js";

/**
 * Manages level scene system behavior.
 */
export class LevelSceneSystem {
  /**
   * Initializes the current state.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {object} data - The data value.
   * @returns {void} No value is returned.
   */
  static initialize(scene, data) {
    scene.initialPlayerState = data.playerState ?? {};
    scene.isEnteringLevel = Boolean(data.enterFromPreviousLevel);
  }

  /**
   * Creates hud.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static createHud(scene) {
    const hud = LevelHudSystem.create(
      scene, scene.initialPlayerState, scene.player,
    );
    scene.healthSystem = hud.health;
    scene.collectibleSystem = hud.collectibles;
    scene.mutationSystem = hud.mutation;
  }

  /**
   * Configures camera.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static configureCamera(scene) {
    scene.cameras.main.startFollow(
      scene.player, true, PLAYER_CAMERA.lerpX, PLAYER_CAMERA.lerpY,
    );
    scene.cameras.main.setDeadzone(
      PLAYER_CAMERA.deadzoneWidth, PLAYER_CAMERA.deadzoneHeight,
    );
  }

  /**
   * Binds menu shortcut.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  static bindMenuShortcut(scene) {
    scene.input.keyboard?.once("keydown-ESC", () => {
      scene.scene.start(SCENES.menu);
    });
  }
}
