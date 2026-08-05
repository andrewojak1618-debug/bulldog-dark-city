import { COLLECTIBLE_KEYS, HUD } from "../../js/config/hud-settings.js";

/** Steuert Freischaltung und HUD-Wechsel der vorbereiteten Mutation. */
export class MutationSystem {
  /**
   * Verknüpft Eingabevoraussetzung und beide HUD-Zustände.
   * @param {Phaser.Scene} scene - Zugehörige Spielszene.
   * @param {import("./collectible-system.class.js").CollectibleSystem}
   * collectibles - Aktuelle Sammelstände.
   * @param {Phaser.GameObjects.Container[]} normalHud - Normale Anzeigen.
   * @param {import("../ui/mutation-bar.class.js").MutationBar} mutationBar -
   * Vorbereiteter Mutationsrahmen.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog|null}
   * player - Verwandelbare Spielfigur.
   */
  constructor(scene, collectibles, normalHud, mutationBar, player) {
    this.scene = scene;
    this.collectibles = collectibles;
    this.normalHud = normalHud;
    this.mutationBar = mutationBar;
    this.player = player;
    this.isActive = false;
  }

  /**
   * Prüft die Tastenkombination einmal pro Szenenupdate.
   * @param {import("../input/input-system.class.js").InputSystem} input -
   * Aktuelle Spielereingaben.
   * @returns {boolean} `true`, wenn die Mutation neu aktiviert wurde.
   */
  update(input) {
    if (!input.consumeMutation()) return false;
    return this.activate();
  }

  /**
   * Aktiviert den HUD-Wechsel nur bei vollständig gefülltem Serumrahmen.
   * @returns {boolean} `true`, wenn der Zustand neu aktiviert wurde.
   */
  activate() {
    if (this.isActive || !this.hasFullSerum()) return false;
    if (!this.player?.startMutation()) return false;
    this.isActive = true;
    this.hideNormalHud();
    this.mutationBar.show();
    return true;
  }

  /**
   * Prüft den Serumzähler gegen dessen zentral konfiguriertes Maximum.
   * @returns {boolean} `true`, wenn zwei Serum-Items gesammelt wurden.
   */
  hasFullSerum() {
    return this.collectibles.getCount(COLLECTIBLE_KEYS.serum) >=
      HUD.serum.fill.maximum;
  }

  /**
   * Lässt Lebens-, Coin- und Serumanzeige gemeinsam nach links ausfliegen.
   * @returns {Phaser.Tweens.Tween} Laufender Ausblendtween.
   */
  hideNormalHud() {
    const settings = HUD.mutation;
    return this.scene.tweens.add({
      targets: this.normalHud,
      x: settings.normalHudExitX,
      alpha: 0,
      duration: settings.exitDurationMs,
      ease: "Back.easeIn",
      onComplete: () => this.hideNormalHudContainers(),
    });
  }

  /**
   * Verbirgt die vollständig aus dem Canvas bewegten Normalanzeigen.
   * @returns {void}
   */
  hideNormalHudContainers() {
    this.normalHud.forEach((item) => item.setVisible(false));
  }
}
