import Phaser from "phaser";
import { PLAYER_GUIDE } from "../../js/config/player-guide-settings.js";
import { OptionsScrollView } from "./options-scroll-view.class.js";
import { OptionsDisplaySection } from "./options-display-section.class.js";

/**
 * Defines the OptionsDialogOptions data structure.
 * @typedef {Object} OptionsDialogOptions
 * @property {import("../systems/global-mute-system.class.js").GlobalMuteSystem} muteSystem - The mute system value.
 * @property {import("../systems/global-display-system.class.js").GlobalDisplaySystem} displaySystem - The display system value.
 * @property {(() => void)|null} [onClose=null] - The on close value.
 */

/**
 * Manages options dialog behavior.
 */
export class OptionsDialog extends Phaser.GameObjects.Container {
  /**
   * Creates a new instance.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {OptionsDialogOptions} options - The optional configuration values.
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
   * Handles build.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
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
   * Creates backdrop.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
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
   * Creates panel.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
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
   * Draws panel.
   * @param {Phaser.GameObjects.Graphics} panel - The panel value.
   * @param {number} width - The width in pixels.
   * @param {number} height - The height in pixels.
   * @returns {void} No value is returned.
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
   * Creates title.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
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
   * Creates scroll area.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  createScrollArea(scene) {
    this.scrollView = new OptionsScrollView(
      scene, this, PLAYER_GUIDE.scroll,
    );
  }

  /**
   * Creates goal.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
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
   * Creates instructions.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  createInstructions(scene) {
    const layout = PLAYER_GUIDE.contentLayout;
    this.createControlSection(scene, 0, layout.desktopY, PLAYER_GUIDE.desktop);
    this.createControlSection(scene, 0, layout.touchY, PLAYER_GUIDE.touch);
    this.createControlSection(scene, 0, layout.gamepadY, PLAYER_GUIDE.gamepad);
  }

  /**
   * Creates control section.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {number} x - The horizontal position.
   * @param {number} y - The vertical position.
   * @param {{title: string, controls: ReadonlyArray}} section - The section value.
   * @returns {void} No value is returned.
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
   * Adds to scroll.
   * @param {Phaser.GameObjects.GameObject} gameObject - The game object value.
   * @returns {void} No value is returned.
   */
  addToScroll(gameObject) {
    this.scrollView.add(gameObject);
  }

  /**
   * Creates control row.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {number} x - The horizontal position.
   * @param {number} y - The vertical position.
   * @param {{input: string, action: string}} control - The control value.
   * @returns {Phaser.GameObjects.Container} The resulting data object.
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

  /**
   * Returns list marker style.
   * @returns {Phaser.Types.GameObjects.Text.TextStyle} The resulting data object.
   */
  getListMarkerStyle() {
    return {
      fontFamily: "Arial",
      fontSize: `${PLAYER_GUIDE.style.bulletFontSize}px`,
      color: PLAYER_GUIDE.style.titleColor,
    };
  }

  /**
   * Returns list item style.
   * @returns {Phaser.Types.GameObjects.Text.TextStyle} The resulting data object.
   */
  getListItemStyle() {
    return {
      fontFamily: "Arial",
      fontSize: `${PLAYER_GUIDE.style.listFontSize}px`,
      color: PLAYER_GUIDE.style.textColor,
    };
  }

  /**
   * Creates heading.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {number} x - The horizontal position.
   * @param {number} y - The vertical position.
   * @param {string} text - The text value.
   * @returns {Phaser.GameObjects.Text} The resulting data object.
   */
  createHeading(scene, x, y, text) {
    return scene.add.text(x, y, text, {
      fontFamily: "Permanent Marker",
      fontSize: `${PLAYER_GUIDE.style.headingFontSize}px`,
      color: PLAYER_GUIDE.style.headingColor,
    });
  }

  /**
   * Creates body text.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {number} x - The horizontal position.
   * @param {number} y - The vertical position.
   * @param {string} text - The text value.
   * @param {number} width - The width in pixels.
   * @returns {Phaser.GameObjects.Text} The resulting data object.
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
   * Creates audio action.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
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
   * Creates audio heading.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {number} y - The vertical position.
   * @returns {Phaser.GameObjects.Text} The resulting data object.
   */
  createAudioHeading(scene, y) {
    return this.createHeading(scene, 0, y, PLAYER_GUIDE.audio.title);
  }

  /**
   * Handles position audio action.
   * @param {Phaser.GameObjects.Text} heading - The heading value.
   * @returns {void} No value is returned.
   */
  positionAudioAction(heading) {
    const gap = PLAYER_GUIDE.contentLayout.headingContentGap;
    this.audioAction.setY(heading.y + heading.height + gap
      + this.audioAction.height / 2);
  }

  /**
   * Creates close actions.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
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
   * Creates action.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {number} x - The horizontal position.
   * @param {number} y - The vertical position.
   * @param {string} label - The label value.
   * @param {() => void} callback - The callback to invoke.
   * @returns {Phaser.GameObjects.Text} The resulting data object.
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

  /**
   * Handles subscribe to mute state.
   */
  subscribeToMuteState() {
    this.unsubscribeMute = this.muteSystem.onChange((muted) => {
      const audio = PLAYER_GUIDE.audio;
      this.audioAction?.setText(muted ? audio.mutedLabel : audio.enabledLabel);
    });
  }

  /**
   * Binds keyboard.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @returns {void} No value is returned.
   */
  bindKeyboard(scene) {
    this.keyboard = scene.input.keyboard;
    this.escapeHandler = (event) => {
      if (!event.repeat) this.close();
    };
    this.keyboard?.on("keydown-ESC", this.escapeHandler);
  }

  /**
   * Handles close.
   */
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
