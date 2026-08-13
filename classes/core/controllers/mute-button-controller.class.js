let activeMuteButtonController = null;

/**
 * Sets mute button visibility.
 * @param {boolean} isVisible - The is visible value.
 * @returns {void} No value is returned.
 */
export function setMuteButtonVisibility(isVisible) {
  activeMuteButtonController?.setVisible(isVisible);
}

/**
 * Sets mute button game mode.
 * @param {boolean} isGameMode - The is game mode value.
 * @returns {void} No value is returned.
 */
export function setMuteButtonGameMode(isGameMode) {
  activeMuteButtonController?.setGameMode(isGameMode);
}

/**
 * Manages mute button controller behavior.
 */
export class MuteButtonController {
  /**
   * Creates a new instance.
   * @param {import( "../../systems/global-mute-system.class.js" ).GlobalMuteSystem} muteSystem - The mute system value.
   * @param {HTMLButtonElement|null} [button=document.getElementById( "mute-toggle" )] - The button value.
   */
  constructor(
    muteSystem,
    button = document.getElementById("mute-toggle"),
  ) {
    this.muteSystem = muteSystem;
    this.button = button;
    activeMuteButtonController = this;
    this.handleClick = () => this.muteSystem.toggle();
    this.button?.addEventListener("click", this.handleClick);
    this.unsubscribe = this.muteSystem.onChange((muted) =>
      this.render(muted),
    );
  }

  /**
   * Renders the current state.
   * @param {boolean} muted - The muted value.
   * @returns {void} No value is returned.
   */
  render(muted) {
    if (!this.button) return;
    const actionLabel = muted
      ? "Alle Töne einschalten"
      : "Alle Töne stummschalten";
    this.button.textContent = muted ? "🔇" : "🔊";
    this.button.setAttribute("aria-label", actionLabel);
    this.button.setAttribute("aria-pressed", String(muted));
    this.button.title = actionLabel;
  }

  /**
   * Sets visible.
   * @param {boolean} isVisible - The is visible value.
   * @returns {void} No value is returned.
   */
  setVisible(isVisible) {
    if (!this.button) return;
    const isHidden = !isVisible;
    this.button.classList.toggle("mute-toggle--hidden", isHidden);
    this.button.disabled = isHidden;
    this.button.setAttribute("aria-hidden", String(isHidden));
    if (isHidden) this.button.blur();
  }

  /**
   * Sets game mode.
   * @param {boolean} isGameMode - The is game mode value.
   * @returns {void} No value is returned.
   */
  setGameMode(isGameMode) {
    this.button?.classList.toggle("mute-toggle--game", isGameMode);
  }
}
