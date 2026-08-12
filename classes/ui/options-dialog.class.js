import Phaser from "phaser";
import { PLAYER_GUIDE } from "../../js/config/player-guide-settings.js";
import { OptionsScrollView } from "./options-scroll-view.class.js";
import { OptionsDisplaySection } from "./options-display-section.class.js";

/**
 * @typedef {Object} OptionsDialogOptions
 * @property {import("../systems/global-mute-system.class.js").GlobalMuteSystem}
 * muteSystem - Globale Audiosteuerung.
 * @property {import("../systems/global-display-system.class.js").GlobalDisplaySystem}
 * displaySystem - Persistente Bildschirmdarstellung.
 * @property {(() => void)|null} [onClose=null] - Aktion nach dem Schließen.
 */

/** Zeigt Spielerklärung, Tastenbelegung und globale Toneinstellung. */
export class OptionsDialog extends Phaser.GameObjects.Container {
  /**
   * Erstellt die vollständige Optionsansicht im Mittelpunkt des Canvas.
   * @param {Phaser.Scene} scene - Zugehörige Menüszene.
   * @param {OptionsDialogOptions} options - Abhängigkeiten und Aktionen.
   */
  constructor(scene, options) {
    super(scene, scene.scale.width / 2, scene.scale.height / 2);
    this.muteSystem = options.muteSystem;
    this.displaySystem = options.displaySystem;
    this.onClose = options.onClose ?? null;
    this.isClosed = false;
    this.build(scene);
    scene.add.existing(this);
    this.setDepth(PLAYER_GUIDE.style.depth);
    this.bindKeyboard(scene);
    this.subscribeToMuteState();
  }

  /**
   * Erstellt Sperrfläche, Panel und alle sichtbaren Inhalte.
   * @param {Phaser.Scene} scene - Zugehörige Menüszene.
   * @returns {void}
   */
  build(scene) {
    this.createBackdrop(scene);
    this.createPanel(scene);
    this.createTitle(scene);
    this.createScrollArea(scene);
    this.createGoal(scene);
    this.createInstructions(scene);
    this.createAudioAction(scene);
    this.displaySection = new OptionsDisplaySection(
      scene, this, this.displaySystem,
    );
    this.createCloseActions(scene);
  }

  /**
   * Schließt den Dialog bei einem Klick außerhalb des Panels.
   * @param {Phaser.Scene} scene - Zugehörige Menüszene.
   * @returns {void}
   */
  createBackdrop(scene) {
    const style = PLAYER_GUIDE.style;
    const backdrop = scene.add.rectangle(
      0, 0, scene.scale.width, scene.scale.height,
      style.backdropColor, style.backdropAlpha,
    ).setInteractive().on("pointerup", () => this.close());
    this.add(backdrop);
  }

  /**
   * Zeichnet das Panel und blockiert Klicks auf dessen Innenfläche.
   * @param {Phaser.Scene} scene - Zugehörige Menüszene.
   * @returns {void}
   */
  createPanel(scene) {
    const style = PLAYER_GUIDE.style;
    const { width, height } = style;
    this.add(scene.add.rectangle(
      0, 0, width, height, style.interactionColor, style.interactionAlpha,
    )
      .setInteractive());
    const panel = scene.add.graphics();
    this.drawPanel(panel, width, height);
    this.add(panel);
  }

  /**
   * Zeichnet Füllung und Neonrahmen des Optionspanels.
   * @param {Phaser.GameObjects.Graphics} panel - Zeichenfläche.
   * @param {number} width - Panelbreite.
   * @param {number} height - Panelhöhe.
   * @returns {void}
   */
  drawPanel(panel, width, height) {
    const style = PLAYER_GUIDE.style;
    panel.fillStyle(style.backgroundColor, style.backgroundAlpha);
    panel.fillRoundedRect(
      -width / 2, -height / 2, width, height, style.cornerRadius,
    );
    panel.lineStyle(style.borderWidth, style.borderColor, style.borderAlpha);
    panel.strokeRoundedRect(
      -width / 2, -height / 2, width, height, style.cornerRadius,
    );
  }

  /**
   * Erstellt die zentrale Dialogüberschrift.
   * @param {Phaser.Scene} scene - Zugehörige Menüszene.
   * @returns {void}
   */
  createTitle(scene) {
    const dialog = PLAYER_GUIDE.dialog;
    const title = scene.add.text(dialog.titleX, dialog.titleY, PLAYER_GUIDE.title, {
      fontFamily: "Permanent Marker",
      fontSize: `${PLAYER_GUIDE.style.titleFontSize}px`,
      color: PLAYER_GUIDE.style.titleColor,
    }).setOrigin(0.5);
    this.add(title);
  }

  /**
   * Erstellt den maskierten Inhaltsbereich und seine Scrollleiste.
   * @param {Phaser.Scene} scene - Zugehörige Menüszene.
   * @returns {void}
   */
  createScrollArea(scene) {
    this.scrollView = new OptionsScrollView(
      scene, this, PLAYER_GUIDE.scroll,
    );
  }

  /**
   * Zeigt das Spielziel als kurze Einführung an.
   * @param {Phaser.Scene} scene - Zugehörige Menüszene.
   * @returns {void}
   */
  createGoal(scene) {
    const layout = PLAYER_GUIDE.contentLayout;
    const heading = this.createHeading(
      scene, 0, layout.goalTitleY, PLAYER_GUIDE.goal.title,
    );
    this.addToScroll(heading);
    const goal = this.createBodyText(
      scene, 0, heading.y + heading.height + layout.headingContentGap,
      PLAYER_GUIDE.goal.text, PLAYER_GUIDE.dialog.bodyWidth,
    );
    this.addToScroll(goal);
  }

  /**
   * Ordnet Desktop, Ton, Touch und Gamepad vertikal untereinander an.
   * @param {Phaser.Scene} scene - Zugehörige Menüszene.
   * @returns {void}
   */
  createInstructions(scene) {
    const layout = PLAYER_GUIDE.contentLayout;
    this.createControlSection(scene, 0, layout.desktopY, PLAYER_GUIDE.desktop);
    this.createControlSection(scene, 0, layout.touchY, PLAYER_GUIDE.touch);
    this.createControlSection(scene, 0, layout.gamepadY, PLAYER_GUIDE.gamepad);
  }

  /**
   * Erstellt eine Gruppe aus Überschrift und Eingabezeilen.
   * @param {Phaser.Scene} scene - Zugehörige Menüszene.
   * @param {number} x - Linke Position.
   * @param {number} y - Obere Position.
   * @param {{title: string, controls: ReadonlyArray}} section - Inhalte.
   * @returns {void}
   */
  createControlSection(scene, x, y, section) {
    const layout = PLAYER_GUIDE.contentLayout;
    const heading = this.createHeading(scene, x, y, section.title);
    this.addToScroll(heading);
    section.controls.forEach((control, index) => {
      const rowY = heading.y + heading.height
        + layout.headingContentGap + index * layout.rowGap;
      this.addToScroll(this.createControlRow(scene, x, rowY, control));
    });
  }

  /**
   * Fügt ein Element dem beweglichen Inhaltscontainer hinzu.
   * @param {Phaser.GameObjects.GameObject} gameObject - Neues Inhaltselement.
   * @returns {void}
   */
  addToScroll(gameObject) {
    this.scrollView.add(gameObject);
  }

  /**
   * Erstellt eine einzelne Zeile aus Taste und zugehöriger Aktion.
   * @param {Phaser.Scene} scene - Zugehörige Menüszene.
   * @param {number} x - Linke Position.
   * @param {number} y - Vertikale Position.
   * @param {{input: string, action: string}} control - Tastenbelegung.
   * @returns {Phaser.GameObjects.Container} Vollständige Zeile.
   */
  createControlRow(scene, x, y, control) {
    const layout = PLAYER_GUIDE.contentLayout;
    const row = scene.add.container(x, y);
    const marker = scene.add.text(
      layout.bulletX, layout.bulletY, "•", this.getListMarkerStyle(),
    );
    const itemText = `${control.input} – ${control.action}`;
    const item = scene.add.text(
      layout.textX, 0, itemText, this.getListItemStyle(),
    );
    row.add([marker, item]);
    return row;
  }

  /** @returns {Phaser.Types.GameObjects.Text.TextStyle} Stil der Listenmarker. */
  getListMarkerStyle() {
    return {
      fontFamily: "Arial",
      fontSize: `${PLAYER_GUIDE.style.bulletFontSize}px`,
      color: PLAYER_GUIDE.style.titleColor,
    };
  }

  /** @returns {Phaser.Types.GameObjects.Text.TextStyle} Stil der Listeneinträge. */
  getListItemStyle() {
    return {
      fontFamily: "Arial",
      fontSize: `${PLAYER_GUIDE.style.listFontSize}px`,
      color: PLAYER_GUIDE.style.textColor,
    };
  }

  /**
   * Erstellt eine grüne Abschnittsüberschrift.
   * @param {Phaser.Scene} scene - Zugehörige Menüszene.
   * @param {number} x - Linke Position.
   * @param {number} y - Obere Position.
   * @param {string} text - Sichtbare Beschriftung.
   * @returns {Phaser.GameObjects.Text} Erstellte Überschrift.
   */
  createHeading(scene, x, y, text) {
    return scene.add.text(x, y, text, {
      fontFamily: "Permanent Marker",
      fontSize: `${PLAYER_GUIDE.style.headingFontSize}px`,
      color: PLAYER_GUIDE.style.headingColor,
    });
  }

  /**
   * Erstellt umbrechenden Erklärungstext.
   * @param {Phaser.Scene} scene - Zugehörige Menüszene.
   * @param {number} x - Linke Position.
   * @param {number} y - Obere Position.
   * @param {string} text - Sichtbarer Inhalt.
   * @param {number} width - Maximale Textbreite.
   * @returns {Phaser.GameObjects.Text} Erstellter Text.
   */
  createBodyText(scene, x, y, text, width) {
    return scene.add.text(x, y, text, {
      fontFamily: "Arial",
      fontSize: `${PLAYER_GUIDE.style.bodyFontSize}px`,
      color: PLAYER_GUIDE.style.textColor,
      lineSpacing: PLAYER_GUIDE.style.bodyLineSpacing,
      wordWrap: { width },
    });
  }

  /**
   * Erstellt den globalen Tonumschalter innerhalb der Optionsansicht.
   * @param {Phaser.Scene} scene - Zugehörige Menüszene.
   * @returns {void}
   */
  createAudioAction(scene) {
    const layout = PLAYER_GUIDE.contentLayout;
    const heading = this.createAudioHeading(scene, layout.audioY);
    this.addToScroll(heading);
    this.audioAction = this.createAction(
      scene, PLAYER_GUIDE.dialog.audioActionX, 0, "",
      () => this.muteSystem.toggle(),
    );
    this.positionAudioAction(heading);
    this.addToScroll(this.audioAction);
  }

  /**
   * Erstellt die Überschrift für die globale Toneinstellung.
   * @param {Phaser.Scene} scene - Zugehörige Menüszene.
   * @param {number} y - Vertikale Position im Scrollinhalt.
   * @returns {Phaser.GameObjects.Text} Erstellte Überschrift.
   */
  createAudioHeading(scene, y) {
    return this.createHeading(scene, 0, y, PLAYER_GUIDE.audio.title);
  }

  /**
   * Platziert die Tonaktion mit dem definierten Abstand unter der Überschrift.
   * @param {Phaser.GameObjects.Text} heading - Zugehörige Überschrift.
   * @returns {void}
   */
  positionAudioAction(heading) {
    const gap = PLAYER_GUIDE.contentLayout.headingContentGap;
    this.audioAction.setY(heading.y + heading.height + gap
      + this.audioAction.height / 2);
  }

  /**
   * Erstellt X und Zurück-Aktion zum Schließen.
   * @param {Phaser.Scene} scene - Zugehörige Menüszene.
   * @returns {void}
   */
  createCloseActions(scene) {
    const dialog = PLAYER_GUIDE.dialog;
    const closeIcon = this.createAction(
      scene, dialog.closeIconX, dialog.closeIconY, "X", () => this.close(),
    );
    const closeButton = this.createAction(
      scene, dialog.closeButtonX, dialog.closeButtonY,
      PLAYER_GUIDE.closeLabel, () => this.close(),
    );
    this.add([closeIcon, closeButton]);
  }

  /**
   * Erstellt eine per Maus und Touch bedienbare Textaktion.
   * @param {Phaser.Scene} scene - Zugehörige Menüszene.
   * @param {number} x - Horizontale Position.
   * @param {number} y - Vertikale Position.
   * @param {string} label - Sichtbare Beschriftung.
   * @param {() => void} callback - Auszuführende Aktion.
   * @returns {Phaser.GameObjects.Text} Interaktive Aktion.
   */
  createAction(scene, x, y, label, callback) {
    const action = scene.add.text(x, y, label, {
      fontFamily: "Permanent Marker",
      fontSize: `${PLAYER_GUIDE.style.actionFontSize}px`,
      color: PLAYER_GUIDE.style.mutedTextColor,
      backgroundColor: PLAYER_GUIDE.style.actionBackgroundColor,
      padding: {
        x: PLAYER_GUIDE.style.actionPaddingX,
        y: PLAYER_GUIDE.style.actionPaddingY,
      },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    action.on("pointerover", () => action.setColor(PLAYER_GUIDE.style.titleColor));
    action.on("pointerout", () => action.setColor(PLAYER_GUIDE.style.mutedTextColor));
    action.on("pointerup", callback);
    return action;
  }

  /** Verknüpft die Anzeige mit dem persistenten globalen Tonzustand. */
  subscribeToMuteState() {
    this.unsubscribeMute = this.muteSystem.onChange((muted) => {
      const audio = PLAYER_GUIDE.audio;
      this.audioAction?.setText(muted ? audio.mutedLabel : audio.enabledLabel);
    });
  }

  /**
   * Schließt die Optionsansicht per Escape.
   * @param {Phaser.Scene} scene - Zugehörige Menüszene.
   * @returns {void}
   */
  bindKeyboard(scene) {
    this.keyboard = scene.input.keyboard;
    this.escapeHandler = (event) => {
      if (!event.repeat) this.close();
    };
    this.keyboard?.on("keydown-ESC", this.escapeHandler);
  }

  /** Entfernt Listener und schließt den Dialog genau einmal. */
  close() {
    if (this.isClosed) return;
    this.isClosed = true;
    this.keyboard?.off("keydown-ESC", this.escapeHandler);
    this.unsubscribeMute?.();
    this.displaySection?.destroy();
    this.scrollView?.destroy();
    const callback = this.onClose;
    this.destroy(true);
    callback?.();
  }
}
