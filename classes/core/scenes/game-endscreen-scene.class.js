import Phaser from "phaser";
import { GameEndscreen } from "../../ui/game-endscreen.class.js";
import { setMuteButtonGameMode, setMuteButtonVisibility } from
  "../controllers/mute-button-controller.class.js";
import {
  resolveEndscreenResult,
} from "../../../js/config/game-endscreen-settings.js";
import { SCENES } from "../../../js/config/game-settings.js";

/**
 * Zeigt nach jeder Abschlusssequenz dieselbe bewusste Spielerauswahl.
 */
export class GameEndscreenScene extends Phaser.Scene {
  /** Erstellt die Szene mit ihrem zentralen Szenenschlüssel. */
  constructor() {
    super(SCENES.endscreen);
  }

  /**
   * Übernimmt die gewünschte Abschlussvariante und setzt Aktionssperren zurück.
   * @param {{result?: string}} [data={}] - Daten der vorherigen Videosequenz.
   * @returns {void}
   */
  init(data = {}) {
    this.result = resolveEndscreenResult(data.result);
    this.isResolvingAction = false;
  }

  /**
   * Beendet verbliebenes Audio und erstellt die gemeinsame Auswahloberfläche.
   * @returns {void}
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
   * Startet Level eins mit dessen vollständigen Standardwerten neu.
   * @returns {void}
   */
  startNewRun() {
    this.resolveAction(SCENES.levelOne);
  }

  /**
   * Kehrt ohne Browser-Reload zuverlässig zum Hauptmenü zurück.
   * @returns {void}
   */
  returnToMenu() {
    this.resolveAction(SCENES.menu);
  }

  /**
   * Führt höchstens eine Auswahl aus und sperrt weitere Eingaben sofort.
   * @param {string} targetScene - Zielszene der gewählten Aktion.
   * @returns {void}
   */
  resolveAction(targetScene) {
    if (this.isResolvingAction) return;
    this.isResolvingAction = true;
    this.endscreen?.setInputEnabled(false);
    this.stopAllAudio();
    this.scene.start(targetScene);
  }

  /**
   * Stoppt sicher alle noch aktiven Phaser-Musik- und Effektinstanzen.
   * @returns {void}
   */
  stopAllAudio() {
    this.sound.stopAll();
  }

  /**
   * Aktualisiert ausschließlich die Gamepadbedienung des Endscreens.
   * @returns {void}
   */
  update() {
    this.endscreen?.updateInput();
  }
}
