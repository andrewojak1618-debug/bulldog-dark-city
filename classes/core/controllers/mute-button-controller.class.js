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
}
