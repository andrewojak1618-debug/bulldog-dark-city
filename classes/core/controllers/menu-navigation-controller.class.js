import { OptionsDialog } from "../../ui/options-dialog.class.js";
import { globalMuteSystem } from
  "../../systems/global-mute-system.class.js";
import { globalDisplaySystem } from
  "../../systems/global-display-system.class.js";
import { LevelOnePreloadSystem } from
  "../../systems/level-one-preload-system.class.js";
import { SCENES } from "../../../js/config/game-settings.js";

/**
 * Bündelt Menüaktionen, Dialoge und den Übergang zur Spielszene.
 */
export class MenuNavigationController {
  /**
   * Erstellt die Navigation für eine Menüszene.
   * @param {Phaser.Scene} scene - Zugehörige Menüszene.
   * @param {import(
   * "../../input/menu-input-controller.class.js"
   * ).MenuInputController} menuInput - Zentrale Eingabesteuerung.
   * @param {(() => void)|null} [onDialogClosed=null] - Aktion nach dem Schließen eines Dialogs.
   * @param {((isOpen: boolean) => void)|null} [onDialogStateChange=null] -
   * Aktion beim Öffnen und Schließen eines Dialogs.
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
   * Ordnet einem Hauptmenüpunkt seine definierte Aktion zu.
   * @param {string} action - Zentraler Aktionsschlüssel.
   * @returns {void}
   */
  run(action) {
    const actions = {
      start: () => this.startLevelOne(),
      options: () => this.openOptionsDialog(),
    };
    actions[action]?.();
  }

  /**
   * Spielt die Intro-Sequenz ab und wechselt anschließend in Level eins.
   * @returns {void}
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

  /** Öffnet Spielerklärung, Tastenbelegung und Toneinstellung. */
  openOptionsDialog() {
    if (this.activeDialog || this.isTransitioning) return;
    this.menuInput.setEnabled(false);
    this.onDialogStateChange?.(true);
    this.activeDialog = new OptionsDialog(this.scene, {
      muteSystem: globalMuteSystem,
      displaySystem: globalDisplaySystem,
      onClose: () => this.restoreMenu(),
    });
  }

  /** Reaktiviert die Menüsteuerung nach einem geschlossenen Dialog. */
  restoreMenu() {
    this.activeDialog = null;
    this.menuInput.setEnabled(true);
    this.onDialogStateChange?.(false);
    this.onDialogClosed?.();
  }

}
