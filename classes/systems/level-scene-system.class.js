import { SCENES } from "../../js/config/game-settings.js";
import { PLAYER_CAMERA } from
  "../../js/config/player-camera-settings.js";
import { LevelHudSystem } from "./level-hud-system.class.js";

/** Bündelt identische Grundfunktionen der aufeinanderfolgenden Level. */
export class LevelSceneSystem {
  /**
   * Übernimmt den optionalen Spielerzustand und den Einlaufstatus.
   * @param {Phaser.Scene} scene - Zu initialisierende Levelszene.
   * @param {object} data - Optionale Daten des vorherigen Levels.
   * @returns {void}
   */
  static initialize(scene, data) {
    scene.initialPlayerState = data.playerState ?? {};
    scene.isEnteringLevel = Boolean(data.enterFromPreviousLevel);
  }

  /**
   * Erstellt das gemeinsame HUD und weist seine Systeme der Szene zu.
   * @param {Phaser.Scene} scene - Aktive Levelszene mit Spielfigur.
   * @returns {void}
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
   * Aktiviert die gemeinsame weiche Kameraführung und Deadzone.
   * @param {Phaser.Scene} scene - Aktive Levelszene mit Spielfigur.
   * @returns {void}
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
   * Bindet die einmalige Rückkehr zum Hauptmenü an Escape.
   * @param {Phaser.Scene} scene - Aktive Levelszene.
   * @returns {void}
   */
  static bindMenuShortcut(scene) {
    scene.input.keyboard?.once("keydown-ESC", () => {
      scene.scene.start(SCENES.menu);
    });
  }
}
