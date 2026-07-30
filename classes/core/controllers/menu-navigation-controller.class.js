import { MenuDialog } from "../../ui/menu-dialog.class.js";
import { SCENES } from "../../../js/config/game-settings.js";

/**
 * Bündelt Menüaktionen, Dialoge und den Übergang zur Spielszene.
 */
export class MenuNavigationController {
  /**
   * Erstellt die Navigation für eine Menüszene.
   * @param {Phaser.Scene} scene - Zugehörige Menüszene.
   * @param {import("../../input/menu-input-controller.class.js").MenuInputController} menuInput - Zentrale Eingabesteuerung.
   * @param {Function|null} [onDialogClosed=null] - Aktion nach dem Schließen eines Dialogs.
   */
  constructor(scene, menuInput, onDialogClosed = null) {
    this.scene = scene;
    this.menuInput = menuInput;
    this.onDialogClosed = onDialogClosed;
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
      exit: () => this.openExitDialog(),
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

    this.scene.playStartSequence(() =>
      this.scene.scene.start(SCENES.levelOne),
    );
  }

  /**
   * Öffnet einen vorbereiteten Optionsdialog.
   * @returns {void}
   */
  openOptionsDialog() {
    this.openDialog({
      title: "OPTIONEN",
      message:
        "Audio-, Grafik- und Steuerungsoptionen werden in einer kommenden Karte ergänzt.",
      confirmLabel: "VERSTANDEN",
    });
  }

  /**
   * Öffnet die webtaugliche Bestätigung zum Beenden des Spiels.
   * @returns {void}
   */
  openExitDialog() {
    this.openDialog({
      title: "SPIEL BEENDEN?",
      message:
        "Browser dürfen Tabs nicht zuverlässig selbst schließen. Nach der Bestätigung kannst du diesen Tab manuell schließen.",
      confirmLabel: "BEENDEN",
      cancelLabel: "ZURÜCK",
      onConfirm: () => this.openExitNotice(),
    });
  }

  /**
   * Erklärt nach der Bestätigung das sichere Verhalten im Browser.
   * @returns {void}
   */
  openExitNotice() {
    this.openDialog({
      title: "BIS BALD",
      message:
        "Das Spiel bleibt sicher pausiert. Du kannst den Browser-Tab jetzt schließen.",
      confirmLabel: "ZUM MENÜ",
    });
  }

  /**
   * Zeigt die Funktion eines Schnellzugriffs oder einen Platzhalterhinweis.
   * @param {{iconKey: string}} action - Konfiguration des Schnellzugriffs.
   * @returns {void}
   */
  activateQuickAction(action) {
    if (action.iconKey === "menu-options") {
      this.openOptionsDialog();
      return;
    }

    this.openDialog({
      title: "NOCH NICHT VERFÜGBAR",
      message:
        "Dieser Schnellzugriff wird in einer späteren Entwicklungsstufe freigeschaltet.",
      confirmLabel: "OK",
    });
  }

  /**
   * Öffnet genau einen modalen Dialog und pausiert die Menüsteuerung.
   * @param {Object} options - Dialoginhalt und optionale Aktionen.
   * @returns {void}
   */
  openDialog(options) {
    if (this.activeDialog || this.isTransitioning) return;
    this.menuInput.setEnabled(false);
    const restoreMenu = () => {
      this.activeDialog = null;
      this.menuInput.setEnabled(true);
      this.onDialogClosed?.();
    };
    const originalConfirm = options.onConfirm;
    const originalCancel = options.onCancel;
    this.activeDialog = new MenuDialog(this.scene, {
      ...options,
      onConfirm: () => {
        restoreMenu();
        originalConfirm?.();
      },
      onCancel: () => {
        restoreMenu();
        originalCancel?.();
      },
    });
  }
}
