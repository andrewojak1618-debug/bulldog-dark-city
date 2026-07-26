import Phaser from "phaser";

const DIALOG_STYLE = Object.freeze({
  width: 390,
  height: 190,
  backgroundColor: 0x090b13,
  backgroundAlpha: 0.96,
  borderColor: 0xff2cb8,
  titleColor: "#ff2cb8",
  textColor: "#e8e5ec",
  hintColor: "#96919c",
});

/**
 * @typedef {Object} MenuDialogOptions
 * @property {string} title - Überschrift des Dialogs.
 * @property {string} message - Inhalt des Dialogs.
 * @property {string} [confirmLabel="OK"] - Beschriftung der Bestätigung.
 * @property {string|null} [cancelLabel=null] - Optionale Abbruchbeschriftung.
 * @property {Function|null} [onConfirm=null] - Aktion bei Bestätigung.
 * @property {Function|null} [onCancel=null] - Aktion beim Abbruch.
 */

/**
 * Stellt einen modalen, per Maus und Tastatur bedienbaren Menüdialog dar.
 */
export class MenuDialog extends Phaser.GameObjects.Container {
  /**
   * Erstellt den Dialog und blockiert darunterliegende Zeigereingaben.
   * @param {Phaser.Scene} scene - Szene, in der der Dialog erscheint.
   * @param {MenuDialogOptions} options - Inhalt und Aktionen des Dialogs.
   */
  constructor(scene, options) {
    const { width, height } = scene.scale;
    super(scene, width / 2, height / 2);
    this.onConfirm = options.onConfirm ?? null;
    this.onCancel = options.onCancel ?? null;
    this.isClosed = false;
    this.createBackdrop(scene, width, height);
    this.createPanel(scene);
    this.createContent(scene, options);
    scene.add.existing(this);
    this.setDepth(1000);
    this.bindKeyboard(scene);
  }

  /**
   * Erstellt eine transparente Sperrfläche über dem gesamten Canvas.
   * @param {Phaser.Scene} scene - Zugehörige Szene.
   * @param {number} width - Canvasbreite.
   * @param {number} height - Canvashöhe.
   * @returns {void}
   */
  createBackdrop(scene, width, height) {
    const backdrop = scene.add
      .rectangle(0, 0, width, height, 0x000000, 0.68)
      .setInteractive();
    this.add(backdrop);
  }

  /**
   * Zeichnet den Dialoghintergrund und seinen Neonrahmen.
   * @param {Phaser.Scene} scene - Zugehörige Szene.
   * @returns {void}
   */
  createPanel(scene) {
    const panel = scene.add.graphics();
    panel.fillStyle(
      DIALOG_STYLE.backgroundColor,
      DIALOG_STYLE.backgroundAlpha,
    );
    panel.fillRoundedRect(
      -DIALOG_STYLE.width / 2,
      -DIALOG_STYLE.height / 2,
      DIALOG_STYLE.width,
      DIALOG_STYLE.height,
      10,
    );
    panel.lineStyle(2, DIALOG_STYLE.borderColor, 0.9);
    panel.strokeRoundedRect(
      -DIALOG_STYLE.width / 2,
      -DIALOG_STYLE.height / 2,
      DIALOG_STYLE.width,
      DIALOG_STYLE.height,
      10,
    );
    this.add(panel);
  }

  /**
   * Erstellt Überschrift, Nachricht und Dialogaktionen.
   * @param {Phaser.Scene} scene - Zugehörige Szene.
   * @param {MenuDialogOptions} options - Dialogkonfiguration.
   * @returns {void}
   */
  createContent(scene, options) {
    const title = scene.add
      .text(0, -62, options.title, {
        fontFamily: "Permanent Marker",
        fontSize: "24px",
        color: DIALOG_STYLE.titleColor,
      })
      .setOrigin(0.5);
    const message = scene.add
      .text(0, -15, options.message, {
        fontFamily: "Arial",
        fontSize: "15px",
        color: DIALOG_STYLE.textColor,
        align: "center",
        wordWrap: { width: DIALOG_STYLE.width - 56 },
      })
      .setOrigin(0.5);
    this.add([title, message]);
    this.createActions(scene, options);
  }

  /**
   * Erstellt klickbare Textaktionen am unteren Dialogrand.
   * @param {Phaser.Scene} scene - Zugehörige Szene.
   * @param {MenuDialogOptions} options - Dialogkonfiguration.
   * @returns {void}
   */
  createActions(scene, options) {
    const hasCancel = Boolean(options.cancelLabel);
    const confirmX = hasCancel ? -72 : 0;
    const confirm = this.createAction(
      scene,
      confirmX,
      options.confirmLabel ?? "OK",
      () => this.confirm(),
    );
    this.add(confirm);

    if (hasCancel) {
      this.add(
        this.createAction(
          scene,
          72,
          options.cancelLabel,
          () => this.cancel(),
        ),
      );
    }
  }

  /**
   * Erstellt eine einzelne Dialogaktion mit Hoverzustand.
   * @param {Phaser.Scene} scene - Zugehörige Szene.
   * @param {number} x - Horizontale Position.
   * @param {string} label - Sichtbare Beschriftung.
   * @param {Function} callback - Auszuführende Aktion.
   * @returns {Phaser.GameObjects.Text} Interaktive Textaktion.
   */
  createAction(scene, x, label, callback) {
    return scene.add
      .text(x, 62, label, {
        fontFamily: "Permanent Marker",
        fontSize: "17px",
        color: DIALOG_STYLE.hintColor,
        backgroundColor: "#171421",
        padding: { x: 14, y: 7 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", function handleOver() {
        this.setColor(DIALOG_STYLE.titleColor);
      })
      .on("pointerout", function handleOut() {
        this.setColor(DIALOG_STYLE.hintColor);
      })
      .on("pointerup", callback);
  }

  /**
   * Bindet Enter, Leertaste und Escape an den geöffneten Dialog.
   * @param {Phaser.Scene} scene - Zugehörige Szene.
   * @returns {void}
   */
  bindKeyboard(scene) {
    this.keyboard = scene.input.keyboard;

    if (!this.keyboard) {
      return;
    }

    this.confirmHandler = (event) => {
      if (!event.repeat) this.confirm();
    };
    this.cancelHandler = (event) => {
      if (!event.repeat) this.cancel();
    };
    this.keyboard.on("keydown-ENTER", this.confirmHandler);
    this.keyboard.on("keydown-SPACE", this.confirmHandler);
    this.keyboard.on("keydown-ESC", this.cancelHandler);
  }

  /**
   * Bestätigt den Dialog genau einmal.
   * @returns {void}
   */
  confirm() {
    if (this.isClosed) return;
    const callback = this.onConfirm;
    this.close();
    callback?.();
  }

  /**
   * Bricht den Dialog ab und führt die optionale Abbruchaktion aus.
   * @returns {void}
   */
  cancel() {
    if (this.isClosed) return;
    const callback = this.onCancel;
    this.close();
    callback?.();
  }

  /**
   * Entfernt Eingabeereignisse und zerstört den Dialog.
   * @returns {void}
   */
  close() {
    if (this.isClosed) return;
    this.isClosed = true;
    this.keyboard?.off("keydown-ENTER", this.confirmHandler);
    this.keyboard?.off("keydown-SPACE", this.confirmHandler);
    this.keyboard?.off("keydown-ESC", this.cancelHandler);
    this.destroy(true);
  }
}
