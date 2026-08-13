import { HtmlMenuButton } from "./html-menu-button.class.js";
import { MENU_BUTTONS } from "../../js/config/menu-buttons.js";
import { MENU_START_TRANSITION } from
  "../../js/config/menu-transition-settings.js";

const INPUT_HINTS = Object.freeze({
  keyboard: "W/S · ENTER / LEERTASTE",
  gamepad: "STEUERKREUZ · A ZUM BESTÄTIGEN",
  mouse: "MAUS · KLICK ZUM AUSWÄHLEN",
  touch: "ANTIPPEN ZUM AUSWÄHLEN",
});

const INPUT_HINT_DURATION = Object.freeze({
  keyboard: 5000,
  touch: 3000,
});

const LOCKED_FEATURES = Object.freeze({
  upgrades: Object.freeze({
    title: "UPGRADES NOCH NICHT ERREICHT",
    message: "Dieser Bereich wird nach dem erfolgreichen Spielabschluss freigeschaltet.",
  }),
  extras: Object.freeze({
    title: "EXTRAS NOCH NICHT ERREICHT",
    message: "Zusätzliche Inhalte werden nach dem erfolgreichen Spielabschluss freigeschaltet.",
  }),
});

/**
 * Manages html menu interface behavior.
 */
export class HtmlMenuInterface {
  /**
   * Creates a new instance.
   * @param {Phaser.Scene} scene - The active Phaser scene.
   * @param {Object} callbacks - The callbacks value.
   */
  constructor(scene, callbacks) {
    this.scene = scene;
    this.root = document.getElementById("menu-interface");
    this.hint = document.getElementById("menu-input-hint");
    this.version = this.root.querySelector(".menu-interface__version");
    this.dialog = document.getElementById("locked-feature-dialog");
    this.closeButton = this.dialog?.querySelector("[data-dialog-close]");
    if (this.closeButton) this.closeButton.tabIndex = -1;
    this.buttons = this.createButtons(callbacks);
    this.bindDialogEvents();
  }

  /**
   * Creates buttons.
   */
  createButtons(callbacks) {
    return MENU_BUTTONS.map((config) => {
      const selector = `[data-menu-action="${config.action}"]`;
      const element = this.root.querySelector(selector);
      return new HtmlMenuButton(element, { ...callbacks, action: config.action });
    });
  }

  /**
   * Binds dialog events.
   */
  bindDialogEvents() {
    this.handleClose = () => this.closeFeatureDialog();
    this.handleKeydown = (event) => this.closeOnEscape(event);
    this.closeButton?.addEventListener("click", this.handleClose);
    document.addEventListener("keydown", this.handleKeydown);
  }

  /**
   * Shows the current state.
   */
  show() {
    this.root.classList.remove("menu-interface--exiting");
    this.root.classList.add("menu-interface--visible");
    this.root.setAttribute("aria-hidden", "false");
    this.setButtonsFocusable(true);
  }

  /**
   * Hides the current state.
   */
  hide() {
    this.root.classList.remove("menu-interface--visible");
    this.root.setAttribute("aria-hidden", "true");
    this.setButtonsFocusable(false);
  }

  /**
   * Sets buttons focusable.
   * @param {boolean} focusable - The focusable value.
   */
  setButtonsFocusable(focusable) {
    this.buttons.forEach(({ element }) => {
      element.tabIndex = focusable ? 0 : -1;
    });
  }

  /**
   * Sets input mode.
   * @param {string} inputMode - The input mode value.
   */
  setInputMode(inputMode) {
    this.hint.textContent = INPUT_HINTS[inputMode] ?? INPUT_HINTS.keyboard;
  }

  /**
   * Shows initial hint.
   */
  showInitialHint(isTouchLayout) {
    const inputMode = isTouchLayout ? "touch" : "keyboard";
    const duration = INPUT_HINT_DURATION[inputMode];
    this.setInputMode(inputMode);
    this.hint.classList.remove("menu-interface__input-hint--hidden");
    this.version.classList.add("menu-interface__version--hidden");
    this.hintTimer = this.scene.time.delayedCall(duration, () => {
      this.hint.classList.add("menu-interface__input-hint--hidden");
      this.version.classList.remove("menu-interface__version--hidden");
    });
  }

  /**
   * Handles animate exit.
   */
  animateExit() {
    const duration = MENU_START_TRANSITION.flyOut.duration;
    this.root.style.setProperty("--menu-exit-duration", `${duration}ms`);
    this.root.classList.add("menu-interface--exiting");
    this.setButtonsFocusable(false);
    this.scene.time.delayedCall(duration, () => this.hide());
  }

  /**
   * Opens feature dialog.
   * @param {string} action - The requested action.
   * @param {Function} onClose - The on close value.
   * @returns {HTMLElement|null} The resulting value.
   */
  openFeatureDialog(action, onClose) {
    const content = LOCKED_FEATURES[action];
    if (!content || !this.dialog) return null;
    this.onDialogClose = onClose;
    this.dialogTrigger = this.getButtonElement(action);
    this.applyDialogContent(content);
    this.dialog.classList.add("locked-feature-dialog--visible");
    this.dialog.setAttribute("aria-hidden", "false");
    this.setButtonsFocusable(false);
    this.closeButton.tabIndex = 0;
    this.closeButton?.focus();
    return this.dialog;
  }

  /**
   * Returns button element.
   */
  getButtonElement(action) {
    return this.buttons.find(({ menuAction }) => menuAction === action)?.element;
  }

  /**
   * Applies dialog content.
   */
  applyDialogContent(content) {
    document.getElementById("locked-feature-title").textContent = content.title;
    document.getElementById("locked-feature-message").textContent = content.message;
  }

  /**
   * Handles close feature dialog.
   */
  closeFeatureDialog() {
    if (!this.dialog?.classList.contains("locked-feature-dialog--visible")) return;
    this.dialog.classList.remove("locked-feature-dialog--visible");
    this.dialog.setAttribute("aria-hidden", "true");
    this.closeButton.tabIndex = -1;
    this.setButtonsFocusable(true);
    this.dialogTrigger?.focus();
    this.dialogTrigger = null;
    const onClose = this.onDialogClose;
    this.onDialogClose = null;
    onClose?.();
  }

  /**
   * Handles close on escape.
   */
  closeOnEscape(event) {
    if (event.key !== "Escape") return;
    this.closeFeatureDialog();
  }

  /**
   * Releases the current state.
   */
  destroy() {
    this.hintTimer?.remove(false);
    this.buttons.forEach((button) => button.destroy());
    this.closeButton?.removeEventListener("click", this.handleClose);
    document.removeEventListener("keydown", this.handleKeydown);
    this.dialog?.classList.remove("locked-feature-dialog--visible");
    this.root.classList.remove("menu-interface--exiting");
    this.hide();
  }
}
