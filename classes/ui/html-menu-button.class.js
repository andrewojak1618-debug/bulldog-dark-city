/**
 * Manages html menu button behavior.
 */
export class HtmlMenuButton {
  /**
   * Creates a new instance.
   * @param {HTMLButtonElement} element - The element value.
   * @param {Object} options - The optional configuration values.
   */
  constructor(element, options) {
    this.element = element;
    this.menuAction = options.action;
    this.onActivate = options.onActivate;
    this.onFocus = options.onFocus;
    this.isDisabled = false;
    this.bindEvents();
  }

  /**
   * Binds events.
   */
  bindEvents() {
    this.handleFocus = (event) => this.focus(event);
    this.handleClick = () => this.activate();
    this.handleKeydown = (event) => this.preventNativeRepeat(event);
    this.element.addEventListener("pointerenter", this.handleFocus);
    this.element.addEventListener("focus", this.handleFocus);
    this.element.addEventListener("click", this.handleClick);
    this.element.addEventListener("keydown", this.handleKeydown);
  }

  /**
   * Handles prevent native repeat.
   */
  preventNativeRepeat(event) {
    if (event.key === "Enter" || event.code === "Space") event.preventDefault();
  }

  /**
   * Handles focus.
   * @param {PointerEvent|FocusEvent} event - The triggering event.
   */
  focus(event) {
    const pointerType = event.pointerType || "keyboard";
    this.onFocus?.(this, { pointerType });
  }

  /**
   * Handles activate.
   */
  activate() {
    if (this.isDisabled) return false;
    this.onActivate?.(this);
    return true;
  }

  /**
   * Sets selected.
   * @param {boolean} selected - The selected value.
   * @returns {HtmlMenuButton} The resulting value.
   */
  setSelected(selected = true) {
    this.element.setAttribute("aria-current", String(selected));
    return this;
  }

  /**
   * Sets disabled.
   * @param {boolean} disabled - The disabled value.
   * @returns {HtmlMenuButton} The resulting value.
   */
  setDisabled(disabled = true) {
    this.isDisabled = disabled;
    this.element.disabled = disabled;
    return this;
  }

  /**
   * Releases the current state.
   */
  destroy() {
    this.element.removeEventListener("pointerenter", this.handleFocus);
    this.element.removeEventListener("focus", this.handleFocus);
    this.element.removeEventListener("click", this.handleClick);
    this.element.removeEventListener("keydown", this.handleKeydown);
  }
}
