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
   * Erstellt eine responsive Steuerung, die sich dem Gerätetyp anpasst.
   * @param {Phaser.Scene} scene - Aktive Gameplay-Szene.
   * @param {import("./input-system.class.js").InputSystem} input - Eingaben.
   * @param {import("../entities/characters/bulldog.class.js").Bulldog} player - Spielfigur.
   * @param {{showThrowControls?: boolean}} [options={}] - Leveloptionen.
   * @returns {TouchControlSystem} Responsive Steuerung der Gameplay-Szene.
   */
  static create(scene, input, player, options = {}) {
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
    this.isDisabled = false;
    this.isTouchLayoutVisible = false;
    this.throwAvailability = new Map();
    this.releaseControls = () => this.releaseAll();
    this.handleViewportChange = () => {
      this.releaseAll();
      this.updateLayoutVisibility();
    };
    this.preventContextMenu = (event) => event.preventDefault();
    const controls = this.getVisibleControls(options.showThrowControls);
    this.buttons = controls.map((settings) =>
      new TouchControlButton(scene, settings, (action, isPressed) =>
        input.setTouchAction(action, isPressed)),
    );
    this.hideEmptyThrowControls();
    this.updateLayoutVisibility();
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
        this.throwAvailability.set(button.settings.action, false);
        button.setControlEnabled(false);
        button.setControlVisible(false);
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
    this.throwAvailability.set(action, isAvailable);
    button.setControlEnabled(isAvailable);
    button.setControlVisible(
      this.isTouchLayoutVisible && !this.isDisabled && isAvailable,
    );
  }

  /**
   * Synchronisiert alle Buttons mit Mobil-, Tablet- oder Desktoplayout.
   * @returns {void}
   */
  updateLayoutVisibility() {
    this.isTouchLayoutVisible = TouchControlSystem.isSupported();
    this.buttons.forEach((button) => {
      const isThrowControl = Boolean(button.settings.throwControl);
      const isAvailable = !isThrowControl ||
        this.throwAvailability.get(button.settings.action) === true;
      button.setControlVisible(
        this.isTouchLayoutVisible && !this.isDisabled && isAvailable,
      );
    });
  }

  /**
   * Bindet K.-o., Fokusverlust, Drehung und Szenenende sicher an die Controls.
   * @returns {void}
   */
  bindLifecycle() {
    this.player.once(BULLDOG_EVENTS.knockedOut, () => this.disable());
    window.addEventListener("blur", this.releaseControls);
    window.addEventListener("resize", this.handleViewportChange);
    window.addEventListener("orientationchange", this.handleViewportChange);
    window.visualViewport?.addEventListener(
      "resize",
      this.handleViewportChange,
    );
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
    this.isDisabled = true;
    this.buttons.forEach((button) => button.setControlEnabled(false));
    this.buttons.forEach((button) => button.setControlVisible(false));
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
    window.removeEventListener("resize", this.handleViewportChange);
    window.removeEventListener(
      "orientationchange",
      this.handleViewportChange,
    );
    window.visualViewport?.removeEventListener(
      "resize",
      this.handleViewportChange,
    );
    document.removeEventListener("visibilitychange", this.releaseControls);
    this.scene.game.canvas.removeEventListener(
      "contextmenu",
      this.preventContextMenu,
    );
  }
}
