import { BULLDOG_EVENTS } from
  "../../js/config/bulldog-animation-settings.js";
import { TOUCH_ACTIONS, TOUCH_CONTROLS } from
  "../../js/config/touch-control-settings.js";
import { TouchControlButton } from
  "../ui/touch-control-button.class.js";
import { InputDeviceDetector } from
  "./input-device-detector.class.js";

/** Erstellt und verwaltet die mobile Steuerung einer Gameplay-Szene. */
export class TouchControlSystem {
  /**
   * Erstellt Touchbuttons nur auf Touchgeräten oder im lokalen Debugmodus.
   * @param {Phaser.Scene} scene - Aktive Gameplay-Szene.
   * @param {import("./input-system.class.js").InputSystem} input - Eingaben.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - Spielfigur.
   * @param {{showThrowControls?: boolean}} [options={}] - Leveloptionen.
   * @returns {TouchControlSystem|null} Steuerung oder null auf Desktop.
   */
  static create(scene, input, player, options = {}) {
    if (!this.isSupported()) return null;
    return new TouchControlSystem(scene, input, player, options);
  }

  /**
   * Erkennt Touchgeräte und den ausschließlich lokalen Testschalter.
   * @returns {boolean} Ob Touchbuttons angezeigt werden sollen.
   */
  static isSupported() {
    return InputDeviceDetector.isTouchLayout();
  }

  /**
   * Erstellt Buttons und bindet sichere Rücksetzereignisse.
   * @param {Phaser.Scene} scene - Aktive Gameplay-Szene.
   * @param {import("./input-system.class.js").InputSystem} input - Eingaben.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - Spielfigur.
   * @param {{showThrowControls?: boolean}} options - Leveloptionen.
   */
  constructor(scene, input, player, options) {
    this.scene = scene;
    this.input = input;
    this.player = player;
    this.releaseControls = () => this.releaseAll();
    this.preventContextMenu = (event) => event.preventDefault();
    const controls = this.getVisibleControls(options.showThrowControls);
    this.buttons = controls.map((settings) =>
      new TouchControlButton(scene, settings, (action, isPressed) =>
        input.setTouchAction(action, isPressed)),
    );
    this.hideEmptyThrowControls();
    this.bindLifecycle();
  }

  /**
   * Filtert Wurfbuttons außerhalb des dritten Levels heraus.
   * @param {boolean} showThrowControls - Ob K- und L-Buttons benötigt werden.
   * @returns {Object[]} Sichtbare Buttonkonfigurationen.
   */
  getVisibleControls(showThrowControls = false) {
    return TOUCH_CONTROLS.controls.filter(
      (control) => showThrowControls || !control.throwControl,
    );
  }

  /**
   * Verbirgt Wurfbuttons, bis der passende Knochen eingesammelt wurde.
   * @returns {void}
   */
  hideEmptyThrowControls() {
    this.buttons.filter((button) => button.settings.throwControl)
      .forEach((button) => {
        button.setControlEnabled(false);
        button.setVisible(false);
      });
  }

  /**
   * Verbindet die mobilen Wurfbuttons mit dem aktuellen Knochenvorrat.
   * @param {import("../systems/throw-bone-inventory.class.js").ThrowBoneInventory}
   * inventory - Vorrat des dritten Levels.
   * @returns {void}
   */
  bindThrowInventory(inventory) {
    this.throwInventoryUnsubscribe?.();
    this.throwInventoryUnsubscribe = inventory.onChange((type, count) => {
      this.updateThrowControl(type, count);
    });
  }

  /**
   * Schaltet genau den Button der veränderten Knochenart sichtbar oder aus.
   * @param {"normal"|"nuclear"} type - Veränderte Knochenart.
   * @param {number} count - Aktuell verfügbarer Vorrat.
   * @returns {void}
   */
  updateThrowControl(type, count) {
    const action = type === "normal" ?
      TOUCH_ACTIONS.normalBone : TOUCH_ACTIONS.nuclearBone;
    const button = this.buttons.find(
      (candidate) => candidate.settings.action === action,
    );
    if (!button) return;
    const isAvailable = count > 0;
    button.setControlEnabled(isAvailable);
    button.setVisible(isAvailable);
  }

  /**
   * Bindet K.-o., Fokusverlust, Drehung und Szenenende sicher an die Controls.
   * @returns {void}
   */
  bindLifecycle() {
    this.player.once(BULLDOG_EVENTS.knockedOut, () => this.disable());
    window.addEventListener("blur", this.releaseControls);
    window.addEventListener("orientationchange", this.releaseControls);
    document.addEventListener("visibilitychange", this.releaseControls);
    this.scene.game.canvas.addEventListener(
      "contextmenu",
      this.preventContextMenu,
    );
    this.scene.events.once("shutdown", () => this.destroy());
  }

  /**
   * Löst alle gehaltenen Buttons und leert die Touchzustände.
   * @returns {void}
   */
  releaseAll() {
    this.buttons.forEach((button) => button.release());
    this.input.clearTouchState();
  }

  /**
   * Sperrt und versteckt alle Controls nach dem K.-o. der Spielfigur.
   * @returns {void}
   */
  disable() {
    this.buttons.forEach((button) => button.setControlEnabled(false));
    this.buttons.forEach((button) => button.setVisible(false));
    this.input.clearTouchState();
  }

  /**
   * Entfernt globale Browserereignisse beim Szenenwechsel.
   * @returns {void}
   */
  destroy() {
    this.releaseAll();
    this.throwInventoryUnsubscribe?.();
    this.throwInventoryUnsubscribe = null;
    window.removeEventListener("blur", this.releaseControls);
    window.removeEventListener("orientationchange", this.releaseControls);
    document.removeEventListener("visibilitychange", this.releaseControls);
    this.scene.game.canvas.removeEventListener(
      "contextmenu",
      this.preventContextMenu,
    );
  }
}
