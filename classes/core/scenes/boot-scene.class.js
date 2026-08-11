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
 * Startet das Spiel und leitet anschließend zum Hauptmenü weiter.
 */
export class BootScene extends Phaser.Scene {
  /**
   * Erstellt die Startszene mit ihrem eindeutigen Szenenschlüssel.
   */
  constructor() {
    super(SCENES.boot);
  }

  /**
   * Wechselt nach dem Start direkt in die Menüszene.
   * @returns {void}
   */
  create() {
    this.scene.start(this.getInitialScene());
  }

  /**
   * Erlaubt lokal einen direkten Einstieg in relevante Abnahmeszenen.
   * @returns {string} Schlüssel der ersten sichtbaren Szene.
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
