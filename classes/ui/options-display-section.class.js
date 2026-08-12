import { DISPLAY_MODES } from "../systems/global-display-system.class.js";
import { PLAYER_GUIDE } from "../../js/config/player-guide-settings.js";

/** Verbindet den persistenten Bildschirmmodus mit der Optionsansicht. */
export class OptionsDisplaySection {
  /**
   * Erstellt Überschrift und Umschalter im vorhandenen Scrollbereich.
   * @param {Phaser.Scene} scene - Zugehörige Menüszene.
   * @param {import("./options-dialog.class.js").OptionsDialog} host - Dialog.
   * @param {import("../systems/global-display-system.class.js").GlobalDisplaySystem}
   * displaySystem - Globale Anzeigeeinstellung.
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
    this.action = host.createAction(
      scene,
      PLAYER_GUIDE.dialog.displayActionX,
      0,
      "",
      () => displaySystem.toggle(),
    );
    this.positionAction(layout.headingContentGap);
    host.addToScroll(this.action);
    this.unsubscribe = displaySystem.onChange((mode) => this.updateLabel(mode));
  }

  /**
   * Platziert den Umschalter unter seiner Abschnittsüberschrift.
   * @param {number} gap - Abstand zwischen Überschrift und Aktion.
   * @returns {void}
   */
  positionAction(gap) {
    this.action.setY(
      this.heading.y + this.heading.height + gap + this.action.height / 2,
    );
  }

  /**
   * Aktualisiert die Beschriftung passend zum aktiven Modus.
   * @param {string} mode - Aktueller Bildschirmmodus.
   * @returns {void}
   */
  updateLabel(mode) {
    const settings = PLAYER_GUIDE.display;
    const label =
      mode === DISPLAY_MODES.oled ? settings.oledLabel : settings.standardLabel;
    this.action.setText(label);
  }

  /** Entfernt die Zustandsbeobachtung beim Schließen des Dialogs. */
  destroy() {
    this.unsubscribe?.();
  }
}
