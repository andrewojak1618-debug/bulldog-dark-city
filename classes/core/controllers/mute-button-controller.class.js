let activeMuteButtonController = null;

/**
 * Blendet den globalen Mute-Button bei Szenen- und Videowechseln ein oder aus.
 * @param {boolean} isVisible - Gewünschte Sichtbarkeit des Buttons.
 * @returns {void}
 */
export function setMuteButtonVisibility(isVisible) {
  activeMuteButtonController?.setVisible(isVisible);
}

/**
 * Wechselt zwischen der Menü- und Spielposition des globalen Mute-Buttons.
 * @param {boolean} isGameMode - Ob die Position oberhalb des HUDs aktiv ist.
 * @returns {void}
 */
export function setMuteButtonGameMode(isGameMode) {
  activeMuteButtonController?.setGameMode(isGameMode);
}

/** Steuert den globalen, barrierearmen Mute-Button außerhalb des Canvas. */
export class MuteButtonController {
  /**
   * Verknüpft den sichtbaren Button mit dem globalen Audiozustand.
   * @param {import(
   * "../../systems/global-mute-system.class.js"
   * ).GlobalMuteSystem} muteSystem - Zentrale Audiosteuerung.
   * @param {HTMLButtonElement|null} [button=document.getElementById(
   * "mute-toggle"
   * )] - Globaler Mute-Button.
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
   * Aktualisiert Symbol, Tooltip und Screenreader-Information gemeinsam.
   * @param {boolean} muted - Aktueller globaler Mute-Zustand.
   * @returns {void}
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
   * Schaltet Sichtbarkeit und Bedienbarkeit gemeinsam um.
   * @param {boolean} isVisible - Ob der Button angezeigt werden soll.
   * @returns {void}
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
   * Positioniert den Button passend zum Menü oder zum Level-HUD.
   * @param {boolean} isGameMode - Ob die Spielposition verwendet wird.
   * @returns {void}
   */
  setGameMode(isGameMode) {
    this.button?.classList.toggle("mute-toggle--game", isGameMode);
  }
}
