/**
 * Manages loading overlay behavior.
 */
export class LoadingOverlay {
  /**
   * Returns element.
   */
  static getElement() {
    return globalThis.document?.getElementById("level-loading-overlay") ?? null;
  }

  /**
   * Shows the current state.
   */
  static show(message) {
    const overlay = this.getElement();
    if (!overlay) return null;
    overlay.classList.remove("level-loading-overlay--error");
    const label = overlay.querySelector("[data-loading-message]");
    if (label) label.textContent = message;
    overlay.setAttribute("aria-hidden", "false");
    overlay.classList.add("level-loading-overlay--visible");
    return overlay;
  }

  /**
   * Hides the current state.
   */
  static hide() {
    const overlay = this.getElement();
    overlay?.classList.remove("level-loading-overlay--visible");
    overlay?.setAttribute("aria-hidden", "true");
  }

  /**
   * Shows error.
   */
  static showError(message) {
    const overlay = this.show(message);
    overlay?.classList.add("level-loading-overlay--error");
  }
}
